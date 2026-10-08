import { body, validationResult } from "express-validator";

export const installationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Le nom de l’utilisateur est requis."),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("L’email est requis.")
    .isEmail()
    .withMessage("Veuillez fournir une adresse email valide."),

  body("password")
    .notEmpty()
    .withMessage("Le mot de passe est requis.")
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit contenir au moins 6 caractères."),
];

export const validateInstallation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  return next();
};
