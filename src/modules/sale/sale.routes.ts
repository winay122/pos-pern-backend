import { Router } from 'express';
import { createSale, getSales, getSaleById, getStats } from './sale.controller.js';
import { requireShop } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createSaleSchema, saleQuerySchema } from './sale.validation.js';

const router = Router();

router.use(requireShop);

router.post('/', validate(createSaleSchema), createSale);
router.get('/', validate(saleQuerySchema), getSales);
router.get('/stats', getStats);
router.get('/:id', getSaleById);

export default router;
