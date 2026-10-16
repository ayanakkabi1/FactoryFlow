import * as authService from '../services/authService.js';

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Authenticate with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: Login successful; returns a JWT and user data.
 *       400:
 *         description: Invalid email or missing credentials.
 *       401:
 *         description: Invalid credentials.
 */
export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return next(error);
  }
};
