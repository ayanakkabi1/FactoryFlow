import bcrypt from 'bcryptjs';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import './setup.js';

describe('Protected routes', () => {
  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/installation/installed-by');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('returns 401 for an invalid token', async () => {
    const res = await request(app)
      .get('/api/installation/installed-by')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.status).toBe(401);
  });

  it('returns 403 when an operator accesses an admin route', async () => {
    const password = 'securepassword123';
    await User.create({
      name: 'Operator',
      email: 'operator@factoryflow.com',
      password: await bcrypt.hash(password, 10),
      role: 'OPERATOR',
    });

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'operator@factoryflow.com', password });

    const res = await request(app)
      .get('/api/installation/installed-by')
      .set('Authorization', `Bearer ${login.body.token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('allows an admin to access the protected route', async () => {
    const password = 'securepassword123';
    await User.create({
      name: 'Admin',
      email: 'admin-protected@factoryflow.com',
      password: await bcrypt.hash(password, 10),
      role: 'ADMIN',
    });

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin-protected@factoryflow.com', password });

    const res = await request(app)
      .get('/api/installation/installed-by')
      .set('Authorization', `Bearer ${login.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
