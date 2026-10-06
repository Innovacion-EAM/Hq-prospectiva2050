import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Imprescindible: createNestApplication() NO ejecuta main.ts, así que sin
    // esta línea AppController (@Controller() + @Get()) sirve en "/" y no en
    // "/api", que es lo que prueba este test. Debe coincidir con main.ts.
    app.setGlobalPrefix('api', { exclude: ['health', 'health/(.*)'] });
    await app.init();
  });

  it('/api (GET)', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
        expect(res.body.api).toBe('up');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
