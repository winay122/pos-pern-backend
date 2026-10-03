import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { StockService } from './stock.service.js';
import { ApiError } from '../../utils/ApiError.js';

export const getStocks = asyncHandler(async (req: Request, res: Response) => {
  if (!req.shop) throw ApiError.unauthorized('Shop context missing');

  const lowStockOnly = req.query.lowStock === 'true';
  const stocks = await StockService.getStocks(req.shop.id, lowStockOnly);
  res.status(200).json(ApiResponse.success('Stock levels fetched successfully', stocks));
});

export const adjustStock = asyncHandler(async (req: Request, res: Response) => {
  if (!req.shop) throw ApiError.unauthorized('Shop context missing');

  const { productId } = req.params;
  const result = await StockService.adjustStock(req.shop.id, productId, req.body);
  res.status(200).json(ApiResponse.success('Stock adjusted successfully', result));
});
