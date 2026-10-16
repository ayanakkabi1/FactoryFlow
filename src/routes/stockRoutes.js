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

/**
 * @openapi
 * /api/stock/alertes:
 *   get:
 *     tags: [Stock]
 *     summary: List materials at or below their alert threshold
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Stock alerts.
 * /api/stock/mouvements:
 *   post:
 *     tags: [Stock]
 *     summary: Record an incoming or outgoing stock movement
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StockMovement'
 *     responses:
 *       201:
 *         description: Stock movement recorded.
 *       400:
 *         description: Invalid movement data.
 */
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
