import * as compositionRepository from '../repositories/compositionRepository.js';
import CompositionItem from '../models/CompositionItem.js';
import CompositionItemSnapshot from '../models/CompositionItemSnapshot.js';
import Produit from '../models/Produit.js';
import Material from '../models/Material.js';

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const createCompositionItem = async ({ produit, matiere, quantiteNecessaire }) => {
  const produitExists = await Produit.findById(produit);
  if (!produitExists) {
    throw createHttpError('Produit introuvable', 404);
  }

  const matiereExists = await Material.findById(matiere);
  if (!matiereExists) {
    throw createHttpError('Matière première introuvable', 404);
  }

  const quantiteNum = Number(quantiteNecessaire);
  if (!Number.isFinite(quantiteNum) || quantiteNum <= 0) {
    throw createHttpError('La quantité nécessaire doit être positive', 400);
  }

  const alreadyExists = await compositionRepository.findByProductAndMaterial(produit, matiere);
  if (alreadyExists) {
    throw createHttpError('Cette matière première fait déjà partie de la composition du produit', 400);
  }

  const item = await compositionRepository.createCompositionItem({
    produit,
    matiere,
    quantiteNecessaire: quantiteNum,
  });

  await compositionRepository.addCompositionToProduct(produit, item._id);

  return compositionRepository.findCompositionItemById(item._id);
};

export const getAllCompositionItems = async (filter = {}) => {
  return compositionRepository.findAllCompositionItems(filter);
};

export const getCompositionItemById = async (id) => {
  const item = await compositionRepository.findCompositionItemById(id);
  if (!item) {
    throw createHttpError('Élément de composition introuvable', 404);
  }
  return item;
};

export const getCompositionByProductId = async (produitId) => {
  const produitExists = await Produit.findById(produitId);
  if (!produitExists) {
    throw createHttpError('Produit introuvable', 404);
  }

  return compositionRepository.findCompositionByProductId(produitId);
};

export const updateCompositionItem = async (id, updateData) => {
  const existing = await CompositionItem.findById(id);
  if (!existing) {
    throw createHttpError('Élément de composition introuvable', 404);
  }

  const payload = {};

  if (updateData.matiere && updateData.matiere.toString() !== existing.matiere.toString()) {
    const matiereExists = await Material.findById(updateData.matiere);
    if (!matiereExists) {
      throw createHttpError('Matière première introuvable', 404);
    }

    const duplicate = await compositionRepository.findByProductAndMaterial(
      existing.produit,
      updateData.matiere
    );
    if (duplicate && duplicate._id.toString() !== id.toString()) {
      throw createHttpError('Cette matière première fait déjà partie de la composition du produit', 400);
    }
    payload.matiere = updateData.matiere;
  }

  if (updateData.quantiteNecessaire !== undefined) {
    const quantiteNum = Number(updateData.quantiteNecessaire);
    if (!Number.isFinite(quantiteNum) || quantiteNum <= 0) {
      throw createHttpError('La quantité nécessaire doit être positive', 400);
    }
    payload.quantiteNecessaire = quantiteNum;
  }

  return compositionRepository.updateCompositionItem(id, payload);
};

export const deleteCompositionItem = async (id) => {
  const item = await CompositionItem.findById(id);
  if (!item) {
    throw createHttpError('Élément de composition introuvable', 404);
  }

  await compositionRepository.removeCompositionFromProduct(item.produit, item._id);
  await compositionRepository.deleteCompositionItem(id);

  return item;
};

export const generateCompositionSnapshotDocuments = async (produitId) => {
  const produit = await Produit.findById(produitId);
  if (!produit) {
    throw createHttpError('Produit introuvable', 404);
  }

  const items = await compositionRepository.findCompositionByProductId(produitId);
  if (!items || items.length === 0) {
    throw createHttpError("Le produit n'a aucune composition définie pour générer un snapshot", 400);
  }

  return items.map((item) => new CompositionItemSnapshot({
    nomMatiere: item.matiere?.name || item.matiere?.nom,
    uniteMesure: item.matiere?.uniteMesure,
    quantiteUnitaireNecessaire: item.quantiteNecessaire,
  }));
};

export const getCompositionSnapshot = async (produitId, quantiteAFabriquer = 1) => {
  const produit = await Produit.findById(produitId);
  if (!produit) {
    throw createHttpError('Produit introuvable', 404);
  }

  const items = await compositionRepository.findCompositionByProductId(produitId);
  if (!items || items.length === 0) {
    throw createHttpError("Le produit n'a aucune composition définie pour générer un snapshot", 400);
  }

  const quantiteNum = Number(quantiteAFabriquer);
  if (!Number.isFinite(quantiteNum) || quantiteNum <= 0) {
    throw createHttpError('La quantité à fabriquer doit être un nombre positif', 400);
  }

  const snapshots = items.map((item) => {
    const nomMatiere = item.matiere?.name || item.matiere?.nom;
    const uniteMesure = item.matiere?.uniteMesure;
    const quantiteUnitaireNecessaire = item.quantiteNecessaire;

    const snap = new CompositionItemSnapshot({
      nomMatiere,
      uniteMesure,
      quantiteUnitaireNecessaire,
    });

    return {
      nomMatiere,
      uniteMesure,
      quantiteUnitaireNecessaire,
      besoinsTotaux: snap.calculerBesoinsTotaux(quantiteNum),
    };
  });

  return {
    produit: {
      _id: produit._id,
      reference: produit.reference,
      nom: produit.nom,
    },
    quantiteAFabriquer: quantiteNum,
    composition: snapshots,
  };
};

