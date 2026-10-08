import express from 'express';
import * as authController from '../controllers/authController.js';
import {
  loginRules,
  validateLogin,
} from '../validator/auth.validator.js';

const router = express.Router();

router.post('/login', loginRules, validateLogin, authController.login);

export default router;
