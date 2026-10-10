import express from 'express';
import {
  enregistrerMouvement,
  getAlertesStock,
} from '../controllers/stockController.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';
import {
  mouvementStockRules,
  validateMouvementStock,
} from '../validator/stock.validator.js';

const router = express.Router();

router.get(
  '/alertes',
  verifyToken,
  checkRole('ADMIN', 'OPERATOR', 'OPERATEUR'),
  getAlertesStock,
);

router.post(
  '/mouvements',
  verifyToken,
  checkRole('ADMIN', 'OPERATOR', 'OPERATEUR'),
  mouvementStockRules,
  validateMouvementStock,
  enregistrerMouvement,
);

export default router;
