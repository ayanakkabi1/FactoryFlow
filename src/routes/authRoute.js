import express from 'express';
import * as authController from '../controllers/authController.js';
import {
  loginRules,
  validateLogin,
} from '../validator/auth.validator.js';

const router = express.Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Authenticate with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: Login successful; returns a JWT and user data.
 *       400:
 *         description: Invalid email or missing credentials.
 *       401:
 *         description: Invalid credentials.
 */
router.post('/login', loginRules, validateLogin, authController.login);

export default router;
