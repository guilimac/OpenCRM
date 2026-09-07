import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';

describe('Auth & Protected Endpoints (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  it('should register, login, and access protected endpoints', async () => {
    const uniqueEmail = `test_${Date.now()}@example.com`;
    // 1. Register
    const regRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: uniqueEmail,
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        organizationName: 'Test Org',
      });
    
    expect(regRes.status).toBe(201);

    // 2. Login
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: uniqueEmail,
        password: 'Password123!',
      });

    expect(loginRes.status).toBe(200);
    const accessToken = loginRes.body.tokens.accessToken;
    expect(accessToken).toBeDefined();

    // 3. Call /api/v1/auth/me
    const meRes = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);
    
    expect(meRes.status).toBe(200);

    // 4. Call /api/v1/interactions
    const interactionsRes = await request(app.getHttpServer())
      .get('/api/v1/interactions')
      .set('Authorization', `Bearer ${accessToken}`);
    
    expect(interactionsRes.status).toBe(200);

    // 5. Call /api/v1/customers
    const customersRes = await request(app.getHttpServer())
      .get('/api/v1/customers')
      .set('Authorization', `Bearer ${accessToken}`);
    
    expect(customersRes.status).toBe(200);

    // 6. Call /api/v1/opportunities
    const oppsRes = await request(app.getHttpServer())
      .get('/api/v1/opportunities')
      .set('Authorization', `Bearer ${accessToken}`);
    
    expect(oppsRes.status).toBe(200);

    // 7. Call /api/v1/products
    const productsRes = await request(app.getHttpServer())
      .get('/api/v1/products')
      .set('Authorization', `Bearer ${accessToken}`);
    
    expect(productsRes.status).toBe(200);

    // 8. Call /api/v1/budgets
    const budgetsRes = await request(app.getHttpServer())
      .get('/api/v1/budgets')
      .set('Authorization', `Bearer ${accessToken}`);
    
    expect(budgetsRes.status).toBe(200);
  });

  afterEach(async () => {
    await app.close();
  });
});

