import * as stockRepository from '../repositories/stockRepository.js';
import * as materialRepository from '../repositories/materialRepository.js';

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

    return {
      mouvement,
      nouvelleQuantiteDisponible: matiereMaj.quantiteDisponible,
    };
};
