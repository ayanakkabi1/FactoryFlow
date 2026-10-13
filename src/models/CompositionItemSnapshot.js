import mongoose from 'mongoose';

const compositionItemSnapshotSchema = new mongoose.Schema(
  {
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
  return this.quantiteUnitaireNecessaire * quantiteOF;
};

const CompositionItemSnapshot = mongoose.model(
  'CompositionItemSnapshot',
  compositionItemSnapshotSchema
);

export { compositionItemSnapshotSchema };
export default CompositionItemSnapshot;
