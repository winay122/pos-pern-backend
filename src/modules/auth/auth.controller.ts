import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { AuthService } from './auth.service.js';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body);
  res.status(201).json(ApiResponse.success('Shop registered successfully', result));
});

export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.sendOtp(req.body.phoneNumber);
  res.status(200).json(ApiResponse.success(result.message, result));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);
  res.status(200).json(ApiResponse.success('Logged in successfully', result));
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.refreshToken(req.body.refreshToken);
  res.status(200).json(ApiResponse.success('Token refreshed successfully', result));
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.status(200).json(ApiResponse.success('Logged out successfully'));
});
