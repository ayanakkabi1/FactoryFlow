import bcrypt from 'bcryptjs';
import * as userRepository from '../repositories/UserRepositorie.js';

const createUserService = async ({ name, email, password }, role) => {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await userRepository.findUserByemail(normalizedEmail);
  if (existingUser) {
    const error = new Error('Un utilisateur existe déjà avec cet email.');
    error.statusCode = 409;
    throw error;
  }

  const user = await userRepository.createUser({
    name,
    email: normalizedEmail,
    password: await bcrypt.hash(password, 10),
    role,
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
};

export const createOperatorService = async (data) => {
  return await createUserService(data, 'OPERATOR');
};

export const createAdminService = async (data) => {
  return await createUserService(data, 'ADMIN');
};

export const getUserProfile = async (userId) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    const error = new Error('Utilisateur introuvable.');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

export const getOperators = async () => {
  return await userRepository.findAllOperators();
};