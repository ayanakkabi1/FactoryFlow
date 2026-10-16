import express from 'express';
import * as installationController from '../controllers/InstallationController.js';
import {
  installationRules,
  validateInstallation,
} from '../validator/installation.validator.js';
import { checkRole, verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @openapi
 * /api/installation/status:
 *   get:
 *     tags: [Installation]
 *     summary: Check whether initial setup is complete
 *     responses:
 *       200:
 *         description: Installation status.
 */
router.get('/status', installationController.getStatus);
/**
 * @openapi
 * /api/installation/installed-by:
 *   get:
 *     tags: [Installation]
 *     summary: List installation records
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Installation records.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Administrator role required.
 */
router.get(
  '/installed-by',
  verifyToken,
  checkRole('ADMIN'),
  installationController.getInstalledBy,
);

const initializeRoute = [
  '/initialize',
  installationRules,
  validateInstallation,
  installationController.initialize
];

/**
 * @openapi
 * /api/installation/initialize:
 *   post:
 *     tags: [Installation]
 *     summary: Initialize the app and create the first administrator
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Installation'
 *     responses:
 *       201:
 *         description: Application initialized.
 *       400:
 *         description: Invalid installation details.
 */
router.post(...initializeRoute);
/**
 * @openapi
 * /api/installation:
 *   post:
 *     tags: [Installation]
 *     summary: Initialize the app and create the first administrator
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Installation'
 *     responses:
 *       201:
 *         description: Application initialized.
 *       400:
 *         description: Invalid installation details.
 */
router.post('/', installationRules, validateInstallation, installationController.initialize);

export default router;
