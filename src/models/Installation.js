import mongoose from 'mongoose';
const installationSchema = new mongoose.Schema(
    {
        isInstalled: {
          type: Boolean,
          default: false,
          required:true,
        },
        installedAt: {
            type: Date,
            default: Date.now,
        },
        installedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        adminInitialEmail: {
            type: String,
            trim: true,
            lowercase: true,
        },
    },
    {
        timestamps: true,
    }
);
const Installation = mongoose.model('Installation',installationSchema);
export default Installation;