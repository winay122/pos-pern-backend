import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { SyncService } from './sync.service.js';
import { ApiError } from '../../utils/ApiError.js';

export const syncBatch = asyncHandler(async (req: Request, res: Response) => {
  if (!req.shop) throw ApiError.unauthorized('Shop context missing');

  const { sales } = req.body;
  if (!Array.isArray(sales)) {
    throw ApiError.badRequest('Expected "sales" array in request body');
  }

  const result = await SyncService.syncBatchSales(req.shop.id, sales);
  res.status(200).json(ApiResponse.success('Offline sync batch processed successfully', result));
});
