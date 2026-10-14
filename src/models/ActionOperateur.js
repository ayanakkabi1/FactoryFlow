import mongoose from 'mongoose';

const actionOperateurSchema = new mongoose.Schema(
  {
    operateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ordreFabrication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrdreFabrication',
      required: true,
    },
    action: {
      type: String,
      enum: ['DEMARRAGE_ORDRE', 'FINALISATION_ORDRE'],
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

actionOperateurSchema.index({ operateur: 1, createdAt: -1 });

const ActionOperateur = mongoose.model('ActionOperateur', actionOperateurSchema);

export default ActionOperateur;
