import { Router } from 'express';
import { syncBatch } from './sync.controller.js';
import { requireShop } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/', requireShop, syncBatch);

export default router;
