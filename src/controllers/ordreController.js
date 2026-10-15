import * as orderService from '../services/orderService.js';


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

export const getAllOrdres = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.statut) {
      filter.statut = req.query.statut.toUpperCase();
    }
    if (req.query.produit) {
      filter.produit = req.query.produit;
    }
    if (req.query.assigneA) {
      filter.assigneA = req.query.assigneA;
    }

    const ordres = await orderService.getAllOrdresService(filter);

    return res.status(200).json({
      success: true,
      count: ordres.length,
      data: ordres,
    });
  } catch (error) {
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
    const ordres = await orderService.getOrdresByAssigneService(req.user._id);

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
      req.user.userId || req.user._id
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
      req.user.userId || req.user._id
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