import mongoose from 'mongoose';

const mouvementStockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: {
        values: ['ENTREE', 'SORTIE'],
        message: 'Le type de mouvement doit être ENTREE ou SORTIE',
      },
      required: [true, 'Le type de mouvement est obligatoire'],
    },
    quantite: {
      type: Number,
      required: [true, 'La quantité est obligatoire'],
      min: [0, 'La quantité doit être positive'],
    },
    dateMouvement: {
      type: Date,
      default: Date.now,
    },
    matiere: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: [true, 'La matière première est obligatoire'],
    },
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "L'utilisateur est obligatoire"],
    },
    ordreFabrication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrdreFabrication',
    },
    motif: {
      type: String,
      default: 'Réapprovisionnement stock'
    },
  },
  {
    timestamps: true,
  }
);

const MouvementStock = mongoose.model('MouvementStock', mouvementStockSchema);

export default MouvementStock;