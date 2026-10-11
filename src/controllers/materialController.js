import * as materialService from '../services/materialService.js';

export const getAllMaterials = async (req, res, next) => {
  try {
    const materials = await materialService.getAllMaterialsService();
    res.status(200).json({
      success: true,
      count: materials.length,
      data: materials,
    });
  } catch (error) {
    next(error);
  }
};

export const getMaterialById = async (req, res, next) => {
  try {
    const material = await materialService.getMaterialByIdService(req.params.id);
    res.status(200).json({
      success: true,
      data: material,
    });
  } catch (error) {
    if (error.message === 'Matière première introuvable') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const createMaterial = async (req, res, next) => {
  try {
    const newMaterial = await materialService.createMaterialService(req.body);
    res.status(201).json({
      success: true,
      message: 'Matière première créée avec succès',
      data: newMaterial,
    });
  } catch (error) {
    if (error.message === 'Une matière première avec cette référence existe déjà') {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const updateMaterial = async (req, res, next) => {
  try {
    const updatedMaterial = await materialService.updateMaterialService(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Matière première mise à jour avec succès',
      data: updatedMaterial,
    });
  } catch (error) {
    if (error.message === 'Matière première introuvable') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message === 'Une autre matière première utilise déjà cette référence') {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};