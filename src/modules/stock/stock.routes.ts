import { Router } from 'express';
import { getStocks, adjustStock } from './stock.controller.js';
import { requireShop } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(requireShop);

router.get('/', getStocks);
router.post('/:productId/adjust', adjustStock);

export default router;
