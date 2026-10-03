import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { PaymentModeEnum, SyncStatusEnum } from '../../config/constants.js';

export interface SaleItemInput {
  productId: string;
  quantity: number;
  unitPriceAtSale: number;
  subtotal?: number;
}

export interface CreateSaleInput {
  clientGeneratedId: string;
  totalAmount: number;
  paymentMode?: keyof typeof PaymentModeEnum;
  items: SaleItemInput[];
}

export class SaleService {
  /**
   * Create a new sale with transaction, deducting stock and ensuring idempotency
   */
  static async createSale(shopId: string, input: CreateSaleInput) {
    // Check if this sale was already processed (idempotency via clientGeneratedId)
    const existing = await prisma.sale.findUnique({
      where: { clientGeneratedId: input.clientGeneratedId },
      include: {
        saleItems: {
          include: { product: true },
        },
      },
    });

    if (existing) {
      return existing;
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Create Sale Record
      const sale = await tx.sale.create({
        data: {
          shopId,
          totalAmount: input.totalAmount,
          paymentMode: (input.paymentMode as any) || 'CASH',
          syncStatus: SyncStatusEnum.SYNCED,
          clientGeneratedId: input.clientGeneratedId,
          saleItems: {
            create: input.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPriceAtSale: item.unitPriceAtSale,
              subtotal: item.subtotal ?? item.quantity * item.unitPriceAtSale,
            })),
          },
        },
        include: {
          saleItems: {
            include: { product: true },
          },
        },
      });

      // 2. Decrement stock for each sold item
      for (const item of input.items) {
        await tx.stock.updateMany({
          where: { productId: item.productId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      return sale;
    });
  }

  /**
   * Get sales history for a shop with pagination and date filter
   */
  static async getSales(
    shopId: string,
    params: { startDate?: string; endDate?: string; page?: number; limit?: number }
  ) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 50;
    const skip = (page - 1) * limit;

    const where: any = { shopId };

    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) {
        where.createdAt.gte = new Date(params.startDate);
      }
      if (params.endDate) {
        const end = new Date(params.endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          saleItems: {
            include: {
              product: {
                select: {
                  name: true,
                  unitType: true,
                  barcodeValue: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.sale.count({ where }),
    ]);

    return {
      sales,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single sale by ID
   */
  static async getSaleById(shopId: string, saleId: string) {
    const sale = await prisma.sale.findFirst({
      where: { id: saleId, shopId },
      include: {
        saleItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!sale) {
      throw ApiError.notFound('Sale record not found');
    }

    return sale;
  }

  /**
   * Get shop summary statistics (today's revenue, today's sales count, total products)
   */
  static async getShopStats(shopId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [todaySales, totalProducts, lowStockCount] = await Promise.all([
      prisma.sale.findMany({
        where: {
          shopId,
          createdAt: { gte: todayStart },
        },
      }),
      prisma.product.count({
        where: { shopId },
      }),
      prisma.stock.count({
        where: {
          product: { shopId },
          quantity: { lte: prisma.stock.fields.lowStockThreshold },
        },
      }),
    ]);

    const todayRevenue = todaySales.reduce((acc, sale) => acc + sale.totalAmount, 0);

    return {
      todayRevenue,
      todayBillsCount: todaySales.length,
      totalProducts,
      lowStockCount,
    };
  }
}
