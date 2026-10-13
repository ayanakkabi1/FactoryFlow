import * as compositionService from '../services/compositionService.js';

export const getAllCompositionItems = async (req, res, next) => {
  try {
    const filter = {};
    const produitId = req.query.produit || req.query.produitId;
    if (produitId) {
      filter.produit = produitId;
    }

    const items = await compositionService.getAllCompositionItems(filter);
    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    return next(error);
  }
};

export const getCompositionItemById = async (req, res, next) => {
  try {
    const item = await compositionService.getCompositionItemById(req.params.id);
    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    return next(error);
  }
};

export const getCompositionByProduct = async (req, res, next) => {
  try {
    const produitId = req.params.id || req.params.produitId;
    const items = await compositionService.getCompositionByProductId(produitId);
    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    return next(error);
  }
};

export const createCompositionItem = async (req, res, next) => {
  try {
    const produit = req.params.id || req.params.produitId || req.body.produit;
    const { matiere, quantiteNecessaire } = req.body;

    const item = await compositionService.createCompositionItem({
      produit,
      matiere,
      quantiteNecessaire,
    });

    return res.status(201).json({
      success: true,
      message: 'Élément de composition créé avec succès',
      data: item,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Cette matière première fait déjà partie de la composition du produit',
      });
    }
    return next(error);
  }
};

export const updateCompositionItem = async (req, res, next) => {
  try {
    const item = await compositionService.updateCompositionItem(
      req.params.id,
      req.body
    );
    return res.status(200).json({
      success: true,
      message: 'Élément de composition mis à jour avec succès',
      data: item,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Cette matière première fait déjà partie de la composition du produit',
      });
    }
    return next(error);
  }
};

export const deleteCompositionItem = async (req, res, next) => {
  try {
    await compositionService.deleteCompositionItem(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Élément de composition supprimé avec succès',
    });
  } catch (error) {
    return next(error);
  }
};

export const getCompositionSnapshot = async (req, res, next) => {
  try {
    const produitId = req.params.produitId || req.params.id;
    const quantiteAFabriquer = req.query.quantiteAFabriquer || req.query.quantite || 1;

    const snapshot = await compositionService.getCompositionSnapshot(
      produitId,
      quantiteAFabriquer
    );

    return res.status(200).json({
      success: true,
      data: snapshot,
    });
  } catch (error) {
    return next(error);
  }
};

