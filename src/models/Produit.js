import mongoose from 'mongoose';

const produitSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: [true, 'La référence du produit est obligatoire'],
      unique: true,
      trim: true,
      index: true,
    },
    nom: {
      type: String,
      required: [true, 'Le nom du produit est obligatoire'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    prix: {
      type: Number,
      min: [0, 'Le prix ne peut pas être négatif'],
    },
    quantiteDisponible: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'La quantité disponible ne peut pas être négative'],
    },
    composition: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CompositionItem',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Produit = mongoose.model('Produit', produitSchema);

export default Produit;