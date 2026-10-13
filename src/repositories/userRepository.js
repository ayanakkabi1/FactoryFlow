import User from '../models/User.js';

export const createUser = async (userData) => {
  return await User.create(userData);
};

export const findUserByEmail = async (email) => {
  return await User.findOne({ email: email.trim().toLowerCase() });
};

// Alias for backwards compatibility
export const findUserByemail = findUserByEmail;

export const findUserByEmailWithPassword = async (email) => {
  return await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
};

export const findUserById = async (id) => {
  return await User.findById(id).select('-password');
};

export const findAllOperators = async () => {
  return await User.find({ role: 'OPERATOR' }).select('-password');
};

