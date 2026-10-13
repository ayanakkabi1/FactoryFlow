import { body, validationResult } from 'express-validator';

export const createCompositionItemRules = [
  body('matiere')
    .notEmpty()
    .withMessage('La matière première est obligatoire.')
    .isMongoId()
    .withMessage("L'identifiant de la matière première est invalide."),
  body('quantiteNecessaire')
    .notEmpty()
    .withMessage('La quantité nécessaire est obligatoire.')
    .isFloat({ gt: 0 })
    .withMessage('La quantité nécessaire doit être un nombre supérieur à zéro.'),
  body('produit')
    .if((value, { req }) => !req.params?.id && !req.params?.produitId)
    .notEmpty()
    .withMessage('Le produit est obligatoire.')
    .isMongoId()
    .withMessage("L'identifiant du produit est invalide."),
];

export const updateCompositionItemRules = [
  body('matiere')
    .optional()
    .isMongoId()
    .withMessage("L'identifiant de la matière première est invalide."),
  body('quantiteNecessaire')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('La quantité nécessaire doit être un nombre supérieur à zéro.'),
];

export const validateComposition = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  return next();
};

