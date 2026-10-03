import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { AdminService } from './admin.service.js';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await AdminService.login(email, password);
  res.status(200).json(ApiResponse.success('Admin authenticated successfully', result));
});

export const createShop = asyncHandler(async (req: Request, res: Response) => {
  const shop = await AdminService.createShop(req.body);
  res.status(201).json(ApiResponse.success('Shop created successfully by admin', shop));
});

export const listShops = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.listShops(req.query as any);
  res.status(200).json(ApiResponse.success('Shops fetched successfully', result));
});

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await AdminService.getPlatformStats();
  res.status(200).json(ApiResponse.success('Platform stats fetched successfully', stats));
});
