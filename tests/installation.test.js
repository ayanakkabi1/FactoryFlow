import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Installation from '../src/models/Installation.js';
import './setup.js'; 


describe('Installation API', () => {
  
  it('should return isInstalled: false when system is not installed', async () => {
    const res = await request(app).get('/api/installation/status');
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isInstalled).toBe(false);
  });

  it('should successfully install the application and create an admin user', async () => {
    const adminData = {
      name: 'Aya Admin',
      email: 'aya@factoryflow.com',
      password: 'securepassword123',
    };

    const res = await request(app)
      .post('/api/installation')
      .send(adminData);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.admin.email).toBe(adminData.email);
    expect(res.body.admin.role).toBe('ADMIN');

    const userInDb = await User.findOne({ email: adminData.email });
    expect(userInDb).not.toBeNull();
    expect(userInDb.role).toBe('ADMIN');

    const installationInDb = await Installation.findOne({ isInstalled: true });
    expect(installationInDb).not.toBeNull();
  });

  it('should refuse a second installation attempt', async () => {

    await request(app).post('/api/installation').send({
      name: 'Admin 1',
      email: 'admin1@test.com',
      password: 'password123',
    });

    const res = await request(app).post('/api/installation').send({
      name: 'Admin 2',
      email: 'admin2@test.com',
      password: 'password123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("L'application est déjà installée.");
  });

});