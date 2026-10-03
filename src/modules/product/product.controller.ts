import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ProductService } from './product.service.js';
import { ApiError } from '../../utils/ApiError.js';

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  if (!req.shop) throw ApiError.unauthorized('Shop context missing');

  const product = await ProductService.createProduct(req.shop.id, req.body);
  res.status(201).json(ApiResponse.success('Product created successfully', product));
});

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  if (!req.shop) throw ApiError.unauthorized('Shop context missing');

  const result = await ProductService.getProducts(req.shop.id, req.query as any);
  res.status(200).json(ApiResponse.success('Products fetched successfully', result));
});

export const getProductByBarcode = asyncHandler(async (req: Request, res: Response) => {
  if (!req.shop) throw ApiError.unauthorized('Shop context missing');

  const { barcode } = req.params;
  const product = await ProductService.getProductByBarcode(req.shop.id, barcode);
  res.status(200).json(ApiResponse.success('Product found', product));
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.shop) throw ApiError.unauthorized('Shop context missing');

  const { id } = req.params;
  const product = await ProductService.getProductById(req.shop.id, id);
  res.status(200).json(ApiResponse.success('Product details', product));
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  if (!req.shop) throw ApiError.unauthorized('Shop context missing');

  const { id } = req.params;
  const updated = await ProductService.updateProduct(req.shop.id, id, req.body);
  res.status(200).json(ApiResponse.success('Product updated successfully', updated));
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  if (!req.shop) throw ApiError.unauthorized('Shop context missing');

  const { id } = req.params;
  const result = await ProductService.deleteProduct(req.shop.id, id);
  res.status(200).json(ApiResponse.success('Product deleted successfully', result));
});
