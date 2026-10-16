import Produit from '../models/Produit.js';
import '../models/CompositionItem.js';

export const createProduct = async (productData) => {
  return Produit.create(productData);
};

export const findAllProducts = async () => {
  return Produit.find().populate({
    path: 'composition',
    populate: { path: 'matiere' },
  });
};

export const findProductById = async (id) => {
  return Produit.findById(id).populate({
    path: 'composition',
    populate: { path: 'matiere' },
  });
};

export const updateProduct = async (id, updateData) => {
  return Produit.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate({
    path: 'composition',
    populate: { path: 'matiere' },
  });
};

export const deleteProduct = async (id) => {
  return Produit.findByIdAndDelete(id);
};

export const incrementProductStock = (id, quantity, options = {}) =>
  Produit.findByIdAndUpdate(
    id,
    { $inc: { quantiteDisponible: quantity } },
    { new: true, runValidators: true, ...options }
  );
