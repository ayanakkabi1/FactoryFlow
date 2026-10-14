import MouvementStock from "../models/MouvementStock.js";

export const createMouvement = async(data)=>{
    return await MouvementStock.create(data);
}

export const createMouvements = async (data, session = null) => {
    return await MouvementStock.insertMany(data, { session });
}

export const updateMouvement = async(id,data)=> {
     return await MouvementStock.findByIdAndUpdate(id, data, { new:true, runValidators: true})
}

export const findAll = async() => {
    return await MouvementStock.find();
}

export const findById = async(id) => {
    return await MouvementStock.findById(id);
}

export const findByType = async(type) => {
    return await MouvementStock.find({type:type.trim().toLowerCase()})
}