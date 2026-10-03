import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { SaleService } from './sale.service.js';
import { ApiError } from '../../utils/ApiError.js';

export const createSale = asyncHandler(async (req: Request, res: Response) => {
  if (!req.shop) throw ApiError.unauthorized('Shop context missing');

  const sale = await SaleService.createSale(req.shop.id, req.body);
  res.status(201).json(ApiResponse.success('Sale completed successfully', sale));
});

export const getSales = asyncHandler(async (req: Request, res: Response) => {
  if (!req.shop) throw ApiError.unauthorized('Shop context missing');

  const result = await SaleService.getSales(req.shop.id, req.query as any);
  res.status(200).json(ApiResponse.success('Sales history fetched successfully', result));
});

export const getSaleById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.shop) throw ApiError.unauthorized('Shop context missing');

  const { id } = req.params;
  const sale = await SaleService.getSaleById(req.shop.id, id);
  res.status(200).json(ApiResponse.success('Sale details fetched successfully', sale));
});

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  if (!req.shop) throw ApiError.unauthorized('Shop context missing');

  const stats = await SaleService.getShopStats(req.shop.id);
  res.status(200).json(ApiResponse.success('Shop statistics fetched successfully', stats));
});
