import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const login = async (email, password) => {
    const genericError = new Error("Email ou mot de passe incorrect.");
    genericError.statusCode = 401;
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
    throw genericError;
    }
    if (!user.isActive) {
    throw genericError;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
    throw genericError;
    }
    const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET || 'super_secret_jwt_key',
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
