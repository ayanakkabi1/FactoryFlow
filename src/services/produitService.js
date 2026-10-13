import * as produitRepository from '../repositories/produitRepositorie.js';

export const getAllProducts = async () => {
  return produitRepository.findAllProducts();
};

export const getProductById = async (id) => {
  return produitRepository.findProductById(id);
};

export const createProduct = async (product) => {
  return produitRepository.createProduct({
    ...product,
    reference: product.reference.trim().toLowerCase(),
  });
};

export const updateProduct = async (id, product) => {
  const normalizedProduct = {
    ...product,
    ...(product.reference && {
      reference: product.reference.trim().toLowerCase(),
    }),
  };
  return produitRepository.updateProduct(id, normalizedProduct);
};

export const deleteProduct = async (id) => {
  return produitRepository.deleteProduct(id);
};
