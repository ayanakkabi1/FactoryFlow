import Material from '../models/Material.js';

export const findAll = async() => {
    return await Material.find();
}

export const findById = async(id) => {
    return await Material.findById(id);
}

export const findByRef = async(reference) => {
    return await Material.findOne({ reference: reference.trim().toLowerCase() });
}

export const createMaterial = async(data) => {
    return await Material.create({
        ...data,
        reference: data.reference.trim().toLowerCase(),
    });
}

export const updateMaterial = async(id, data) => {
    return await Material.findByIdAndUpdate(id, data, { new: true, runValidators: true })
}

export const incrementeMaterial = async (matiereId, impactStock) => {
    return await Material.findByIdAndUpdate(
      matiereId,
      { $inc: { quantiteDisponible: impactStock } },
      { new: true, runValidators: true }
    );
};

export const findByIds = async (ids, session = null) => {
    return await Material.find({ _id: { $in: ids } }).session(session);
};

export const decrementerStockSiDisponible = async (matiereId, quantite, session = null) => {
    return await Material.findOneAndUpdate(
      { _id: matiereId, quantiteDisponible: { $gte: quantite } },
      [
        {
          $set: {
            quantiteDisponible: {
              $round: [{ $subtract: ['$quantiteDisponible', quantite] }, 6],
            },
          },
        },
      ],
      { new: true, session, updatePipeline: true }
    );
};

export const findMaterialsUnderThreshold = async () => {
    return await Material.find({
      $expr: { $lte: ['$quantiteDisponible', '$seuilAlerte'] },
    });
};