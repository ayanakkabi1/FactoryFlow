import MouvementStock from "../models/MouvementStock.js";

export const createMouvement = async(data, options = {})=>{
    const [mouvement] = await MouvementStock.create([data], options);
    return mouvement;
}

export const updateMouvement = async(id,data)=> {
     return await MouvementStock.findByIdAndUpdate(id, data, { new:true, runValidators: true})
}

export const findAll = async() => {
    return await MouvementStock.find()
      .populate('matiere')
      .populate('produit')
      .populate('utilisateur', '-password')
      .populate('ordreFabrication')
      .sort({ dateMouvement: -1 });
}

export const findById = async(id) => {
    return await MouvementStock.findById(id);
}

export const findByType = async(type) => {
    return await MouvementStock.find({type:type.trim().toLowerCase()})
}
