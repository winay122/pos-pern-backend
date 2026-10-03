import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ShopService } from './shop.service.js';
import { ApiError } from '../../utils/ApiError.js';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.shop) {
    throw ApiError.unauthorized('Shop context missing');
  }

  const shop = await ShopService.getShopProfile(req.shop.id);
  res.status(200).json(ApiResponse.success('Shop profile fetched successfully', shop));
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.shop) {
    throw ApiError.unauthorized('Shop context missing');
  }

  const shop = await ShopService.updateShopProfile(req.shop.id, req.body);
  res.status(200).json(ApiResponse.success('Shop profile updated successfully', shop));
});
