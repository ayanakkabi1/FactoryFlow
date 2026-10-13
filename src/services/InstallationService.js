import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import * as installationRepository from '../repositories/installationRepository.js';
import { BadRequestError } from '../errors/AppError.js';

export const getStatus = async () => {
  return await installationRepository.findStatus();
};

export const initialize = async (data) => {
  const { name, email, password } = data;
  const hashedPassword = await bcrypt.hash(password, 10);
  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const currentStatus = await installationRepository.findStatus(session);
      if (currentStatus && currentStatus.isInstalled) {
        throw new BadRequestError("L'application est déjà installée.");
      }

      const [createdAdmin] = await User.create(
        [
          {
            name,
            email,
            password: hashedPassword,
            role: 'ADMIN',
          },
        ],
        { session }
      );

      await installationRepository.createInstallation(
        {
          isInstalled: true,
          installedAt: new Date(),
          installedBy: createdAdmin._id,
        },
        session
      );

      result = {
        message: 'Installation réussie',
        admin: {
          id: createdAdmin._id,
          name: createdAdmin.name,
          email: createdAdmin.email,
          role: createdAdmin.role,
        },
      };
    });

    return result;
  } catch (error) {
    if (error.message?.includes('Transaction numbers are only allowed')) {
      error.statusCode = 503;
      error.message =
        'MongoDB doit être configuré en replica set pour effectuer l’installation.';
    }

    throw error;
  } finally {
    await session.endSession();
  }
};