import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { generateBarcode } from '../../utils/barcodeGenerator.js';
import { UnitTypeValue } from '../../config/constants.js';

interface CreateProductInput {
  name: string;
  category?: string;
  unitType?: UnitTypeValue;
  pricePerUnit: number;
  barcodeValue?: string;
  initialStock?: number;
  lowStockThreshold?: number;
}

interface UpdateProductInput {
  name?: string;
  category?: string;
  unitType?: UnitTypeValue;
  pricePerUnit?: number;
  barcodeValue?: string;
  lowStockThreshold?: number;
}

interface ProductQueryParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export class ProductService {
  /**
   * Create a new product for a shop with automatic barcode and stock record
   */
  static async createProduct(shopId: string, input: CreateProductInput) {
    const barcodeValue = input.barcodeValue?.trim() || generateBarcode();

    // Check if barcode is already used in this shop
    const existing = await prisma.product.findUnique({
      where: {
        shopId_barcodeValue: {
          shopId,
          barcodeValue,
        },
      },
    });

    if (existing) {
      throw ApiError.conflict(`A product with barcode "${barcodeValue}" already exists in your shop.`);
    }

    const product = await prisma.product.create({
      data: {
        shopId,
        name: input.name,
        category: input.category || 'General',
        unitType: (input.unitType as any) || 'PIECE',
        pricePerUnit: input.pricePerUnit,
        barcodeValue,
        stock: {
          create: {
            quantity: input.initialStock ?? 0,
            lowStockThreshold: input.lowStockThreshold ?? 5,
          },
        },
      },
      include: {
        stock: true,
      },
    });

    return product;
  }

  /**
   * Get all products for a shop with optional search and category filters
   */
  static async getProducts(shopId: string, params: ProductQueryParams) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 100;
    const skip = (page - 1) * limit;

    const where: any = { shopId };

    if (params.category && params.category !== 'ALL') {
      where.category = params.category;
    }

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { barcodeValue: { contains: params.search, mode: 'insensitive' } },
        { category: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { stock: true },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Look up a single product by exact barcode (for fast scanner lookup)
   */
  static async getProductByBarcode(shopId: string, barcodeValue: string) {
    const product = await prisma.product.findUnique({
      where: {
        shopId_barcodeValue: {
          shopId,
          barcodeValue,
        },
      },
      include: { stock: true },
    });

    if (!product) {
      throw ApiError.notFound(`No product found with barcode "${barcodeValue}"`);
    }

    return product;
  }

  /**
   * Get a product by ID
   */
  static async getProductById(shopId: string, productId: string) {
    const product = await prisma.product.findFirst({
      where: { id: productId, shopId },
      include: { stock: true },
    });

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    return product;
  }

  /**
   * Update a product
   */
  static async updateProduct(shopId: string, productId: string, input: UpdateProductInput) {
    await this.getProductById(shopId, productId);

    if (input.barcodeValue) {
      const existing = await prisma.product.findFirst({
        where: {
          shopId,
          barcodeValue: input.barcodeValue,
          id: { not: productId },
        },
      });

      if (existing) {
        throw ApiError.conflict(`Barcode "${input.barcodeValue}" is already used by another product.`);
      }
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.category !== undefined && { category: input.category }),
        ...(input.unitType && { unitType: input.unitType as any }),
        ...(input.pricePerUnit !== undefined && { pricePerUnit: input.pricePerUnit }),
        ...(input.barcodeValue && { barcodeValue: input.barcodeValue }),
        ...(input.lowStockThreshold !== undefined && {
          stock: {
            update: {
              lowStockThreshold: input.lowStockThreshold,
            },
          },
        }),
      },
      include: { stock: true },
    });

    return updated;
  }

  /**
   * Delete a product
   */
  static async deleteProduct(shopId: string, productId: string) {
    await this.getProductById(shopId, productId);

    await prisma.product.delete({
      where: { id: productId },
    });

    return { id: productId };
  }
}
