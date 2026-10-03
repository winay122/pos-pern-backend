import { z } from 'zod';
import { ShopCategoryEnum } from '../../config/constants.js';

export const registerSchema = z.object({
  body: z.object({
    ownerName: z.string().min(2, 'Owner name must be at least 2 characters'),
    shopName: z.string().min(2, 'Shop name must be at least 2 characters'),
    phoneNumber: z.string().regex(/^[0-9]{10}$/, 'Phone number must be a valid 10-digit number'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    shopCategory: z.enum([
      ShopCategoryEnum.GENERAL_STORE,
      ShopCategoryEnum.CLOTH,
      ShopCategoryEnum.COSMETICS,
      ShopCategoryEnum.OTHER,
    ]).default(ShopCategoryEnum.GENERAL_STORE),
    address: z.string().optional(),
  }),
});

export const sendOtpSchema = z.object({
  body: z.object({
    phoneNumber: z.string().regex(/^[0-9]{10}$/, 'Phone number must be a valid 10-digit number'),
  }),
});

export const loginSchema = z.object({
  body: z
    .object({
      phoneNumber: z.string().regex(/^[0-9]{10}$/, 'Phone number must be a valid 10-digit number'),
      password: z.string().min(1, 'Password cannot be empty').optional(),
      otp: z.string().regex(/^[0-9]{6}$/, 'OTP must be 6 digits').optional(),
    })
    .refine((data) => (data.password && !data.otp) || (!data.password && data.otp), {
      message: 'Provide either password (Password Login) OR 6-digit OTP (OTP Login), not both or neither.',
      path: ['password'],
    }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});
