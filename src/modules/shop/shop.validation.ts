import { z } from 'zod';
import { ShopCategoryEnum } from '../../config/constants.js';

export const updateShopSchema = z.object({
  body: z.object({
    ownerName: z.string().min(2).optional(),
    shopName: z.string().min(2).optional(),
    shopCategory: z.enum([
      ShopCategoryEnum.GENERAL_STORE,
      ShopCategoryEnum.CLOTH,
      ShopCategoryEnum.COSMETICS,
      ShopCategoryEnum.OTHER,
    ]).optional(),
    address: z.string().optional(),
  }),
});
