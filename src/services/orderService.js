import * as ordreRepository from '../repositories/ordreRepository.js';
import * as compositionService from './compositionService.js';
import * as materialRepository from '../repositories/materialRepository.js';
import * as stockRepository from '../repositories/stockRepository.js';
import mongoose from 'mongoose';
import Produit from '../models/Produit.js';
import User from '../models/User.js';
import { NotFoundError, BadRequestError } from '../errors/AppError.js';

const TRANSITIONS_VALIDES = {
  PLANIFIE: ['EN_COURS', 'ANNULE'],
  EN_COURS: ['TERMINE', 'ANNULE'],
  TERMINE: [],
  ANNULE: [],
};

export const createOrdreService = async ({
  code,
  produit,
  quantiteAFabriquer,
  assigneA,
}) => {
  const produitExists = await Produit.findById(produit);
  if (!produitExists) {
    throw new NotFoundError('Produit introuvable');
  }

  const userExists = await User.findById(assigneA);
  if (!userExists) {
    throw new NotFoundError('Utilisateur assigné introuvable');
  }

  const quantiteNum = Number(quantiteAFabriquer);
  if (!Number.isFinite(quantiteNum) || quantiteNum <= 0) {
    throw new BadRequestError('La quantité à fabriquer doit être un nombre positif');
  }

  const codeExists = await ordreRepository.findOrdreByCode(code);
  if (codeExists) {
    throw new BadRequestError(`Un ordre de fabrication avec le code "${code}" existe déjà`);
  }

  const compositionSnapshot =
    await compositionService.generateCompositionSnapshotDocuments(produit);

  const ordre = await ordreRepository.createOrdre({
    code,
    produit,
    quantiteAFabriquer: quantiteNum,
    assigneA,
    composition: compositionSnapshot,
  });

  return ordre;
};

export const getAllOrdresService = async (filter = {}) => {
  return ordreRepository.findAllOrdres(filter);
};

export const getOrdreByIdService = async (id) => {
  const ordre = await ordreRepository.findOrdreById(id);
  if (!ordre) {
    throw new NotFoundError('Ordre de fabrication introuvable');
  }
  return ordre;
};

export const getOrdreByCodeService = async (code) => {
  const ordre = await ordreRepository.findOrdreByCode(code);
  if (!ordre) {
    throw new NotFoundError('Ordre de fabrication introuvable');
  }
  return ordre;
};

export const getOrdresByStatutService = async (statut) => {
  return ordreRepository.findOrdresByStatut(statut);
};

export const getOrdresByAssigneService = async (userId) => {
  return ordreRepository.findOrdresByAssigne(userId);
};

export const updateOrdreService = async (id, updateData) => {
  const existing = await ordreRepository.findOrdreById(id);
  if (!existing) {
    throw new NotFoundError('Ordre de fabrication introuvable');
  }

  if (existing.statut !== 'PLANIFIE') {
    throw new BadRequestError(
      'Seuls les ordres au statut PLANIFIE peuvent être modifiés'
    );
  }

  const payload = {};

  if (updateData.code !== undefined) {
    const duplicate = await ordreRepository.findOrdreByCode(updateData.code);
    if (duplicate && duplicate._id.toString() !== id.toString()) {
      throw new BadRequestError(
        `Un ordre de fabrication avec le code "${updateData.code}" existe déjà`
      );
    }
    payload.code = updateData.code;
  }

  if (updateData.quantiteAFabriquer !== undefined) {
    const q = Number(updateData.quantiteAFabriquer);
    if (!Number.isFinite(q) || q <= 0) {
      throw new BadRequestError('La quantité à fabriquer doit être un nombre positif');
    }
    payload.quantiteAFabriquer = q;
  }

  if (updateData.assigneA !== undefined) {
    const userExists = await User.findById(updateData.assigneA);
    if (!userExists) {
      throw new NotFoundError('Utilisateur assigné introuvable');
    }
    payload.assigneA = updateData.assigneA;
  }

  return ordreRepository.updateOrdre(id, payload);
};

export const updateStatutService = async (id, nouveauStatut) => {
  const ordre = await ordreRepository.findOrdreById(id);
  if (!ordre) {
    throw new NotFoundError('Ordre de fabrication introuvable');
  }

  const statutActuel = ordre.statut;
  const transitionsPermises = TRANSITIONS_VALIDES[statutActuel];

  if (!transitionsPermises || !transitionsPermises.includes(nouveauStatut)) {
    throw new BadRequestError(
      `Transition de statut invalide : ${statutActuel} → ${nouveauStatut}`
    );
  }

  return ordreRepository.updateStatut(id, nouveauStatut);
};

export const startOrdreService = async (id, userId) => {
  const ordre = await ordreRepository.findOrdreById(id);
  if (!ordre) {
    throw new NotFoundError('Ordre de fabrication introuvable');
  }
  if (ordre.statut !== 'PLANIFIE') {
    throw new BadRequestError(
      `Un ordre de fabrication ne peut être démarré que depuis le statut PLANIFIE (statut actuel : ${ordre.statut})`
    );
  }

  const besoins = new Map();
  for (const item of ordre.composition) {
    if (!item.matiere) {
      throw new BadRequestError(
        `La matière "${item.nomMatiere}" n'est pas identifiée dans le snapshot de l'ordre`
      );
    }
    const quantite = item.quantiteUnitaireNecessaire * ordre.quantiteAFabriquer;
    besoins.set(
      item.matiere.toString(),
      (besoins.get(item.matiere.toString()) || 0) + quantite
    );
  }

  const session = await mongoose.startSession();
  try {
    let ordreDemarre;
    await session.withTransaction(async () => {
      for (const [matiereId, quantite] of besoins) {
        const matiere = await materialRepository.decrementMaterialIfAvailable(
          matiereId,
          quantite,
          { session }
        );
        if (!matiere) {
          throw new BadRequestError(
            `Stock insuffisant pour la matière nécessaire à l'ordre de fabrication`
          );
        }

        const mouvement = await stockRepository.createMouvement(
          {
            type: 'SORTIE',
            matiere: matiereId,
            quantite,
            utilisateur: userId,
            ordreFabrication: id,
            motif: `Démarrage de l'ordre de fabrication ${ordre.code}`,
          },
          { session }
        );
        await ordreRepository.addMouvementStock(id, mouvement._id, { session });
      }

      ordreDemarre = await ordreRepository.startOrdre(id, { session });
      if (!ordreDemarre) {
        throw new BadRequestError(
          "L'ordre de fabrication a déjà été démarré ou n'est plus planifié"
        );
      }
    });

    return ordreDemarre;
  } finally {
    await session.endSession();
  }
};

export const deleteOrdreService = async (id) => {
  const ordre = await ordreRepository.findOrdreById(id);
  if (!ordre) {
    throw new NotFoundError('Ordre de fabrication introuvable');
  }

  if (ordre.statut === 'EN_COURS') {
    throw new BadRequestError(
      'Impossible de supprimer un ordre de fabrication en cours'
    );
  }

  await ordreRepository.deleteOrdre(id);
  return ordre;
};