import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as userRepository from '../repositories/userRepository.js';
import { UnauthorizedError } from '../errors/AppError.js';

export const login = async (email, password) => {
  const genericError = new UnauthorizedError('Email ou mot de passe incorrect.');
  const normalizedEmail = email.trim().toLowerCase();
  const user = await userRepository.findUserByEmailWithPassword(normalizedEmail);

  if (!user || !user.isActive) {
    throw genericError;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw genericError;
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('Missing required environment variable: JWT_SECRET');
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

  return {
    message: 'Connexion réussie',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};
