import { z } from 'zod';
import { PaymentModeEnum } from '../../config/constants.js';

export const createSaleSchema = z.object({
  body: z.object({
    clientGeneratedId: z.string().min(1, 'clientGeneratedId is required for idempotency'),
    totalAmount: z.number().min(0, 'Total amount must be non-negative'),
    paymentMode: z.enum([
      PaymentModeEnum.CASH,
      PaymentModeEnum.UPI,
      PaymentModeEnum.CREDIT,
      PaymentModeEnum.OTHER,
    ]).default(PaymentModeEnum.CASH),
    items: z
      .array(
        z.object({
          productId: z.string().min(1, 'productId is required'),
          quantity: z.number().positive('Quantity must be greater than 0'),
          unitPriceAtSale: z.number().min(0, 'unitPriceAtSale must be non-negative'),
          subtotal: z.number().min(0).optional(),
        })
      )
      .min(1, 'At least one item is required to complete a sale'),
  }),
});

export const saleQuerySchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
});
