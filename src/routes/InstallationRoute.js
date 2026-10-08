import express from 'express';
import * as installationController from '../controllers/InstallationController.js';
import {
  installationRules,
  validateInstallation,
} from '../validator/installation.validator.js';

const router = express.Router();

router.get('/status', installationController.getStatus);

const initializeRoute = [
  '/initialize',
  installationRules,
  validateInstallation,
  installationController.initialize
];

router.post(...initializeRoute);
router.post('/', installationRules, validateInstallation, installationController.initialize);

export default router;