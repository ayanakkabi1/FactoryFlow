import * as stockRepository from '../repositories/stockRepository.js';
import * as materialRepository from '../repositories/materialRepository.js';
import * as notificationRepository from '../repositories/notificationRepository.js';

export const enregistrerMouvementService = async ({
  type,
  matiereId,
  quantite,
  motif,
  userId,
}) => {
    const matiere = await materialRepository.findById(matiereId);
    if (!matiere) {
      throw new Error("La matière visée n'existe pas");
    }

    const quantiteNum = Number(quantite);
    if (!Number.isFinite(quantiteNum) || quantiteNum <= 0) {
      throw new Error('La quantité doit être un nombre supérieur à zéro');
    }

    if (type !== 'ENTREE' && type !== 'SORTIE') {
      throw new Error('Le type de mouvement doit être ENTREE ou SORTIE');
    }

    if (type === 'SORTIE' && matiere.quantiteDisponible < quantiteNum) {
      throw new Error('Stock insuffisant');
    }

    const impactStock = type === 'ENTREE' ? quantiteNum : -quantiteNum;
    const mouvement = await stockRepository.createMouvement({
      type,
      matiere: matiereId,
      utilisateur: userId,
      quantite: quantiteNum,
      motif: motif || 'Réapprovisionnement stock',
    });
    const matiereMaj = await materialRepository.incrementeMaterial(
      matiereId,
      impactStock
    );

    let alerte = null;
    if (type === 'SORTIE' && matiereMaj.quantiteDisponible <= matiereMaj.seuilAlerte) {
      const niveau = matiereMaj.quantiteDisponible === 0 ? 'RUPTURE' : 'CRITIQUE';
      const message = `Alerte stock : La matière première "${matiereMaj.name}" (${matiereMaj.reference}) est sous son seuil d'alerte. Quantité restante : ${matiereMaj.quantiteDisponible} ${matiereMaj.uniteMesure} (seuil : ${matiereMaj.seuilAlerte} ${matiereMaj.uniteMesure}).`;

      const notification = await notificationRepository.createNotification({
        type: 'ALERTE_STOCK',
        niveau,
        message,
        matiere: matiereId,
        quantiteDisponible: matiereMaj.quantiteDisponible,
        seuilAlerte: matiereMaj.seuilAlerte,
        mouvement: mouvement._id,
      });

      alerte = {
        declenchee: true,
        niveau,
        message,
        notificationId: notification._id,
        seuilAlerte: matiereMaj.seuilAlerte,
        quantiteDisponible: matiereMaj.quantiteDisponible,
        uniteMesure: matiereMaj.uniteMesure,
        nomMatiere: matiereMaj.name,
        reference: matiereMaj.reference,
      };
    }

    return {
      mouvement,
      nouvelleQuantiteDisponible: matiereMaj.quantiteDisponible,
      alerte,
    };
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
      messageAlerte: `Stock bas : ${mat.quantiteDisponible} ${mat.uniteMesure} restant(s) (seuil d'alerte : ${mat.seuilAlerte} ${mat.uniteMesure})`,
    };
  });

  return {
    totalEnAlerte: matieresAlerte.length,
    totalNotificationsNonLues: notifications.length,
    matieres: matieresAlerte,
    notifications,
  };
};
