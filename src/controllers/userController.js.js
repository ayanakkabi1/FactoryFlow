import * as userService from '../services/userService.js';

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