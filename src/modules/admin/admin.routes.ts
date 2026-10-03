import { Router } from 'express';
import { login, createShop, listShops, getStats } from './admin.controller.js';
import { requireAdmin } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authLimiter } from '../../middleware/rateLimiter.middleware.js';
import { adminLoginSchema, adminCreateShopSchema, adminShopQuerySchema } from './admin.validation.js';

const router = Router();

// Public admin login
router.post('/auth/login', authLimiter, validate(adminLoginSchema), login);

// Protected admin routes
router.post('/shops', requireAdmin, validate(adminCreateShopSchema), createShop);
router.get('/shops', requireAdmin, validate(adminShopQuerySchema), listShops);
router.get('/stats', requireAdmin, getStats);

export default router;
