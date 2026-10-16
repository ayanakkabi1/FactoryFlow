import OrdreFabrication from '../models/OrdreFabrication.js';

const populateOrdre = (query) =>
  query
    .populate('produit')
    .populate('assigneA', '-password')
    .populate('mouvementsStock');


export const createOrdre = async (data) => {
  const ordre = await OrdreFabrication.create(data);
  return populateOrdre(OrdreFabrication.findById(ordre._id));
};

export const findAllOrdres = async (filter = {}) => {
  return populateOrdre(OrdreFabrication.find(filter).sort({ dateCreation: -1 }));
};

export const findOrdreById = async (id) => {
  return populateOrdre(OrdreFabrication.findById(id));
};

export const findOrdreByCode = async (code) => {
  return populateOrdre(OrdreFabrication.findOne({ code }));
};

export const findOrdresByStatut = async (statut) => {
  return populateOrdre(
    OrdreFabrication.find({ statut }).sort({ dateCreation: -1 })
  );
};

export const findOrdresByAssigne = async (userId) => {
  return populateOrdre(
    OrdreFabrication.find({ assigneA: userId }).sort({ dateCreation: -1 })
  );
};

export const updateOrdre = async (id, data) => {
  return populateOrdre(
    OrdreFabrication.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
  );
};

export const updateStatut = async (id, statut, options = {}) => {
  return populateOrdre(
    OrdreFabrication.findOneAndUpdate(
      { _id: id, statut: 'PLANIFIE' },
      { statut, dateFin: new Date() },
      {
      new: true,
      runValidators: true,
      ...options,
      }
    )
  );
};

export const startOrdre = async (id, options = {}) => {
  return populateOrdre(
    OrdreFabrication.findOneAndUpdate(
      { _id: id, statut: 'PLANIFIE' },
      { statut: 'EN_COURS', dateDemarrage: new Date() },
      { new: true, runValidators: true, ...options }
    )
  );
};

export const finishOrdre = async (id, options = {}) => {
  return populateOrdre(
    OrdreFabrication.findOneAndUpdate(
      { _id: id, statut: 'EN_COURS' },
      { statut: 'TERMINE', dateFin: new Date() },
      { new: true, runValidators: true, ...options }
    )
  );
};

export const addMouvementStock = async (ordreId, mouvementId, options = {}) => {
  return populateOrdre(
    OrdreFabrication.findByIdAndUpdate(
      ordreId,
      { $addToSet: { mouvementsStock: mouvementId } },
      { new: true, ...options }
    )
  );
};

export const deleteOrdre = async (id) => {
  return OrdreFabrication.findByIdAndDelete(id);
};

export const findOrders = async (filter, skip, limit) =>
  populateOrdre(
    OrdreFabrication.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
  );

export const countOrders = async (filter) => {
  return await OrdreFabrication.countDocuments(filter);
}
