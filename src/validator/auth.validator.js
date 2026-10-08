import { body, validationResult } from 'express-validator';

export const loginRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage("L'email est requis.")
    .isEmail()
    .withMessage('Veuillez fournir une adresse email valide.'),
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis.'),
];

export const validateLogin = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  return next();
};
