import express from 'express';
import {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
} from '../controllers/materialController.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';
import {
  materialRules,
  validateMaterial,
} from '../validator/material.validator.js';

const router = express.Router();

/**
 * @openapi
 * /api/materials:
 *   get:
 *     tags: [Materials]
 *     summary: List raw materials
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Materials with a result count.
 *   post:
 *     tags: [Materials]
 *     summary: Create a raw material
 *     description: Requires ADMIN or OPERATOR role.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Material'
 *     responses:
 *       201:
 *         description: Material created.
 *       400:
 *         description: Invalid data or duplicate reference.
 * /api/materials/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       description: MongoDB material ID.
 *       schema:
 *         type: string
 *   get:
 *     tags: [Materials]
 *     summary: Get a raw material by ID
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Material details.
 *       404:
 *         description: Material not found.
 *   put:
 *     tags: [Materials]
 *     summary: Update a raw material
 *     description: Requires ADMIN or OPERATOR role.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Material'
 *     responses:
 *       200:
 *         description: Material updated.
 *       404:
 *         description: Material not found.
 */
router.get('/', verifyToken, getAllMaterials);
router.get('/:id', verifyToken, getMaterialById);

router.post(
  '/',
  verifyToken,
  checkRole('ADMIN', 'OPERATOR'),
  materialRules,
  validateMaterial,
  createMaterial,
);
router.put(
  '/:id',
  verifyToken,
  checkRole('ADMIN', 'OPERATOR'),
  materialRules,
  validateMaterial,
  updateMaterial,
);

export default router;
