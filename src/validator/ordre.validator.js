import { body, param, validationResult } from 'express-validator';

// ─── Validation middleware ───────────────────────────────────────────
export const validateOrdre = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  return next();
};

// ─── CREATE rules ────────────────────────────────────────────────────
export const createOrdreRules = [
  body('code')
    .notEmpty()
    .withMessage("Le code de l'ordre de fabrication est obligatoire.")
    .isString()
    .withMessage('Le code doit être une chaîne de caractères.')
    .trim(),
  body('produit')
    .notEmpty()
    .withMessage('Le produit est obligatoire.')
    .isMongoId()
    .withMessage("L'identifiant du produit est invalide."),
  body('quantiteAFabriquer')
    .notEmpty()
    .withMessage('La quantité à fabriquer est obligatoire.')
    .isFloat({ gt: 0 })
    .withMessage('La quantité à fabriquer doit être un nombre supérieur à zéro.'),
  body('assigneA')
    .notEmpty()
    .withMessage("L'utilisateur assigné est obligatoire.")
    .isMongoId()
    .withMessage("L'identifiant de l'utilisateur est invalide."),
];

// ─── UPDATE rules ────────────────────────────────────────────────────
export const updateOrdreRules = [
  body('code')
    .optional()
    .isString()
    .withMessage('Le code doit être une chaîne de caractères.')
    .trim(),
  body('quantiteAFabriquer')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('La quantité à fabriquer doit être un nombre supérieur à zéro.'),
  body('assigneA')
    .optional()
    .isMongoId()
    .withMessage("L'identifiant de l'utilisateur est invalide."),
];

// ─── UPDATE STATUT rules ────────────────────────────────────────────
export const updateStatutRules = [
  body('statut')
    .notEmpty()
    .withMessage('Le statut est obligatoire.')
    .isIn(['PLANIFIE', 'EN_COURS', 'TERMINE', 'ANNULE'])
    .withMessage('Le statut doit être : PLANIFIE, EN_COURS, TERMINE ou ANNULE.'),
];

// ─── ID param rules ─────────────────────────────────────────────────
export const ordreIdRules = [
  param('id')
    .isMongoId()
    .withMessage("L'identifiant de l'ordre de fabrication est invalide."),
];
