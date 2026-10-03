import { Router } from 'express';
import { getProfile, updateProfile } from './shop.controller.js';
import { requireShop } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { updateShopSchema } from './shop.validation.js';

const router = Router();

router.get('/profile', requireShop, getProfile);
router.patch('/profile', requireShop, validate(updateShopSchema), updateProfile);

export default router;
