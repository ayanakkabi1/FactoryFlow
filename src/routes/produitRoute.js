import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/produitController.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';
import {
  createProductRules,
  updateProductRules,
  validateProduct,
} from '../validator/produit.validator.js';

const router = express.Router();

router.get('/', verifyToken, getAllProducts);
router.get('/:id', verifyToken, getProductById);
router.post(
  '/',
  verifyToken,
  checkRole('ADMIN'),
  createProductRules,
  validateProduct,
  createProduct,
);
router.put(
  '/:id',
  verifyToken,
  checkRole('ADMIN'),
  updateProductRules,
  validateProduct,
  updateProduct,
);
router.delete('/:id', verifyToken, checkRole('ADMIN'), deleteProduct);

export default router;