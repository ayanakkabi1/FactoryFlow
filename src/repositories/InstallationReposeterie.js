import Installation from "../models/Installation";

export const findAll = async () => {
  return await Installation.find();
}

export const findById = async (id) => {
    return await Installation.findById(id);
}

export const installedBy = async () => {
    return await Installation.find({isInstalled: true}).populate('installedBy');
}

export const findStatus = async () => {
  const status = await Installation.findOne({}, "isInstalled installedAt");
  return status || { isInstalled: false };
};

export const createInstallation = async (installation) => {
    return await Installation.create(installation);
}

export const setInstalled = async (id, installation) => {
    return await Installation.findByIdAndUpdate(id, installation, { new: true });
}



