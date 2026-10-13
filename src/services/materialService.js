import * as materialRepository from '../repositories/materialRepository.js';

export const getAllMaterialsService = async () => {
  return await materialRepository.findAll();
};

export const getMaterialByIdService = async (id) => {
  const material = await materialRepository.findById(id);
  if (!material) {
    throw new Error('Matière première introuvable');
  }
  return material;
};

export const createMaterialService = async (materialData) => {
  const normalizedData = {
    ...materialData,
    reference: materialData.reference.trim().toLowerCase(),
  };
  const existingMaterial = await materialRepository.findByRef(normalizedData.reference);
  if (existingMaterial) {
    throw new Error('Une matière première avec cette référence existe déjà');
  }
  return await materialRepository.createMaterial(normalizedData);
};

export const updateMaterialService = async (id, materialData) => {
  const material = await materialRepository.findById(id);
  if (!material) {
    throw new Error('Matière première introuvable');
  }
  if (
    materialData.reference
    && materialData.reference.trim().toLowerCase() !== material.reference.toLowerCase()
  ) {
    const existingMaterial = await materialRepository.findByRef(materialData.reference);
    if (existingMaterial) {
      throw new Error('Une autre matière première utilise déjà cette référence');
    }
  }

  const normalizedData = {
    ...materialData,
    ...(materialData.reference && {
      reference: materialData.reference.trim().toLowerCase(),
    }),
  };

  return await materialRepository.updateMaterial(id, normalizedData);
};