import express from 'express';
import {
  createOrdre,
  getAllOrdres,
  getOrdreById,
  getOrdreByCode,
  getOrdresByStatut,
  getMesOrdres,
  updateOrdre,
  updateStatut,
  startOrdre,
  finishOrdre,
  getHistoriqueOperateur,
  deleteOrdreByAdmin,
  getOrders,
} from '../controllers/ordreController.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';
import {
  createOrdreRules,
  updateOrdreRules,
  updateStatutRules,
  validateOrdre,
} from '../validator/ordre.validator.js';

const router = express.Router();

router.get('/mes-ordres', verifyToken, getMesOrdres);
router.get(
  '/historique',
  verifyToken,
  checkRole('ADMIN', 'OPERATEUR', 'OPERATOR'),
  getHistoriqueOperateur,
);

router.get('/statut/:statut', verifyToken, getOrdresByStatut);

router.get('/code/:code', verifyToken, getOrdreByCode);

router.get('/', verifyToken, getAllOrdres);
router.get('/:id', verifyToken, getOrdreById);

router.post(
  '/',
  verifyToken,
  checkRole('ADMIN'),
  createOrdreRules,
  validateOrdre,
  createOrdre,
);

router.put(
  '/:id',
  verifyToken,
  checkRole('ADMIN'),
  updateOrdreRules,
  validateOrdre,
  updateOrdre,
);

router.patch(
  '/:id/statut',
  verifyToken,
  checkRole('ADMIN', 'OPERATEUR'),
  updateStatutRules,
  validateOrdre,
  updateStatut,
);

router.patch(
  '/:id/demarrer',
  verifyToken,
  checkRole('ADMIN', 'OPERATEUR', 'OPERATOR'),
  startOrdre,
);

router.patch(
  '/:id/finaliser',
  verifyToken,
  checkRole('ADMIN', 'OPERATEUR', 'OPERATOR'),
  finishOrdre,
);

router.delete(
  '/:id',
  verifyToken,
  checkRole('ADMIN'),
  deleteOrdreByAdmin,
);

router.get('/', verifyToken,checkRole(['Admin']), getOrders);
export default router;
