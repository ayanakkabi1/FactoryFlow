import Installation from "../models/Installation.js";

export const findAll = async () => {
  return await Installation.find();
}

export const findById = async (id) => {
    return await Installation.findById(id);
}

export const installedBy = async () => {
    return await Installation.find({isInstalled: true}).populate('installedBy');
}

export const findStatus = async (session) => {
  const status = await Installation.findOne(
    {},
    "isInstalled installedAt installedBy",
  )
    .populate('installedBy', 'name email role isActive')
    .session(session);
  return status || { isInstalled: false };
};

export const createInstallation = async (installation, session) => {
    const [createdInstallation] = await Installation.create([installation], { session });
    return createdInstallation;
};

export const setInstalled = async (id, installation) => {
    return await Installation.findByIdAndUpdate(id, installation, { new: true });
}
