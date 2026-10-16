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

/**
 * @openapi
 * /api/compositions:
 *   get:
 *     tags: [Composition]
 *     summary: List composition items
 *     description: Optionally filter by product using produit or produitId.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: produit
 *         schema:
 *           type: string
 *         description: MongoDB product ID.
 *     responses:
 *       200:
 *         description: Composition items and count.
 *   post:
 *     tags: [Composition]
 *     summary: Create a composition item
 *     description: Requires ADMIN role. Include produit in the body.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompositionItem'
 *     responses:
 *       201:
 *         description: Composition item created.
 *       400:
 *         description: Invalid data or material already in composition.
 * /api/compositions/snapshot/{produitId}:
 *   get:
 *     tags: [Composition]
 *     summary: Calculate required materials for a production quantity
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: produitId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB product ID.
 *       - in: query
 *         name: quantiteAFabriquer
 *         schema:
 *           type: number
 *           default: 1
 *         description: Number of products to produce.
 *     responses:
 *       200:
 *         description: Composition snapshot.
 * /api/compositions/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       description: MongoDB composition item ID.
 *       schema:
 *         type: string
 *   get:
 *     tags: [Composition]
 *     summary: Get a composition item by ID
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Composition item.
 *   put:
 *     tags: [Composition]
 *     summary: Update a composition item
 *     description: Requires ADMIN role.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompositionItem'
 *     responses:
 *       200:
 *         description: Composition item updated.
 *   delete:
 *     tags: [Composition]
 *     summary: Delete a composition item
 *     description: Requires ADMIN role.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Composition item deleted.
 */
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

