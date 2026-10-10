import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['ALERTE_STOCK'],
      default: 'ALERTE_STOCK',
    },
    niveau: {
      type: String,
      enum: ['CRITIQUE', 'RUPTURE'],
      default: 'CRITIQUE',
    },
    message: {
      type: String,
      required: [true, 'Le message est obligatoire'],
      trim: true,
    },
    matiere: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: [true, 'La matière première est obligatoire'],
    },
    quantiteDisponible: {
      type: Number,
      required: true,
    },
    seuilAlerte: {
      type: Number,
      required: true,
    },
    mouvement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MouvementStock',
    },
    lu: {
      type: Boolean,
      default: false,
    },
    dateNotification: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;

