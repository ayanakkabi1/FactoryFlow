import express from 'express';
import { enregistrerMouvement } from '../controllers/stockController.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';
import {
  mouvementStockRules,
  validateMouvementStock,
} from '../validator/stock.validator.js';

const router = express.Router();

router.post(
  '/mouvements',
  verifyToken,
  checkRole('ADMIN', 'OPERATOR'),
  mouvementStockRules,
  validateMouvementStock,
  enregistrerMouvement,
);

export default router;
