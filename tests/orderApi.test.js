import bcrypt from 'bcryptjs';
import request from 'supertest';
import app from '../src/app.js';
import CompositionItem from '../src/models/CompositionItem.js';
import Material from '../src/models/Material.js';
import Produit from '../src/models/Produit.js';
import User from '../src/models/User.js';
import { createOrdreService } from '../src/services/orderService.js';
import './setup.js';

const loginAs = async (email) => {
  const password = 'securepassword123';
  await User.create({
    name: 'Order admin',
    email,
    password: await bcrypt.hash(password, 10),
    role: 'ADMIN',
  });

  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  return response.body.token;
};

describe('Order API', () => {
  it('requires authentication to list orders', async () => {
    const response = await request(app).get('/api/ordres');

    expect(response.status).toBe(401);
  });

  it('lists orders for an authenticated user', async () => {
    const token = await loginAs('order-list-admin@factoryflow.com');
    const assignee = await User.create({
      name: 'Assigned operator',
      email: 'order-assignee@factoryflow.com',
      password: 'securepassword123',
      role: 'OPERATOR',
    });
    const material = await Material.create({
      reference: 'order-list-mat-001',
      name: 'Steel',
      uniteMesure: 'kg',
      quantiteDisponible: 100,
      seuilAlerte: 10,
    });
    const product = await Produit.create({
      reference: 'order-list-prod-001',
      nom: 'Machine part',
      description: 'Part for order list test',
      prix: 125,
    });
    await CompositionItem.create({
      produit: product._id,
      matiere: material._id,
      quantiteNecessaire: 2,
    });
    await createOrdreService({
      code: 'OF-LIST-001',
      produit: product._id,
      quantiteAFabriquer: 5,
      assigneA: assignee._id,
    });

    const response = await request(app)
      .get('/api/ordres')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.count).toBe(1);
    expect(response.body.data[0]).toMatchObject({
      code: 'OF-LIST-001',
      quantiteAFabriquer: 5,
      statut: 'PLANIFIE',
    });
  });
});
