import * as installationService from '../services/InstallationService.js';
import * as installationRepository from '../repositories/InstallationRepositorie.js';

/**
 * @openapi
 * /api/installation/status:
 *   get:
 *     tags: [Installation]
 *     summary: Check whether initial setup is complete
 *     responses:
 *       200:
 *         description: Installation status.
 * /api/installation/installed-by:
 *   get:
 *     tags: [Installation]
 *     summary: List installation records
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Installation records.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Administrator role required.
 * /api/installation/initialize:
 *   post:
 *     tags: [Installation]
 *     summary: Initialize the app and create the first administrator
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Installation'
 *     responses:
 *       201:
 *         description: Application initialized.
 *       400:
 *         description: Invalid installation details.
 * /api/installation:
 *   post:
 *     tags: [Installation]
 *     summary: Initialize the app and create the first administrator
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Installation'
 *     responses:
 *       201:
 *         description: Application initialized.
 *       400:
 *         description: Invalid installation details.
 */
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
