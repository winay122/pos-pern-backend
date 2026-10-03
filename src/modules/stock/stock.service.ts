import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';

export class StockService {
  /**
   * Get all stock items for a shop with low-stock status
   */
  static async getStocks(shopId: string, filterLowStock: boolean = false) {
    const products = await prisma.product.findMany({
      where: { shopId },
      include: { stock: true },
      orderBy: { name: 'asc' },
    });

    const stockItems = products.map((product) => {
      const stock = product.stock || { quantity: 0, lowStockThreshold: 5, lastUpdatedAt: product.createdAt };
      const isLowStock = stock.quantity <= stock.lowStockThreshold;

      return {
        productId: product.id,
        productName: product.name,
        category: product.category,
        unitType: product.unitType,
        barcodeValue: product.barcodeValue,
        pricePerUnit: product.pricePerUnit,
        quantity: stock.quantity,
        lowStockThreshold: stock.lowStockThreshold,
        isLowStock,
        lastUpdatedAt: stock.lastUpdatedAt,
      };
    });

    if (filterLowStock) {
      return stockItems.filter((item) => item.isLowStock);
    }

    return stockItems;
  }

  /**
   * Adjust stock quantity directly or delta (+ / -)
   */
  static async adjustStock(
    shopId: string,
    productId: string,
    data: { quantity?: number; delta?: number; lowStockThreshold?: number }
  ) {
    const product = await prisma.product.findFirst({
      where: { id: productId, shopId },
      include: { stock: true },
    });

    if (!product) {
      throw ApiError.notFound('Product not found in this shop');
    }

    let newQuantity = product.stock?.quantity ?? 0;

    if (data.quantity !== undefined) {
      newQuantity = Math.max(0, data.quantity);
    } else if (data.delta !== undefined) {
      newQuantity = Math.max(0, newQuantity + data.delta);
    }

    const updatedStock = await prisma.stock.upsert({
      where: { productId },
      create: {
        productId,
        quantity: newQuantity,
        lowStockThreshold: data.lowStockThreshold ?? 5,
      },
      update: {
        quantity: newQuantity,
        ...(data.lowStockThreshold !== undefined && { lowStockThreshold: data.lowStockThreshold }),
      },
    });

    return {
      ...updatedStock,
      productName: product.name,
    };
  }
}
