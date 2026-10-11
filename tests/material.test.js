import bcrypt from 'bcryptjs';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Material from '../src/models/Material.js';
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

describe('Material API', () => {
  it('requires authentication to list materials', async () => {
    const response = await request(app).get('/api/materials');

    expect(response.status).toBe(401);
  });

  it('allows an operator to create and list materials', async () => {
    const token = await loginAs('OPERATOR', 'material-operator@factoryflow.com');

    const createResponse = await request(app)
      .post('/api/materials')
      .set('Authorization', `Bearer ${token}`)
      .send({
        reference: ' MAT-001 ',
        name: 'Acier',
        uniteMesure: 'kg',
        quantiteDisponible: 100,
        seuilAlerte: 10,
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data.reference).toBe('mat-001');

    const listResponse = await request(app)
      .get('/api/materials')
      .set('Authorization', `Bearer ${token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.count).toBe(1);
  });

  it('denies a regular user from creating materials', async () => {
    const token = await loginAs('USER', 'material-user@factoryflow.com');

    const response = await request(app)
      .post('/api/materials')
      .set('Authorization', `Bearer ${token}`)
      .send({
        reference: 'MAT-002',
        name: 'Aluminium',
        uniteMesure: 'kg',
      });

    expect(response.status).toBe(403);
  });

  it('rejects duplicate references case-insensitively', async () => {
    const token = await loginAs('ADMIN', 'material-admin@factoryflow.com');
    const material = {
      reference: 'MAT-003',
      name: 'Cuir',
      uniteMesure: 'm2',
    };

    await request(app)
      .post('/api/materials')
      .set('Authorization', `Bearer ${token}`)
      .send(material);

    const response = await request(app)
      .post('/api/materials')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...material, reference: 'mat-003' });

    expect(response.status).toBe(400);
    expect(await Material.countDocuments()).toBe(1);
  });
});
