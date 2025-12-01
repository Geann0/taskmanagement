import request from 'supertest';
import express, { Express } from 'express';
import authRoutes from '../routes/auth';

describe('Auth API', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/auth', authRoutes);
  });

  it('should generate OAuth URL', async () => {
    const response = await request(app).get('/auth/google/url');

    expect(response.status).toBe(200);
    expect(response.body.url).toBeDefined();
    expect(typeof response.body.url).toBe('string');
  });

  it('should return 401 for invalid token verification', async () => {
    const response = await request(app)
      .get('/auth/verify')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
  });
});
