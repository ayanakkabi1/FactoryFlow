import { body, validationResult } from 'express-validator';

const sharedProductRules = [
  body('description')
    .optional()
    .isString()
    .withMessage('La description doit être une chaîne de caractères.'),
  body('prix')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le prix ne peut pas être négatif.'),
  body('composition')
    .optional()
    .isArray()
    .withMessage('La composition doit être un tableau.'),
];

export const createProductRules = [
  body('reference')
    .trim()
    .notEmpty()
    .withMessage('La référence est obligatoire.'),
  body('nom')
    .trim()
    .notEmpty()
    .withMessage('Le nom du produit est obligatoire.'),
  ...sharedProductRules,
];

export const updateProductRules = [
  body('reference')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La référence ne peut pas être vide.'),
  body('nom')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Le nom du produit ne peut pas être vide.'),
  ...sharedProductRules,
];

export const validateProduct = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  return next();
};
