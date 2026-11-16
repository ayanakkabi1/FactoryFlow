import mongoose from 'mongoose';
import { compositionItemSnapshotSchema } from './CompositionItemSnapshot.js';

const ordreProduitItemSchema = new mongoose.Schema(
  {
    produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produit',
      required: [true, 'Le produit est obligatoire'],
    },
    quantiteAFabriquer: {
      type: Number,
      required: [true, 'La quantité à fabriquer est obligatoire'],
      min: [1, 'La quantité à fabriquer doit être strictement positive'],
    },
  },
  { _id: false }
);

const ordreFabricationSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Le code de l'ordre de fabrication est obligatoire"],
      unique: true,
      trim: true,
      index: true,
    },
    produits: {
      type: [ordreProduitItemSchema],
      required: [true, 'Au moins un produit est obligatoire dans un ordre'],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'Un ordre doit contenir au moins un produit',
      },
    },
    statut: {
      type: String,
      enum: ['PLANIFIE', 'EN_COURS', 'TERMINE', 'ANNULE'],
      default: 'PLANIFIE',
    },
    dateCreation: {
      type: Date,
      default: Date.now,
    },
    dateDemarrage: Date,
    dateFin: Date,
    assigneA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "L'utilisateur assigné est obligatoire"],
    },
    composition: {
      type: [compositionItemSnapshotSchema],
      required: [true, 'La composition est obligatoire'],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "La composition de l'ordre de fabrication ne peut pas être vide",
      },
    },
    mouvementsStock: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MouvementStock',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const OrdreFabrication = mongoose.model('OrdreFabrication', ordreFabricationSchema);

export default OrdreFabrication;