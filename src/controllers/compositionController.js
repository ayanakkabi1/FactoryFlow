import * as compositionService from '../services/compositionService.js';

/**
 * @openapi
 * /api/compositions:
 *   get:
 *     tags: [Composition]
 *     summary: List composition items
 *     description: Optionally filter by product using the produit or produitId query parameter.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: produit
 *         schema:
 *           type: string
 *         description: MongoDB product ID.
 *     responses:
 *       200:
 *         description: Composition items and count.
 *   post:
 *     tags: [Composition]
 *     summary: Create a composition item
 *     description: Requires ADMIN role. Include produit in the request body.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompositionItem'
 *     responses:
 *       201:
 *         description: Composition item created.
 *       400:
 *         description: Invalid data or material already in composition.
 * /api/compositions/snapshot/{produitId}:
 *   get:
 *     tags: [Composition]
 *     summary: Calculate required materials for a production quantity
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: produitId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB product ID.
 *       - in: query
 *         name: quantiteAFabriquer
 *         schema:
 *           type: number
 *           default: 1
 *         description: Number of products to produce.
 *     responses:
 *       200:
 *         description: Composition snapshot.
 * /api/compositions/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: MongoDB composition item ID.
 *   get:
 *     tags: [Composition]
 *     summary: Get a composition item by ID
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Composition item details.
 *   put:
 *     tags: [Composition]
 *     summary: Update a composition item
 *     description: Requires ADMIN role.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompositionItem'
 *     responses:
 *       200:
 *         description: Composition item updated.
 *   delete:
 *     tags: [Composition]
 *     summary: Delete a composition item
 *     description: Requires ADMIN role.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Composition item deleted.
 * /api/produits/{id}/composition:
 *   get:
 *     tags: [Composition]
 *     summary: List composition items for a product
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB product ID.
 *     responses:
 *       200:
 *         description: Product composition.
 *   post:
 *     tags: [Composition]
 *     summary: Add a material to a product composition
 *     description: Requires ADMIN role.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB product ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompositionItem'
 *     responses:
 *       201:
 *         description: Composition item created.
 * /api/produits/{id}/composition/snapshot:
 *   get:
 *     tags: [Composition]
 *     summary: Calculate material requirements for a production quantity
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB product ID.
 *       - in: query
 *         name: quantiteAFabriquer
 *         schema:
 *           type: number
 *           default: 1
 *         description: Number of products to produce.
 *     responses:
 *       200:
 *         description: Composition snapshot.
 */
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

