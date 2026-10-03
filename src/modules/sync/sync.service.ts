import { SaleService, CreateSaleInput } from '../sale/sale.service.js';
import { logger } from '../../utils/logger.js';

export class SyncService {
  /**
   * Process a batch of offline sales submitted by the client
   */
  static async syncBatchSales(shopId: string, sales: CreateSaleInput[]) {
    const results = [];
    let syncedCount = 0;
    let duplicatesIgnored = 0;

    for (const saleInput of sales) {
      try {
        const sale = await SaleService.createSale(shopId, saleInput);
        results.push({
          clientGeneratedId: saleInput.clientGeneratedId,
          status: 'SUCCESS',
          saleId: sale.id,
        });
        syncedCount++;
      } catch (err: any) {
        logger.error({
          msg: 'Error syncing offline sale',
          clientGeneratedId: saleInput.clientGeneratedId,
          error: err.message,
        });

        results.push({
          clientGeneratedId: saleInput.clientGeneratedId,
          status: 'ERROR',
          error: err.message,
        });
      }
    }

    return {
      totalReceived: sales.length,
      syncedCount,
      duplicatesIgnored,
      results,
    };
  }
}
