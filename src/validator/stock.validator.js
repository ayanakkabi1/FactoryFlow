import { body, validationResult } from 'express-validator';

export const mouvementStockRules = [
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Le type de mouvement est obligatoire.')
    .isIn(['ENTREE', 'SORTIE'])
    .withMessage('Le type de mouvement doit être ENTREE ou SORTIE.'),
  body('matiereId')
    .notEmpty()
    .withMessage('La matière première est obligatoire.')
    .isMongoId()
    .withMessage("L'identifiant de la matière première est invalide."),
  body('quantite')
    .isFloat({ gt: 0 })
    .withMessage('La quantité doit être un nombre supérieur à zéro.'),
  body('motif')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Le motif ne peut pas dépasser 255 caractères.'),
];

export const validateMouvementStock = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  return next();
};
