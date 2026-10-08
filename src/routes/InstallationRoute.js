import express from 'express';
import * as installationController from '../controllers/InstallationController.js';
import {
  installationRules,
  validateInstallation,
} from '../validator/installation.validator.js';
import { checkRole, verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/status', installationController.getStatus);
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

router.post(...initializeRoute);
router.post('/', installationRules, validateInstallation, installationController.initialize);

export default router;