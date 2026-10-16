import bcrypt from 'bcryptjs';
import request from 'supertest';
import app from '../src/app.js';
import Material from '../src/models/Material.js';
import User from '../src/models/User.js';
import MouvementStock from '../src/models/MouvementStock.js';
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

describe('Stock movement API', () => {
  it('requires authentication', async () => {
    const response = await request(app)
      .post('/api/stock/mouvements')
      .send({
        type: 'ENTREE',
        matiereId: '507f1f77bcf86cd799439011',
        quantite: 10,
      });

    expect(response.status).toBe(401);
  });

  it('rejects invalid movement data', async () => {
    const token = await loginAs(
      'OPERATOR',
      'stock-validation@factoryflow.com',
    );

    const response = await request(app)
      .post('/api/stock/mouvements')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'INVALID',
        matiereId: 'not-an-object-id',
        quantite: 0,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toHaveLength(3);
  });

  it('allows an operator to record an entry and update stock', async () => {
    const token = await loginAs('OPERATOR', 'stock-operator@factoryflow.com');
    const material = await Material.create({
      reference: 'MAT-STOCK-001',
      name: 'Acier',
      uniteMesure: 'kg',
      quantiteDisponible: 10,
      seuilAlerte: 2,
    });

    const response = await request(app)
      .post('/api/stock/mouvements')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'ENTREE',
        matiereId: material._id.toString(),
        quantite: 5,
        motif: 'Réapprovisionnement',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.nouvelleQuantiteDisponible).toBe(15);
    expect(await MouvementStock.countDocuments()).toBe(1);
    expect(await Material.findById(material._id).then((item) => item.quantiteDisponible)).toBe(15);
  });

  it('rejects a stock exit larger than available stock', async () => {
    const token = await loginAs('OPERATOR', 'stock-exit@factoryflow.com');
    const material = await Material.create({
      reference: 'MAT-STOCK-002',
      name: 'Cuivre',
      uniteMesure: 'kg',
      quantiteDisponible: 3,
      seuilAlerte: 1,
    });

    const response = await request(app)
      .post('/api/stock/mouvements')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'SORTIE',
        matiereId: material._id.toString(),
        quantite: 4,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Stock insuffisant');
    expect(await MouvementStock.countDocuments()).toBe(0);
  });

  it('denies a regular user from recording a movement', async () => {
    const token = await loginAs('USER', 'stock-user@factoryflow.com');

    const response = await request(app)
      .post('/api/stock/mouvements')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'ENTREE',
        matiereId: '507f1f77bcf86cd799439011',
        quantite: 10,
      });

    expect(response.status).toBe(403);
  });
});
