import { z } from 'zod';
import { ShopCategoryEnum } from '../../config/constants.js';

export const adminLoginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid admin email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const adminCreateShopSchema = z.object({
  body: z.object({
    ownerName: z.string().min(2, 'Owner name must be at least 2 characters'),
    shopName: z.string().min(2, 'Shop name must be at least 2 characters'),
    phoneNumber: z.string().regex(/^[0-9]{10}$/, 'Phone number must be a valid 10-digit number'),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    shopCategory: z.enum([
      ShopCategoryEnum.GENERAL_STORE,
      ShopCategoryEnum.CLOTH,
      ShopCategoryEnum.COSMETICS,
      ShopCategoryEnum.OTHER,
    ]).default(ShopCategoryEnum.GENERAL_STORE),
    address: z.string().optional(),
  }),
});

export const adminShopQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
});
