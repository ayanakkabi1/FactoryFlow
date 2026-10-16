import * as orderService from '../services/orderService.js';

/**
 * @openapi
 * /api/ordres:
 *   get:
 *     tags: [Orders]
 *     summary: List manufacturing orders
 *     description: Supports statut, produit, assigneA, creation date range and pagination filters. ADMIN only.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [PLANIFIE, EN_COURS, TERMINE, ANNULE]
 *       - in: query
 *         name: produit
 *         schema:
 *           type: string
 *         description: MongoDB product ID.
 *       - in: query
 *         name: assigneA
 *         schema:
 *           type: string
 *         description: MongoDB user ID.
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: Manufacturing orders and count.
 *   post:
 *     tags: [Orders]
 *     summary: Create a manufacturing order
 *     description: Requires ADMIN role.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Order created.
 *       400:
 *         description: Invalid order or duplicate code.
 * /api/ordres/mes-ordres:
 *   get:
 *     tags: [Orders]
 *     summary: List orders assigned to the authenticated user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Assigned orders and count.
 * /api/ordres/historique:
 *   get:
 *     tags: [Orders]
 *     summary: Get the authenticated operator activity history
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Operator history.
 * /api/ordres/statut/{statut}:
 *   get:
 *     tags: [Orders]
 *     summary: List orders by status
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: statut
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PLANIFIE, EN_COURS, TERMINE, ANNULE]
 *     responses:
 *       200:
 *         description: Matching orders and count.
 * /api/ordres/code/{code}:
 *   get:
 *     tags: [Orders]
 *     summary: Find a manufacturing order by its code
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Matching manufacturing order.
 * /api/ordres/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: MongoDB order ID.
 *   get:
 *     tags: [Orders]
 *     summary: Get an order by ID
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Manufacturing order.
 *   put:
 *     tags: [Orders]
 *     summary: Update a manufacturing order
 *     description: Requires ADMIN role.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       200:
 *         description: Order updated.
 *   delete:
 *     tags: [Orders]
 *     summary: Delete a manufacturing order
 *     description: Requires ADMIN role.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Order deleted.
 * /api/ordres/{id}/statut:
 *   patch:
 *     tags: [Orders]
 *     summary: Cancel a planned order
 *     description: Only ADMIN can cancel an order while its status is PLANIFIE.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB order ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderStatus'
 *     responses:
 *       200:
 *         description: Order status updated.
 * /api/ordres/{id}/demarrer:
 *   patch:
 *     tags: [Orders]
 *     summary: Start a manufacturing order
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB order ID.
 *     responses:
 *       200:
 *         description: Order started.
 * /api/ordres/{id}/finaliser:
 *   patch:
 *     tags: [Orders]
 *     summary: Finish a manufacturing order
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB order ID.
 *     responses:
 *       200:
 *         description: Order finished.
 */


export const createOrdre = async (req, res, next) => {
  try {
    const { code, produit, quantiteAFabriquer, assigneA } = req.body;

    const ordre = await orderService.createOrdreService({
      code,
      produit,
      quantiteAFabriquer,
      assigneA,
    });

    return res.status(201).json({
      success: true,
      message: 'Ordre de fabrication créé avec succès',
      data: ordre,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ce code d\'ordre de fabrication existe déjà',
      });
    }
    return next(error);
  }
};

export const getOrdreById = async (req, res, next) => {
  try {
    const ordre = await orderService.getOrdreByIdService(req.params.id);

    return res.status(200).json({
      success: true,
      data: ordre,
    });
  } catch (error) {
    return next(error);
  }
};


export const getOrdreByCode = async (req, res, next) => {
  try {
    const ordre = await orderService.getOrdreByCodeService(req.params.code);

    return res.status(200).json({
      success: true,
      data: ordre,
    });
  } catch (error) {
    return next(error);
  }
};

export const getOrdresByStatut = async (req, res, next) => {
  try {
    const ordres = await orderService.getOrdresByStatutService(
      req.params.statut.toUpperCase()
    );

    return res.status(200).json({
      success: true,
      count: ordres.length,
      data: ordres,
    });
  } catch (error) {
    return next(error);
  }
};

export const getMesOrdres = async (req, res, next) => {
  try {
    const ordres = await orderService.getOrdresByAssigneService(req.user.userId);

    return res.status(200).json({
      success: true,
      count: ordres.length,
      data: ordres,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateOrdre = async (req, res, next) => {
  try {
    const ordre = await orderService.updateOrdreService(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: 'Ordre de fabrication mis à jour avec succès',
      data: ordre,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateStatut = async (req, res, next) => {
  try {
    const ordre = await orderService.updateStatutService(
      req.params.id,
      req.body.statut
    );

    return res.status(200).json({
      success: true,
      message: `Statut mis à jour vers ${ordre.statut}`,
      data: ordre,
    });
  } catch (error) {
    return next(error);
  }
};

export const startOrdre = async (req, res, next) => {
  try {
    const ordre = await orderService.startOrdreService(
      req.params.id,
      req.user.userId,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      message: "Ordre de fabrication démarré avec succès",
      data: ordre,
    });
  } catch (error) {
    return next(error);
  }
};

export const finishOrdre = async (req, res, next) => {
  try {
    const ordre = await orderService.finishOrdreService(
      req.params.id,
      req.user.userId,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      message: 'Ordre de fabrication finalisé avec succès',
      data: ordre,
    });
  } catch (error) {
    return next(error);
  }
};

export const getHistoriqueOperateur = async (req, res, next) => {
  try {
    const historique = await orderService.getHistoriqueOperateurService(
      req.user.userId || req.user._id
    );

    return res.status(200).json({
      success: true,
      count: historique.length,
      data: historique,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteOrdreByAdmin = async (req, res, next) => {
  try {
    await orderService.deleteOrdreService(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Ordre de fabrication supprimé avec succès',
    });
  } catch (error) {
    return next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const result = await orderService.getFilteredOrdersService(req.query);

    res.status(200).json({
      success: true,
      count: result.orders.length,
      total: result.total,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      data: result.orders
    });
  } catch (error) {
    next(error);
  }
};
