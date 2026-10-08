import bcrypt from 'bcryptjs';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import './setup.js';

describe('Authentication API', () => {
  it('logs in an active user and returns a JWT', async () => {
    const password = 'securepassword123';
    await User.create({
      name: 'Auth Admin',
      email: 'AUTH@factoryflow.com',
      password: await bcrypt.hash(password, 10),
      role: 'ADMIN',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'auth@factoryflow.com', password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({
      email: 'auth@factoryflow.com',
      role: 'ADMIN',
    });
    expect(res.body.user.password).toBeUndefined();
  });

  it('rejects invalid credentials without revealing which value is wrong', async () => {
    const password = 'securepassword123';
    await User.create({
      name: 'Auth User',
      email: 'auth-user@factoryflow.com',
      password: await bcrypt.hash(password, 10),
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'auth-user@factoryflow.com',
        password: 'wrong-password',
      });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      success: false,
      message: 'Email ou mot de passe incorrect.',
    });
  });

  it('rejects inactive users', async () => {
    await User.create({
      name: 'Inactive User',
      email: 'inactive@factoryflow.com',
      password: await bcrypt.hash('securepassword123', 10),
      isActive: false,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'inactive@factoryflow.com',
        password: 'securepassword123',
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Email ou mot de passe incorrect.');
  });

  it('rejects invalid login input', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'email' }),
      expect.objectContaining({ path: 'password' }),
    ]));
  });

  it('logs in the admin created by the installation flow', async () => {
    const password = 'securepassword123';
    await request(app)
      .post('/api/installation')
      .send({
        name: 'Installed Admin',
        email: 'installed-admin@factoryflow.com',
        password,
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: ' INSTALLED-ADMIN@factoryflow.com ',
        password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('installed-admin@factoryflow.com');
  });
});
