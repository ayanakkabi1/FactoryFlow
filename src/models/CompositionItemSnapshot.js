import mongoose from 'mongoose';

const PRECISION_QUANTITE = 1e6;

export const arrondirQuantite = (valeur) =>
  Math.round(valeur * PRECISION_QUANTITE) / PRECISION_QUANTITE;

const compositionItemSnapshotSchema = new mongoose.Schema(
  {
    matiere: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: [true, 'La matière première est obligatoire'],
    },
    nomMatiere: {
      type: String,
      required: [true, 'Le nom de la matière première est obligatoire'],
      trim: true,
    },
    uniteMesure: {
      type: String,
      required: [true, "L'unité de mesure est obligatoire"],
      trim: true,
    },
    quantiteUnitaireNecessaire: {
      type: Number,
      required: [true, 'La quantité unitaire nécessaire est obligatoire'],
      min: [0, 'La quantité unitaire nécessaire doit être positive'],
    },
  },
  {
    _id: false,
  }
);

compositionItemSnapshotSchema.methods.calculerBesoinsTotaux = function (quantiteOF) {
  if (quantiteOF === undefined || quantiteOF === null || quantiteOF < 0) {
    throw new Error("La quantité de l'ordre de fabrication doit être positive");
  }
  return arrondirQuantite(this.quantiteUnitaireNecessaire * quantiteOF);
};

const CompositionItemSnapshot = mongoose.model(
  'CompositionItemSnapshot',
  compositionItemSnapshotSchema
);

export { compositionItemSnapshotSchema };
export default CompositionItemSnapshot;
