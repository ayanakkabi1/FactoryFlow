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