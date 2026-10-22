import express from 'express';
import * as userController from '../controllers/userController.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';
import { operatorRules, validateUser } from '../validator/user.validator.js';

const router = express.Router();

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get the authenticated user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile.
 *       401:
 *         description: Missing or invalid bearer token.
 */
router.get('/me', verifyToken, userController.getProfile);
/**
 * @openapi
 * /api/users/operators:
 *   post:
 *     tags: [Users]
 *     summary: Create an operator account
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Operator created.
 *       400:
 *         description: Invalid user details.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Administrator role required.
 */
router.post(
  '/operators',
  verifyToken,
  checkRole('ADMIN'),
  operatorRules,
  validateUser,
  userController.createOperator
);
/**
 * @openapi
 * /api/users/admins:
 *   post:
 *     tags: [Users]
 *     summary: Create an administrator account
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Administrator created.
 *       400:
 *         description: Invalid user details.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Administrator role required.
 */
router.post(
  '/admins',
  verifyToken,
  checkRole('ADMIN'),
  operatorRules,
  validateUser,
  userController.createAdmin
);
/**
 * @openapi
 * /api/users/operators:
 *   get:
 *     tags: [Users]
 *     summary: List operators
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Operator list.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Administrator role required.
 */
router.get('/operators', verifyToken, checkRole('ADMIN'), userController.getOperators);

export default router;
