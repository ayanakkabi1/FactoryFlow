import mongoose from 'mongoose';

const compositionItemSchema = new mongoose.Schema(
  {
    produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produit',
      required: [true, 'Le produit est obligatoire'],
    },
    matiere: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: [true, 'La matière première est obligatoire'],
    },
    quantiteNecessaire: {
      type: Number,
      required: [true, 'La quantité nécessaire est obligatoire'],
      min: [0, 'La quantité nécessaire doit être positive'],
    },
  },
  {
    timestamps: true,
  }
);

compositionItemSchema.index({ produit: 1, matiere: 1 }, { unique: true });

compositionItemSchema.methods.getDetailsMatiere = async function () {
  if (this.populated('matiere')) {
    return this.matiere;
  }
  await this.populate('matiere');
  return this.matiere;
};

const CompositionItem = mongoose.model('CompositionItem', compositionItemSchema);

export { compositionItemSchema };
export default CompositionItem;

