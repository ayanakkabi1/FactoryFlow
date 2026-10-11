import * as stockService from '../services/stockService.js';

export const enregistrerMouvement = async (req, res, next) => {
  try {
    const { type, matiereId, quantite, motif } = req.body;
    const userId = req.user.userId;

    const resultat = await stockService.enregistrerMouvementService({
      type,
      matiereId,
      quantite,
      motif,
      userId,
    });

    return res.status(201).json({
      success: true,
      message: 'Mouvement de stock enregistré avec succès',
      data: resultat,
    });
  } catch (error) {
    return next(error);
  }
};