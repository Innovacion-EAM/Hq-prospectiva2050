import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { UsersService } from './../src/auth/users.service';
import { configureApp } from './../src/app.setup';

/**
 * Contraseña de las cuentas que crea este fichero.
 *
 * Cada test crea su propia cuenta con esta clave conocida (ver el comentario
 * equivalente en `auth.e2e-spec.ts`).
 */
const TEST_PASSWORD = 'Prueba-Solo-CI-2026';

/**
 * Contador para dar un correo distinto a cada cuenta.
 *
 * El límite del login se cuenta por (correo, IP), y en un test todas las
 * peticiones salen de 127.0.0.1: si dos tests usaran el mismo correo, el
 * segundo se encontraría con un 429 del primero.
 */
const runId = Date.now().toString(36);
let accountSeq = 0;
function freshEmail(prefix: string): string {
  accountSeq += 1;
  return `${prefix}-${runId}-${accountSeq}@prospectiva.test`;
}

/**
 * Suite dedicada a los límites del login.
 *
 * Vive en un fichero aparte —y se ejecuta con el throttling ACTIVO— porque
 * comprueba que los 429 llegan cuando toca. El resto de la suite e2e (en
 * particular `api.e2e-spec.ts`) necesita ejercitar los mismos endpoints
 * decenas de veces, así que corre con `THROTTLE_ENABLED=false`; aquí, en
 * cambio, los límites de verdad (5 por 15 min y por cuenta, en el decorador de
 * `auth.controller.ts`) tienen que estar funcionando.
 */
describe('Límites del login (e2e)', () => {
  let app: INestApplication<App>;
  let users: UsersService;

  /** Crea una cuenta y devuelve su correo. */
  async function makeUser(role: 'admin' | 'editor' = 'admin'): Promise<string> {
    const email = freshEmail(role);
    await users.create({ email, password: TEST_PASSWORD, role });
    return email;
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    users = app.get(UsersService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('bloquea el sexto intento y devuelve 429', async () => {
    const email = await makeUser();

    // Cinco intentos wrong: el límite es 5, así que los cinco pasan y el
    // sexto tiene que ser el 429.
    for (let i = 0; i < 5; i += 1) {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password: 'no-es-la-correcta' })
        .expect(401);
    }

    const blocked = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: TEST_PASSWORD })
      .expect(429);

    // Aunque la contraseña sea correcta, el 429 corta antes de llegar al
    // servicio de autenticación.
    expect(blocked.body.message).toBeDefined();
  });

  it('el contador es por cuenta, no global', async () => {
    // Agota el cupo de una cuenta y comprueba que otra distinta entra bien.
    const agotada = await makeUser();
    for (let i = 0; i < 5; i += 1) {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: agotada, password: 'mala' })
        .expect(401);
    }
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: agotada, password: TEST_PASSWORD })
      .expect(429);

    // Esta segunda cuenta no se ha tocado: debe poder entrar con normalidad.
    const otra = await makeUser();
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: otra, password: TEST_PASSWORD })
      .expect(201);
  });
});