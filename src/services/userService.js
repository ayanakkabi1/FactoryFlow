import bcrypt from 'bcryptjs';
import * as userRepository from '../repositories/userRepository.js';
import { ConflictError, NotFoundError } from '../errors/AppError.js';

const createUserService = async ({ name, email, password }, role) => {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await userRepository.findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new ConflictError('Un utilisateur existe déjà avec cet email.');
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
    throw new NotFoundError('Utilisateur introuvable.');
  }

  return user;
};

export const getOperators = async () => {
  return await userRepository.findAllOperators();
};