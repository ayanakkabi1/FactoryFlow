import express from 'express';
import {
  getAllNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../controllers/notificationController.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get(
  '/',
  verifyToken,
  checkRole('ADMIN', 'OPERATOR', 'OPERATEUR'),
  getAllNotifications,
);

router.get(
  '/non-lues',
  verifyToken,
  checkRole('ADMIN', 'OPERATOR', 'OPERATEUR'),
  getUnreadNotifications,
);

router.patch(
  '/:id/lire',
  verifyToken,
  checkRole('ADMIN', 'OPERATOR', 'OPERATEUR'),
  markNotificationAsRead,
);

router.patch(
  '/lire-tout',
  verifyToken,
  checkRole('ADMIN', 'OPERATOR', 'OPERATEUR'),
  markAllNotificationsAsRead,
);

export default router;

