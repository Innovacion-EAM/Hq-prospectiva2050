import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Autenticación (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api', { exclude: ['health', 'health/(.*)'] });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('además del /api, el sitio agrega /api/site de forma pública', () => {
    return request(app.getHttpServer())
      .get('/api/site')
      .expect(200)
      .expect((res) => {
        expect(res.body.site).toBeDefined();
        expect(Array.isArray(res.body.dimensiones)).toBe(true);
      });
  });

  it('el login del administrador sembrado devuelve un accessToken', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@prospectiva.com', password: 'Admin123*' })
      .expect(201);
    expect(typeof res.body.accessToken).toBe('string');
    expect(res.body.accessToken.length).toBeGreaterThan(20);
    expect(res.body.user.role).toBe('admin');
  });

  it('rechaza credenciales inválidas', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'nadie@prospectiva.com', password: 'incorrecta' })
      .expect(401);
  });

  it('exige token en los endpoints protegidos (media)', async () => {
    await request(app.getHttpServer()).get('/api/media').expect(401);

    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@prospectiva.com', password: 'Admin123*' })
      .expect(201);

    return request(app.getHttpServer())
      .get('/api/media')
      .set('authorization', `Bearer ${login.body.accessToken}`)
      .expect(200);
  });

  it('resuelve noticias públicas sin tokens (programadas incluidas solo para admin)', async () => {
    const pub = await request(app.getHttpServer())
      .get('/api/noticias?perPage=1')
      .expect(200);
    expect(Array.isArray(pub.body.data)).toBe(true);

    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@prospectiva.com', password: 'Admin123*' })
      .expect(201);

    const priv = await request(app.getHttpServer())
      .get('/api/noticias?includeAll=true&perPage=1')
      .set('authorization', `Bearer ${login.body.accessToken}`)
      .expect(200);
    expect(Array.isArray(priv.body.data)).toBe(true);
  });
});