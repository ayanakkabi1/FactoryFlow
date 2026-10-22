import * as userService from '../services/userService.js';

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get the authenticated user's profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: User profile.
 * /api/users/operators:
 *   get:
 *     tags: [Users]
 *     summary: List operators
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Operator list.
 *   post:
 *     tags: [Users]
 *     summary: Create an operator account
 *     description: Requires ADMIN role.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Operator created.
 *       400:
 *         description: Invalid user details.
 * /api/users/admins:
 *   post:
 *     tags: [Users]
 *     summary: Create an administrator account
 *     description: Requires ADMIN role.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Administrator created.
 *       400:
 *         description: Invalid user details.
 */
export const createOperator = async (req, res, next) => {
  try {
    const operator = await userService.createOperatorService(req.body);

    return res.status(201).json({
      success: true,
      data: operator,
    });
  } catch (error) {
    return next(error);
  }
};

export const createAdmin = async (req, res, next) => {
  try {
    const admin = await userService.createAdminService(req.body);

    return res.status(201).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    return next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserProfile(req.user.userId);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

export const getOperators = async (req, res, next) => {
  try {
    const operators = await userService.getOperators();

    return res.status(200).json({
      success: true,
      data: operators,
    });
  } catch (error) {
    return next(error);
  }
};

