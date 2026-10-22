import bcrypt from 'bcryptjs';
import request from 'supertest';
import app from '../src/app.js';
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

const productData = {
  reference: ' PROD-001 ',
  nom: 'Chaise industrielle',
  description: 'Chaise pour environnement industriel',
  prix: 149.99,
};

describe('Produit API', () => {
  it('requires authentication to list products', async () => {
    const response = await request(app).get('/api/produits');

    expect(response.status).toBe(401);
  });

  it('allows an admin to create, list, update, and delete a product', async () => {
    const token = await loginAs('ADMIN', 'produit-admin@factoryflow.com');

    const createResponse = await request(app)
      .post('/api/produits')
      .set('Authorization', `Bearer ${token}`)
      .send(productData);

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.success).toBe(true);
    expect(createResponse.body.data).toMatchObject({
      reference: 'prod-001',
      nom: productData.nom,
      prix: productData.prix,
    });

    const productId = createResponse.body.data._id;

    const listResponse = await request(app)
      .get('/api/produits')
      .set('Authorization', `Bearer ${token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.count).toBe(1);
    expect(listResponse.body.data[0].reference).toBe('prod-001');

    const updateResponse = await request(app)
      .put(`/api/produits/${productId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ prix: 169.99 });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data).toMatchObject({
      _id: productId,
      prix: 169.99,
    });

    const deleteResponse = await request(app)
      .delete(`/api/produits/${productId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.message).toBe('Produit supprimé avec succès');
    expect(await Produit.countDocuments()).toBe(0);
  });

  it('denies a regular user from creating a product', async () => {
    const token = await loginAs('USER', 'produit-user@factoryflow.com');

    const response = await request(app)
      .post('/api/produits')
      .set('Authorization', `Bearer ${token}`)
      .send(productData);

    expect(response.status).toBe(403);
    expect(await Produit.countDocuments()).toBe(0);
  });

  it('rejects invalid product data', async () => {
    const token = await loginAs('ADMIN', 'produit-validation@factoryflow.com');

    const response = await request(app)
      .post('/api/produits')
      .set('Authorization', `Bearer ${token}`)
      .send({ reference: 'PROD-002', prix: -10 });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'nom' }),
      expect.objectContaining({ path: 'prix' }),
    ]));
    expect(await Produit.countDocuments()).toBe(0);
  });

  it('rejects duplicate references case-insensitively', async () => {
    const token = await loginAs('ADMIN', 'produit-duplicate@factoryflow.com');

    const firstResponse = await request(app)
      .post('/api/produits')
      .set('Authorization', `Bearer ${token}`)
      .send(productData);

    expect(firstResponse.status).toBe(201);

    const duplicateResponse = await request(app)
      .post('/api/produits')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...productData, reference: 'prod-001' });

    expect(duplicateResponse.status).toBe(400);
    expect(duplicateResponse.body.message).toBe(
      'Un produit avec cette référence existe déjà',
    );
    expect(await Produit.countDocuments()).toBe(1);
  });
});
