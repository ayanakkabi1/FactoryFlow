import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';
import CompositionItem from '../src/models/CompositionItem.js';
import CompositionItemSnapshot from '../src/models/CompositionItemSnapshot.js';
import Material from '../src/models/Material.js';
import Produit from '../src/models/Produit.js';
import User from '../src/models/User.js';
import './setup.js';

const loginAs = async (role, email) => {
  const password = 'securepassword123';

  await User.create({
    name: role,
    email,
    password: await bcrypt.hash(password, 10),
    role,
  });

  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  return response.body.token;
};

describe('Composition Item & Snapshot API', () => {
  let adminToken;
  let userToken;
  let testProduct;
  let testMaterial1;
  let testMaterial2;

  beforeEach(async () => {
    adminToken = await loginAs('ADMIN', 'comp-admin@factoryflow.com');
    userToken = await loginAs('USER', 'comp-user@factoryflow.com');

    testProduct = await Produit.create({
      reference: 'table-01',
      nom: 'Table en bois',
      description: 'Table artisanale',
      prix: 250,
    });

    testMaterial1 = await Material.create({
      reference: 'bois-chene',
      name: 'Bois de chêne',
      uniteMesure: 'm3',
      quantiteDisponible: 100,
      seuilAlerte: 10,
    });

    testMaterial2 = await Material.create({
      reference: 'vis-inox',
      name: 'Vis inox',
      uniteMesure: 'kg',
      quantiteDisponible: 50,
      seuilAlerte: 5,
    });
  });

  describe('Authentication & Authorization', () => {
    it('requires authentication to list composition items', async () => {
      const response = await request(app).get('/api/compositions');
      expect(response.status).toBe(401);
    });

    it('denies a regular user from creating composition items', async () => {
      const response = await request(app)
        .post('/api/compositions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          produit: testProduct._id,
          matiere: testMaterial1._id,
          quantiteNecessaire: 2.5,
        });

      expect(response.status).toBe(403);
    });
  });

  describe('CompositionItem CRUD operations', () => {
    it('allows an admin to create a composition item and links it to the product', async () => {
      const response = await request(app)
        .post('/api/compositions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          produit: testProduct._id,
          matiere: testMaterial1._id,
          quantiteNecessaire: 2.5,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        quantiteNecessaire: 2.5,
      });
      expect(response.body.data.matiere._id.toString()).toBe(
        testMaterial1._id.toString()
      );
      expect(response.body.data.produit._id.toString()).toBe(
        testProduct._id.toString()
      );

      const updatedProduct = await Produit.findById(testProduct._id);
      expect(updatedProduct.composition).toHaveLength(1);
      expect(updatedProduct.composition[0].toString()).toBe(
        response.body.data._id
      );
    });

    it('allows adding composition item via nested product route', async () => {
      const response = await request(app)
        .post(`/api/produits/${testProduct._id}/composition`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          matiere: testMaterial2._id,
          quantiteNecessaire: 16,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.quantiteNecessaire).toBe(16);

      const listResponse = await request(app)
        .get(`/api/produits/${testProduct._id}/composition`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(listResponse.status).toBe(200);
      expect(listResponse.body.count).toBe(1);
      expect(listResponse.body.data[0].quantiteNecessaire).toBe(16);
    });

    it('allows listing and fetching composition items by ID', async () => {
      const createRes = await request(app)
        .post('/api/compositions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          produit: testProduct._id,
          matiere: testMaterial1._id,
          quantiteNecessaire: 3,
        });

      const itemId = createRes.body.data._id;

      const listRes = await request(app)
        .get('/api/compositions')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.count).toBe(1);

      const getRes = await request(app)
        .get(`/api/compositions/${itemId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data._id).toBe(itemId);
      expect(getRes.body.data.quantiteNecessaire).toBe(3);
    });

    it('allows an admin to update a composition item', async () => {
      const createRes = await request(app)
        .post('/api/compositions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          produit: testProduct._id,
          matiere: testMaterial1._id,
          quantiteNecessaire: 3,
        });

      const itemId = createRes.body.data._id;

      const updateRes = await request(app)
        .put(`/api/compositions/${itemId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          quantiteNecessaire: 4.5,
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.quantiteNecessaire).toBe(4.5);
    });

    it('allows an admin to delete a composition item and cleans product reference', async () => {
      const createRes = await request(app)
        .post('/api/compositions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          produit: testProduct._id,
          matiere: testMaterial1._id,
          quantiteNecessaire: 3,
        });

      const itemId = createRes.body.data._id;

      const deleteRes = await request(app)
        .delete(`/api/compositions/${itemId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.message).toBe('Élément de composition supprimé avec succès');

      expect(await CompositionItem.countDocuments()).toBe(0);

      const updatedProduct = await Produit.findById(testProduct._id);
      expect(updatedProduct.composition).toHaveLength(0);
    });
  });

  describe('Validation & Edge Cases', () => {
    it('rejects creation with non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post('/api/compositions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          produit: fakeId,
          matiere: testMaterial1._id,
          quantiteNecessaire: 5,
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Produit introuvable');
    });

    it('rejects creation with non-existent material', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post('/api/compositions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          produit: testProduct._id,
          matiere: fakeId,
          quantiteNecessaire: 5,
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Matière première introuvable');
    });

    it('rejects non-positive quantity', async () => {
      const response = await request(app)
        .post('/api/compositions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          produit: testProduct._id,
          matiere: testMaterial1._id,
          quantiteNecessaire: -2,
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'quantiteNecessaire' }),
        ])
      );
    });

    it('rejects duplicate material in the same product composition', async () => {
      await request(app)
        .post('/api/compositions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          produit: testProduct._id,
          matiere: testMaterial1._id,
          quantiteNecessaire: 2,
        });

      const duplicateResponse = await request(app)
        .post('/api/compositions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          produit: testProduct._id,
          matiere: testMaterial1._id,
          quantiteNecessaire: 5,
        });

      expect(duplicateResponse.status).toBe(400);
      expect(duplicateResponse.body.message).toBe(
        'Cette matière première fait déjà partie de la composition du produit'
      );
    });

    it('rejects updating non-existent composition item', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/compositions/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantiteNecessaire: 10 });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Élément de composition introuvable');
    });
  });

  describe('Composition Snapshot & Methods', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/compositions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          produit: testProduct._id,
          matiere: testMaterial1._id,
          quantiteNecessaire: 2,
        });

      await request(app)
        .post('/api/compositions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          produit: testProduct._id,
          matiere: testMaterial2._id,
          quantiteNecessaire: 8,
        });
    });

    it('generates a composition snapshot with unit quantities and total needs calculation', async () => {
      const response = await request(app)
        .get(`/api/compositions/snapshot/${testProduct._id}?quantiteAFabriquer=10`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.quantiteAFabriquer).toBe(10);
      expect(response.body.data.composition).toHaveLength(2);

      const cheneSnap = response.body.data.composition.find(
        (c) => c.nomMatiere === 'Bois de chêne'
      );
      expect(cheneSnap).toBeDefined();
      expect(cheneSnap.uniteMesure).toBe('m3');
      expect(cheneSnap.quantiteUnitaireNecessaire).toBe(2);
      expect(cheneSnap.besoinsTotaux).toBe(20);

      const visSnap = response.body.data.composition.find(
        (c) => c.nomMatiere === 'Vis inox'
      );
      expect(visSnap).toBeDefined();
      expect(visSnap.uniteMesure).toBe('kg');
      expect(visSnap.quantiteUnitaireNecessaire).toBe(8);
      expect(visSnap.besoinsTotaux).toBe(80);
    });

    it('generates a snapshot via nested product endpoint', async () => {
      const response = await request(app)
        .get(`/api/produits/${testProduct._id}/composition/snapshot?quantite=5`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.quantiteAFabriquer).toBe(5);
      expect(response.body.data.composition).toHaveLength(2);
    });

    it('rejects snapshot generation when product has no composition', async () => {
      const emptyProduct = await Produit.create({
        reference: 'table-vide',
        nom: 'Table sans composition',
      });

      const response = await request(app)
        .get(`/api/compositions/snapshot/${emptyProduct._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Le produit n'a aucune composition définie pour générer un snapshot"
      );
    });

    it('CompositionItemSnapshot schema method calculerBesoinsTotaux works correctly', () => {
      const snapshot = new CompositionItemSnapshot({
        nomMatiere: 'Bois de chêne',
        uniteMesure: 'm3',
        quantiteUnitaireNecessaire: 3.5,
      });

      expect(snapshot.calculerBesoinsTotaux(10)).toBe(35);
      expect(() => snapshot.calculerBesoinsTotaux(-1)).toThrow();
    });

    it('CompositionItem schema method getDetailsMatiere populates matiere', async () => {
      const item = await CompositionItem.findOne({ produit: testProduct._id });
      const matiere = await item.getDetailsMatiere();
      expect(matiere).toBeDefined();
      expect(matiere.name).toBeDefined();
    });

    it('deleting a product cascades to remove its composition items', async () => {
      expect(await CompositionItem.countDocuments({ produit: testProduct._id })).toBe(2);

      await request(app)
        .delete(`/api/produits/${testProduct._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(await CompositionItem.countDocuments({ produit: testProduct._id })).toBe(0);
    });
  });
});

