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
  getCompositionByProduct,
  createCompositionItem,
  getCompositionSnapshot,
} from '../controllers/compositionController.js';
import {
  createProductRules,
  updateProductRules,
  validateProduct,
} from '../validator/produit.validator.js';
import {
  createCompositionItemRules,
  validateComposition,
} from '../validator/composition.validator.js';

const router = express.Router();

router.get('/', verifyToken, getAllProducts);
router.get(
  '/:id/composition',
  verifyToken,
  getCompositionByProduct,
);
router.get(
  '/:id/composition/snapshot',
  verifyToken,
  getCompositionSnapshot,
);
router.post(
  '/:id/composition',
  verifyToken,
  checkRole('ADMIN'),
  createCompositionItemRules,
  validateComposition,
  createCompositionItem,
);
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