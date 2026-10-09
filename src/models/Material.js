import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
    reference :{
       type : String ,
       required : [true, 'La référence est obligatoire'],
       Unique : true,
       trim: true,
       index : true,
    },
    name :{
       type : String ,
       required: [true, 'Le nom de la matière première est obligatoire'],
       trim: true,
    },
    uniteMesure: {
      type: String,
      required: [true, "L'unité de mesure est obligatoire"],
      trim: true,
    },
    quantiteDisponible: {
      type: Number,
      required: [true, 'La quantité disponible est obligatoire'],
      default: 0,
      min: [0, 'La quantité ne peut pas être négative'],
    },
    seuilAlerte: {
      type: Number,
      required: [true, "Le seuil d'alerte est obligatoire"],
      default: 0,
      min: [0, 'Le seuil d’alerte ne peut pas être négatif'],
    },
},
    {
    timestamps: true,
    }
);

const Material = mongoose.model('Material', materialSchema);
export default Material;