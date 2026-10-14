import mongoose from 'mongoose';
import * as ordreRepository from '../repositories/ordreRepository.js';
import * as materialRepository from '../repositories/materialRepository.js';
import * as stockRepository from '../repositories/stockRepository.js';
import * as notificationRepository from '../repositories/notificationRepository.js';
import * as compositionService from './compositionService.js';
import Produit from '../models/Produit.js';
import User from '../models/User.js';
import { arrondirQuantite } from '../models/CompositionItemSnapshot.js';
import { NotFoundError, BadRequestError, ConflictError } from '../errors/AppError.js';

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
    throw new BadRequestError(
      `Un ordre de fabrication avec le code "${code}" existe déjà`
    );
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

export const calculerBesoinsMatieres = (ordre) => {
  const besoinsParMatiere = new Map();

  for (const item of ordre.composition) {
    if (!item.matiere) {
      throw new BadRequestError(
        `La matière "${item.nomMatiere}" de la composition n'est pas liée à une matière première`
      );
    }

    const matiereId = item.matiere.toString();
    const besoin = item.calculerBesoinsTotaux(ordre.quantiteAFabriquer);
    const existant = besoinsParMatiere.get(matiereId);

    besoinsParMatiere.set(matiereId, {
      matiere: matiereId,
      nomMatiere: item.nomMatiere,
      uniteMesure: item.uniteMesure,
      quantiteNecessaire: existant
        ? arrondirQuantite(existant.quantiteNecessaire + besoin)
        : besoin,
    });
  }

  return [...besoinsParMatiere.values()];
};

const construireAlerteStock = (matiere, mouvementId) => ({
  type: 'ALERTE_STOCK',
  niveau: matiere.quantiteDisponible === 0 ? 'RUPTURE' : 'CRITIQUE',
  message: `Alerte stock : La matière première "${matiere.name}" (${matiere.reference}) est sous son seuil d'alerte. Quantité restante : ${matiere.quantiteDisponible} ${matiere.uniteMesure} (seuil : ${matiere.seuilAlerte} ${matiere.uniteMesure}).`,
  matiere: matiere._id,
  quantiteDisponible: matiere.quantiteDisponible,
  seuilAlerte: matiere.seuilAlerte,
  mouvement: mouvementId,
});

export const demarrerOrdreService = async (id, userId) => {
  if (!userId) {
    throw new BadRequestError("L'utilisateur qui démarre l'ordre est obligatoire");
  }

  const session = await mongoose.startSession();
  let besoins;

  try {
    await session.withTransaction(async () => {
      const ordre = await ordreRepository.findOrdreByIdWithSession(id, session);
      if (!ordre) {
        throw new NotFoundError('Ordre de fabrication introuvable');
      }

      if (ordre.statut !== 'PLANIFIE') {
        throw new BadRequestError(
          `Seuls les ordres au statut PLANIFIE peuvent être démarrés (statut actuel : ${ordre.statut})`
        );
      }

      besoins = calculerBesoinsMatieres(ordre);

      const matieres = await materialRepository.findByIds(
        besoins.map((b) => b.matiere),
        session
      );
      const matieresParId = new Map(matieres.map((m) => [m._id.toString(), m]));

      const manquants = besoins
        .map((besoin) => {
          const matiere = matieresParId.get(besoin.matiere);
          const quantiteDisponible = matiere ? matiere.quantiteDisponible : 0;
          return {
            ...besoin,
            quantiteDisponible,
            manque: arrondirQuantite(besoin.quantiteNecessaire - quantiteDisponible),
            introuvable: !matiere,
          };
        })
        .filter((b) => b.introuvable || b.manque > 0);

      if (manquants.length > 0) {
        throw new BadRequestError(
          `Stock insuffisant pour démarrer l'ordre de fabrication : ${manquants
            .map((m) => m.nomMatiere)
            .join(', ')}`,
          manquants
        );
      }

      const matieresMaj = [];
      for (const besoin of besoins) {
        const matiereMaj = await materialRepository.decrementerStockSiDisponible(
          besoin.matiere,
          besoin.quantiteNecessaire,
          session
        );
        if (!matiereMaj) {
          throw new ConflictError(
            `Stock insuffisant pour la matière "${besoin.nomMatiere}"`
          );
        }
        matieresMaj.push(matiereMaj);
      }

      const mouvements = await stockRepository.createMouvements(
        besoins.map((besoin) => ({
          type: 'SORTIE',
          quantite: besoin.quantiteNecessaire,
          matiere: besoin.matiere,
          utilisateur: userId,
          ordreFabrication: ordre._id,
          motif: `Consommation pour l'ordre de fabrication ${ordre.code}`,
        })),
        session
      );

      const alertes = matieresMaj
        .map((matiere, index) => ({ matiere, mouvement: mouvements[index] }))
        .filter(({ matiere }) => matiere.quantiteDisponible <= matiere.seuilAlerte)
        .map(({ matiere, mouvement }) => construireAlerteStock(matiere, mouvement._id));

      if (alertes.length > 0) {
        await notificationRepository.createNotifications(alertes, session);
      }

      const ordreDemarre = await ordreRepository.marquerOrdreEnCours(
        ordre._id,
        mouvements.map((m) => m._id),
        session
      );
      if (!ordreDemarre) {
        throw new ConflictError("L'ordre de fabrication a déjà été démarré");
      }
    });
  } finally {
    await session.endSession();
  }

  const ordre = await ordreRepository.findOrdreById(id);
  return { ordre, besoins };
};

export const updateStatutService = async (id, nouveauStatut, userId) => {
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

  if (nouveauStatut === 'EN_COURS') {
    const { ordre: ordreDemarre } = await demarrerOrdreService(id, userId);
    return ordreDemarre;
  }

  return ordreRepository.updateStatut(id, nouveauStatut);
};

export const deleteOrdreService = async (id) => {
  const ordre = await ordreRepository.findOrdreById(id);
  if (!ordre) {
    throw new NotFoundError('Ordre de fabrication introuvable');
  }

  if (ordre.statut === 'EN_COURS') {
    throw new BadRequestError('Impossible de supprimer un ordre de fabrication en cours');
  }

  await ordreRepository.deleteOrdre(id);
  return ordre;
};
