import ActionOperateur from '../models/ActionOperateur.js';

export const createAction = async (data, options = {}) => {
  const [action] = await ActionOperateur.create([data], options);
  return action;
};

export const findByOperateur = async (operateurId) => {
  return ActionOperateur.find({ operateur: operateurId })
    .sort({ createdAt: -1 })
    .populate('ordreFabrication');
};
