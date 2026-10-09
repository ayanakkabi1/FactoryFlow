import { body, validationResult } from 'express-validator';

export const operatorRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Veuillez fournir une adresse email valide.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères.'),
];

export const validateUser = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  return next();
};
