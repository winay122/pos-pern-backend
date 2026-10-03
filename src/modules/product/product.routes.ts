import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProductByBarcode,
  getProductById,
  updateProduct,
  deleteProduct,
} from './product.controller.js';
import { requireShop } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createProductSchema, updateProductSchema, productQuerySchema } from './product.validation.js';

const router = Router();

router.use(requireShop);

router.post('/', validate(createProductSchema), createProduct);
router.get('/', validate(productQuerySchema), getProducts);
router.get('/barcode/:barcode', getProductByBarcode);
router.get('/:id', getProductById);
router.patch('/:id', validate(updateProductSchema), updateProduct);
router.delete('/:id', deleteProduct);

export default router;
