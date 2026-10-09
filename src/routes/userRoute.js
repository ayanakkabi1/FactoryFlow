import express from 'express';
import * as userController from '../controllers/userController.js.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';
import {
  operatorRules,
  validateUser,
} from '../validator/user.validator.js';

const router = express.Router();

router.get('/me', verifyToken, userController.getProfile);
router.post(
  '/operators',
  verifyToken,
  checkRole('ADMIN'),
  operatorRules,
  validateUser,
  userController.createOperator,
);
router.post(
  '/admins',
  verifyToken,
  checkRole('ADMIN'),
  operatorRules,
  validateUser,
  userController.createAdmin,
);
router.get(
  '/operators',
  verifyToken,
  checkRole('ADMIN'),
  userController.getOperators,
);

export default router;
