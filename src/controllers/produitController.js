import * as produitService from '../services/produitService.js';

export const getAllProducts = async (req, res, next) => {
    try {
        const products = await produitService.getAllProducts();
        res.status(200).json({
            success: true,
            count: products.length,
            data: products,
        });
    } catch (error) {
        next(error);
    }
};

export const getProductById = async (req, res, next) => {
    try {
        const product = await produitService.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Produit introuvable',
            });
        }
        return res.status(200).json({ success: true, data: product });
    } catch (error) {
        return next(error);
    }
};

export const createProduct = async (req, res, next) => {
    try {
        const product = await produitService.createProduct(req.body);
        return res.status(201).json({
            success: true,
            message: 'Produit créé avec succès',
            data: product,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Un produit avec cette référence existe déjà',
            });
        }
        return next(error);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const product = await produitService.updateProduct(req.params.id, req.body);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Produit introuvable',
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Produit mis à jour avec succès',
            data: product,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Un produit avec cette référence existe déjà',
            });
        }
        return next(error);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const product = await produitService.deleteProduct(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Produit introuvable',
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Produit supprimé avec succès',
        });
    } catch (error) {
        return next(error);
    }
};