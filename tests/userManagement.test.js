import bcrypt from 'bcryptjs';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import './setup.js';

const createUserAndLogin = async ({
  email,
  role,
  password = 'securepassword123',
}) => {
  await User.create({
    name: role === 'ADMIN' ? 'Admin' : 'Operator',
    email,
    password: await bcrypt.hash(password, 10),
    role,
  });

  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  return response.body.token;
};

describe('User management API', () => {
  it('allows an admin to create another admin', async () => {
    const token = await createUserAndLogin({
      email: 'manager-admin@factoryflow.com',
      role: 'ADMIN',
    });

    const response = await request(app)
      .post('/api/users/admins')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Second Admin',
        email: 'second-admin@factoryflow.com',
        password: 'admin-password',
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      name: 'Second Admin',
      email: 'second-admin@factoryflow.com',
      role: 'ADMIN',
    });
    expect(response.body.data.password).toBeUndefined();

    const admin = await User.findOne({
      email: 'second-admin@factoryflow.com',
    }).select('+password');
    expect(admin.role).toBe('ADMIN');
    expect(await bcrypt.compare('admin-password', admin.password)).toBe(true);
  });

  it('allows an admin to create an operator with a hashed password', async () => {
    const token = await createUserAndLogin({
      email: 'manager@factoryflow.com',
      role: 'ADMIN',
    });

    const response = await request(app)
      .post('/api/users/operators')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Production Operator',
        email: 'operator-created@factoryflow.com',
        password: 'operator-password',
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      name: 'Production Operator',
      email: 'operator-created@factoryflow.com',
      role: 'OPERATOR',
    });
    expect(response.body.data.password).toBeUndefined();

    const operator = await User.findOne({
      email: 'operator-created@factoryflow.com',
    }).select('+password');
    expect(operator.role).toBe('OPERATOR');
    expect(operator.password).not.toBe('operator-password');
    expect(await bcrypt.compare('operator-password', operator.password)).toBe(true);
  });

  it('allows an operator to consult their own profile', async () => {
    const token = await createUserAndLogin({
      email: 'operator-profile@factoryflow.com',
      role: 'OPERATOR',
    });

    const response = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      email: 'operator-profile@factoryflow.com',
      role: 'OPERATOR',
    });
    expect(response.body.data.password).toBeUndefined();
  });

  it('allows an admin to list operators but denies that route to operators', async () => {
    const adminToken = await createUserAndLogin({
      email: 'manager-list@factoryflow.com',
      role: 'ADMIN',
    });
    const operatorToken = await createUserAndLogin({
      email: 'operator-list@factoryflow.com',
      role: 'OPERATOR',
    });

    const adminResponse = await request(app)
      .get('/api/users/operators')
      .set('Authorization', `Bearer ${adminToken}`);
    const operatorResponse = await request(app)
      .get('/api/users/operators')
      .set('Authorization', `Bearer ${operatorToken}`);

    expect(adminResponse.status).toBe(200);
    expect(adminResponse.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({
        email: 'operator-list@factoryflow.com',
        role: 'OPERATOR',
      }),
    ]));
    expect(adminResponse.body.data[0].password).toBeUndefined();
    expect(operatorResponse.status).toBe(403);
  });
});
