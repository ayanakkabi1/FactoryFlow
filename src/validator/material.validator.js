import { body, validationResult } from 'express-validator';

export const materialRules = [
  body('reference')
    .trim()
    .notEmpty()
    .withMessage('La référence est obligatoire.'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Le nom de la matière première est obligatoire.'),
  body('uniteMesure')
    .trim()
    .notEmpty()
    .withMessage("L'unité de mesure est obligatoire."),
  body('quantiteDisponible')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('La quantité ne peut pas être négative.'),
  body('seuilAlerte')
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Le seuil d'alerte ne peut pas être négatif."),
];

export const validateMaterial = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  return next();
};
