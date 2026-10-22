import CompositionItem from '../models/CompositionItem.js';
import Produit from '../models/Produit.js';

export const createCompositionItem = async (data) => {
  return CompositionItem.create(data);
};

export const findAllCompositionItems = async (filter = {}) => {
  return CompositionItem.find(filter)
    .populate('matiere')
    .populate('produit');
};

export const findCompositionItemById = async (id) => {
  return CompositionItem.findById(id)
    .populate('matiere')
    .populate('produit');
};

export const findCompositionItemRawById = (id) => CompositionItem.findById(id);

export const findCompositionByProductId = async (produitId) => {
  return CompositionItem.find({ produit: produitId }).populate('matiere');
};

export const findByProductAndMaterial = async (produitId, matiereId) => {
  return CompositionItem.findOne({ produit: produitId, matiere: matiereId });
};

export const updateCompositionItem = async (id, data) => {
  return CompositionItem.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
    .populate('matiere')
    .populate('produit');
};

export const deleteCompositionItem = async (id) => {
  return CompositionItem.findByIdAndDelete(id);
};

export const deleteCompositionByProductId = async (produitId) => {
  return CompositionItem.deleteMany({ produit: produitId });
};

export const addCompositionToProduct = async (produitId, compositionItemId) => {
  return Produit.findByIdAndUpdate(
    produitId,
    { $addToSet: { composition: compositionItemId } },
    { new: true }
  );
};

export const removeCompositionFromProduct = async (produitId, compositionItemId) => {
  return Produit.findByIdAndUpdate(
    produitId,
    { $pull: { composition: compositionItemId } },
    { new: true }
  );
};

