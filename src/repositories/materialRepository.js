import Material from "../models/Material";

export const findall = async() => {
    return await Material.find();
}

export const findById = async(id) => {
    return await Material.findById(id);
}

export const findByref = async(reference) => {
    return await Material.findOne({reference : reference.toLowerCase()});
}

export const createMaterial = async(data) => {
    return await Material.create(data)
}

export const updateMaterial = async(id, data) => {
    return await Material.findByIdAndUpdate(id, data, { new: true, runValidators: true })
}