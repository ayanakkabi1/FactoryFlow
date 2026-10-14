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

export const updateStatut = async (id, statut) => {
  const updateFields = { statut };

  if (statut === 'EN_COURS') {
    updateFields.dateDemarrage = new Date();
  }

  if (statut === 'TERMINE' || statut === 'ANNULE') {
    updateFields.dateFin = new Date();
  }

  return populateOrdre(
    OrdreFabrication.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    })
  );
};

export const addMouvementStock = async (ordreId, mouvementId) => {
  return populateOrdre(
    OrdreFabrication.findByIdAndUpdate(
      ordreId,
      { $addToSet: { mouvementsStock: mouvementId } },
      { new: true }
    )
  );
};

export const deleteOrdre = async (id) => {
  return OrdreFabrication.findByIdAndDelete(id);
};

