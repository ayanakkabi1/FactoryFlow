import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom est requis.'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email est requis."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Veuillez fournir une adresse email valide.',
      ],
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est requis.'],
      minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères.'],
      select: false,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'USER', 'OPERATOR'],
      default: 'USER',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


const User = mongoose.model('User', userSchema);

export default User;