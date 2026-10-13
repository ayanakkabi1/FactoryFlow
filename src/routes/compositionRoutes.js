import express from 'express';
import {
  getAllCompositionItems,
  getCompositionItemById,
  createCompositionItem,
  updateCompositionItem,
  deleteCompositionItem,
  getCompositionSnapshot,
} from '../controllers/compositionController.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';
import {
  createCompositionItemRules,
  updateCompositionItemRules,
  validateComposition,
} from '../validator/composition.validator.js';

const router = express.Router();

router.get('/', verifyToken, getAllCompositionItems);
router.get('/snapshot/:produitId', verifyToken, getCompositionSnapshot);
router.get('/:id', verifyToken, getCompositionItemById);

router.post(
  '/',
  verifyToken,
  checkRole('ADMIN'),
  createCompositionItemRules,
  validateComposition,
  createCompositionItem,
);

router.put(
  '/:id',
  verifyToken,
  checkRole('ADMIN'),
  updateCompositionItemRules,
  validateComposition,
  updateCompositionItem,
);

router.delete(
  '/:id',
  verifyToken,
  checkRole('ADMIN'),
  deleteCompositionItem,
);

export default router;

