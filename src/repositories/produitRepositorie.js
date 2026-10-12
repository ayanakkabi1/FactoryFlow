import Produit from '../models/Produit.js';

const createProduct = async (productData) => {
  const product = new Product(productData);
  return await product.save();
};

const findAllProducts = async () => {
  return await Product.find().populate('composition.matierePremiereId');
};

const findProductById = async (id) => {
  return await Product.findById(id).populate('composition.matierePremiereId');
};

const updateProduct = async (id, updateData) => {
  return await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

const deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};