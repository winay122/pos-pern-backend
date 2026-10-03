import { z } from 'zod';
import { UnitTypeEnum } from '../../config/constants.js';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Product name is required'),
    category: z.string().optional(),
    unitType: z.enum([
      UnitTypeEnum.PIECE,
      UnitTypeEnum.KG,
      UnitTypeEnum.GRAM,
      UnitTypeEnum.LITER,
      UnitTypeEnum.ML,
      UnitTypeEnum.DOZEN,
      UnitTypeEnum.LOT,
      UnitTypeEnum.QUINTAL,
      UnitTypeEnum.BAG,
      UnitTypeEnum.TEN_PIECE,
    ]).default(UnitTypeEnum.PIECE),
    pricePerUnit: z.number().min(0, 'Price must be positive or 0'),
    barcodeValue: z.string().optional(),
    initialStock: z.number().min(0).default(0),
    lowStockThreshold: z.number().min(0).default(5),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    category: z.string().optional(),
    unitType: z.enum([
      UnitTypeEnum.PIECE,
      UnitTypeEnum.KG,
      UnitTypeEnum.GRAM,
      UnitTypeEnum.LITER,
      UnitTypeEnum.ML,
      UnitTypeEnum.DOZEN,
      UnitTypeEnum.LOT,
      UnitTypeEnum.QUINTAL,
      UnitTypeEnum.BAG,
      UnitTypeEnum.TEN_PIECE,
    ]).optional(),
    pricePerUnit: z.number().min(0).optional(),
    barcodeValue: z.string().optional(),
    lowStockThreshold: z.number().min(0).optional(),
  }),
});

export const productQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
});
