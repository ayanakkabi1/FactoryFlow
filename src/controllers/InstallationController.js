import * as installationService from '../services/InstallationService.js';

export const getStatus = async (req, res, next) => {
  try {
    const status = await installationService.getStatus();

    return res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    return next(error);
  }
};

export const initialize = async (req, res, next) => {
  try {
    const result = await installationService.initialize(req.body);

    return res.status(201).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return next(error);
  }
};