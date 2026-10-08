import * as installationService from '../services/InstallationService.js';
import * as installationRepository from '../repositories/InstallationRepositorie.js';

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

export const getInstalledBy = async (req, res, next) => {
  try {
    const installations = await installationRepository.installedBy();

    return res.status(200).json({
      success: true,
      data: installations,
    });
  } catch (error) {
    return next(error);
  }
};