import express from 'express';
import {
  createOrdre,
  getOrdreById,
  getOrdreByCode,
  getOrdresByStatut,
  getMesOrdres,
  updateOrdre,
  updateStatut,
  startOrdre,
  finishOrdre,
  getHistoriqueOperateur,
  deleteOrdreByAdmin,
  getOrders,
} from '../controllers/ordreController.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';
import {
  createOrdreRules,
  updateOrdreRules,
  updateStatutRules,
  validateOrdre,
} from '../validator/ordre.validator.js';

const router = express.Router();

/**
 * @openapi
 * /api/ordres/mes-ordres:
 *   get:
 *     tags: [Orders]
 *     summary: List orders assigned to the authenticated user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Assigned orders and count.
 * /api/ordres/historique:
 *   get:
 *     tags: [Orders]
 *     summary: Get the authenticated operator activity history
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Operator history.
 * /api/ordres/statut/{statut}:
 *   get:
 *     tags: [Orders]
 *     summary: List orders by status
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: statut
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PLANIFIE, EN_COURS, TERMINE, ANNULE]
 *     responses:
 *       200:
 *         description: Matching orders and count.
 * /api/ordres/code/{code}:
 *   get:
 *     tags: [Orders]
 *     summary: Find an order by its code
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Manufacturing order code.
 *     responses:
 *       200:
 *         description: Matching manufacturing order.
 * /api/ordres:
 *   get:
 *     tags: [Orders]
 *     summary: List manufacturing orders
 *     description: Supports statut, produit and assigneA query filters.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [PLANIFIE, EN_COURS, TERMINE, ANNULE]
 *       - in: query
 *         name: produit
 *         schema:
 *           type: string
 *         description: MongoDB product ID.
 *       - in: query
 *         name: assigneA
 *         schema:
 *           type: string
 *         description: MongoDB user ID.
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *     responses:
 *       200:
 *         description: Manufacturing orders and count.
 *   post:
 *     tags: [Orders]
 *     summary: Create a manufacturing order
 *     description: Requires ADMIN role.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Order created.
 *       400:
 *         description: Invalid order or duplicate code.
 * /api/ordres/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: MongoDB order ID.
 *   get:
 *     tags: [Orders]
 *     summary: Get an order by ID
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Manufacturing order.
 *   put:
 *     tags: [Orders]
 *     summary: Update a manufacturing order
 *     description: Requires ADMIN role.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       200:
 *         description: Order updated.
 *   delete:
 *     tags: [Orders]
 *     summary: Delete a manufacturing order
 *     description: Requires ADMIN role.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Order deleted.
 * /api/ordres/{id}/statut:
 *   patch:
 *     tags: [Orders]
 *     summary: Change an order status
 *     description: Requires ADMIN or OPERATEUR role.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB order ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderStatus'
 *     responses:
 *       200:
 *         description: Order status updated.
 * /api/ordres/{id}/demarrer:
 *   patch:
 *     tags: [Orders]
 *     summary: Start a manufacturing order
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB order ID.
 *     responses:
 *       200:
 *         description: Order started.
 * /api/ordres/{id}/finaliser:
 *   patch:
 *     tags: [Orders]
 *     summary: Finish a manufacturing order
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB order ID.
 *     responses:
 *       200:
 *         description: Order finished.
 */
router.get('/mes-ordres', verifyToken, getMesOrdres);
router.get(
  '/historique',
  verifyToken,
  checkRole('ADMIN', 'OPERATEUR', 'OPERATOR'),
  getHistoriqueOperateur,
);

router.get('/statut/:statut', verifyToken, getOrdresByStatut);

router.get('/code/:code', verifyToken, getOrdreByCode);

router.get('/', verifyToken, checkRole('ADMIN'), getOrders);
router.get('/:id', verifyToken, getOrdreById);

router.post(
  '/',
  verifyToken,
  checkRole('ADMIN'),
  createOrdreRules,
  validateOrdre,
  createOrdre,
);

router.put(
  '/:id',
  verifyToken,
  checkRole('ADMIN'),
  updateOrdreRules,
  validateOrdre,
  updateOrdre,
);

router.patch(
  '/:id/statut',
  verifyToken,
  checkRole('ADMIN'),
  updateStatutRules,
  validateOrdre,
  updateStatut,
);

router.patch(
  '/:id/demarrer',
  verifyToken,
  checkRole('ADMIN', 'OPERATEUR', 'OPERATOR'),
  startOrdre,
);

router.patch(
  '/:id/finaliser',
  verifyToken,
  checkRole('ADMIN', 'OPERATEUR', 'OPERATOR'),
  finishOrdre,
);

router.delete(
  '/:id',
  verifyToken,
  checkRole('ADMIN'),
  deleteOrdreByAdmin,
);

export default router;
