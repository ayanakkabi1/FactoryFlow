import User from '../models/User.js';

export const createUser = async (userData) => {
  return await User.create(userData);
};

export const findUserByemail = async (email) => {
  return await User.findOne({ email: email.trim().toLowerCase() });
};

export const findUserById = async (id) => {
  return await User.findById(id).select('-password');
};

export const findAllOperators = async () => {
  return await User.find({ role: 'OPERATOR' }).select('-password');
};