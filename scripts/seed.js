import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Installation from '../src/models/Installation.js';
import User from '../src/models/User.js';
import Material from '../src/models/Material.js';
import Produit from '../src/models/Produit.js';
import CompositionItem from '../src/models/CompositionItem.js';
import OrdreFabrication from '../src/models/OrdreFabrication.js';

const DEMO_ADMIN_EMAIL = 'admin@factoryflow.test';
const DEMO_OPERATOR_EMAIL = 'operator@factoryflow.test';

const validateEnvironment = () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Le seed de démonstration est désactivé en production.');
  }
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI est obligatoire.');
  if (!process.env.SEED_ADMIN_PASSWORD || !process.env.SEED_OPERATOR_PASSWORD) {
    throw new Error(
      'Définissez SEED_ADMIN_PASSWORD et SEED_OPERATOR_PASSWORD dans .env.'
    );
  }
};

const findOrCreateUser = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== role) {
      throw new Error(`Le compte ${email} existe avec un rôle différent de ${role}.`);
    }
    return existing;
  }

  return User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role,
  });
};

const seed = async () => {
  validateEnvironment();
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: Number(
      process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 5000
    ),
  });

  const admin = await findOrCreateUser({
    name: 'Admin Démo',
    email: DEMO_ADMIN_EMAIL,
    password: process.env.SEED_ADMIN_PASSWORD,
    role: 'ADMIN',
  });
  const operator = await findOrCreateUser({
    name: 'Opérateur Démo',
    email: DEMO_OPERATOR_EMAIL,
    password: process.env.SEED_OPERATOR_PASSWORD,
    role: 'OPERATOR',
  });

  if (!(await Installation.exists({}))) {
    await Installation.create({
      isInstalled: true,
      installedAt: new Date(),
      installedBy: admin._id,
      adminInitialEmail: admin.email,
    });
  }

  const materials = [];
  for (const data of [
    {
      reference: 'demo-mat-acier',
      name: 'Acier démo',
      uniteMesure: 'kg',
      quantiteDisponible: 100,
      seuilAlerte: 10,
    },
    {
      reference: 'demo-mat-peinture',
      name: 'Peinture démo',
      uniteMesure: 'L',
      quantiteDisponible: 50,
      seuilAlerte: 5,
    },
  ]) {
    let material = await Material.findOne({ reference: data.reference });
    if (!material) material = await Material.create(data);
    materials.push(material);
  }

  let product = await Produit.findOne({ reference: 'demo-prod-etagere' });
  if (!product) {
    product = await Produit.create({
      reference: 'demo-prod-etagere',
      nom: 'Étagère démo',
      description: 'Produit créé par le seed FactoryFlow.',
      quantiteDisponible: 0,
    });
  }

  for (const [material, quantity] of materials.map((item, index) => [item, index === 0 ? 2 : 1])) {
    let composition = await CompositionItem.findOne({
      produit: product._id,
      matiere: material._id,
    });
    if (!composition) {
      composition = await CompositionItem.create({
        produit: product._id,
        matiere: material._id,
        quantiteNecessaire: quantity,
      });
    }
    await Produit.updateOne(
      { _id: product._id },
      { $addToSet: { composition: composition._id } }
    );
  }

  if (!(await OrdreFabrication.exists({ code: 'DEMO-OF-001' }))) {
    const items = await CompositionItem.find({ produit: product._id }).populate('matiere');
    await OrdreFabrication.create({
      code: 'DEMO-OF-001',
      produit: product._id,
      quantiteAFabriquer: 10,
      assigneA: operator._id,
      composition: items.map((item) => ({
        matiere: item.matiere._id,
        nomMatiere: item.matiere.name,
        uniteMesure: item.matiere.uniteMesure,
        quantiteUnitaireNecessaire: item.quantiteNecessaire,
      })),
    });
  }

  console.info('Seed terminé : admin, opérateur, matières, produit et DEMO-OF-001.');
  console.info(`Admin : ${DEMO_ADMIN_EMAIL} ; opérateur : ${DEMO_OPERATOR_EMAIL}`);
};

seed()
  .catch((error) => {
    console.error('Échec du seed :', error.message);
    process.exitCode = 1;
  })
  .finally(async () => mongoose.disconnect());
