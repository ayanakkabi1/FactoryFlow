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

/**
 * @openapi
 * /api/produits:
 *   get:
 *     tags: [Products]
 *     summary: List products
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Products with a result count.
 *   post:
 *     tags: [Products]
 *     summary: Create a product
 *     description: Requires ADMIN role.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created.
 *       400:
 *         description: Invalid data or duplicate reference.
 * /api/produits/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       description: MongoDB product ID.
 *       schema:
 *         type: string
 *   get:
 *     tags: [Products]
 *     summary: Get a product by ID
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Product details.
 *       404:
 *         description: Product not found.
 *   put:
 *     tags: [Products]
 *     summary: Update a product
 *     description: Requires ADMIN role.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated.
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product
 *     description: Requires ADMIN role.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Product deleted.
 * /api/produits/{id}/composition:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       description: MongoDB product ID.
 *       schema:
 *         type: string
 *   get:
 *     tags: [Composition]
 *     summary: List composition items for a product
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Product composition.
 *   post:
 *     tags: [Composition]
 *     summary: Add a material to a product composition
 *     description: Requires ADMIN role.
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
 * /api/produits/{id}/composition/snapshot:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       description: MongoDB product ID.
 *       schema:
 *         type: string
 *   get:
 *     tags: [Composition]
 *     summary: Calculate material requirements for a production quantity
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: quantiteAFabriquer
 *         schema:
 *           type: number
 *           default: 1
 *         description: Number of products to produce.
 *     responses:
 *       200:
 *         description: Composition snapshot.
 */
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
