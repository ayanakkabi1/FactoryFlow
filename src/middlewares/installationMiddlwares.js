import { validationResult } from "express-validator";
import { installationRules } from "../validator/installation.validator";

export const validateInstallation = (req, res,next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({
            sucess : false,
            errors: errors.array().map((err) => err.msg),
        })
    }
    next();
};