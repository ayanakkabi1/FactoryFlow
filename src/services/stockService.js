import mongoose from 'mongoose';
import * as stockRepository from '../repositories/stockRepository.js';
import * as materialRepository from '../repositories/materialRepository.js';
import * as notificationRepository from '../repositories/notificationRepository.js';
import { BadRequestError, NotFoundError } from '../errors/AppError.js';

export const enregistrerMouvementService = async ({
  type,
  matiereId,
  quantite,
  motif,
  userId,
}) => {
  const amount = Number(quantite);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new BadRequestError('La quantité doit être supérieure à zéro.');
  }
  if (!['ENTREE', 'SORTIE'].includes(type)) {
    throw new BadRequestError('Le type doit être ENTREE ou SORTIE.');
  }

  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const material = await materialRepository.findById(matiereId, { session });
      if (!material) throw new NotFoundError('Matière première introuvable.');

      const updatedMaterial = type === 'ENTREE'
        ? await materialRepository.incrementeMaterial(matiereId, amount, { session })
        : await materialRepository.decrementMaterialIfAvailable(matiereId, amount, { session });
      if (!updatedMaterial) throw new BadRequestError('Stock insuffisant');

      const mouvement = await stockRepository.createMouvement({
        type,
        matiere: matiereId,
        utilisateur: userId,
        quantite: amount,
        motif: motif || 'Réapprovisionnement stock',
      }, { session });

      let alerte = null;
      if (type === 'SORTIE' && updatedMaterial.quantiteDisponible <= updatedMaterial.seuilAlerte) {
        const niveau = updatedMaterial.quantiteDisponible === 0 ? 'RUPTURE' : 'CRITIQUE';
        const message = `Alerte stock : ${updatedMaterial.name} est sous son seuil. Stock restant : ${updatedMaterial.quantiteDisponible} ${updatedMaterial.uniteMesure}.`;
        const notification = await notificationRepository.createNotification({
          type: 'ALERTE_STOCK',
          niveau,
          message,
          matiere: matiereId,
          quantiteDisponible: updatedMaterial.quantiteDisponible,
          seuilAlerte: updatedMaterial.seuilAlerte,
          mouvement: mouvement._id,
        }, { session });
        alerte = { declenchee: true, niveau, message, notificationId: notification._id };
      }

      result = {
        mouvement,
        nouvelleQuantiteDisponible: updatedMaterial.quantiteDisponible,
        alerte,
      };
    });
    return result;
  } finally {
    await session.endSession();
  }
};

export const getAlertesStockService = async () => {
  const matieresSousSeuil = await materialRepository.findMaterialsUnderThreshold();
  const notifications = await notificationRepository.findNotifications({ lu: false });

  const matieresAlerte = matieresSousSeuil.map((mat) => {
    const matObj = mat.toObject ? mat.toObject({ virtuals: true }) : mat;
    const niveau = mat.quantiteDisponible === 0 ? 'RUPTURE' : 'CRITIQUE';
    return {
      ...matObj,
      estSousSeuil: true,
      niveauAlerte: niveau,
      messageAlerte: `Stock bas : ${mat.quantiteDisponible} ${mat.uniteMesure} restant(s) (seuil : ${mat.seuilAlerte} ${mat.uniteMesure})`,
    };
  });

  return {
    totalEnAlerte: matieresAlerte.length,
    totalNotificationsNonLues: notifications.length,
    matieres: matieresAlerte,
    notifications,
  };
};

export const getMouvementsStockService = () => stockRepository.findAll();
