import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { UsersService } from './../src/auth/users.service';

/**
 * Contraseña de las cuentas que crea este fichero.
 *
 * Antes los tests entraban con la contraseña de la semilla. Ya no pueden: la
 * semilla genera una aleatoria y la imprime una vez en el log precisamente
 * para que no esté en el repositorio. Si un test leyera esa clave, el
 * repositorio volvería a tener la contraseña de producción escrita dentro.
 *
 * Por eso cada test crea su propia cuenta con esta contraseña conocida. Es
 * además lo que aísla los tests entre sí.
 */
const TEST_PASSWORD = 'Prueba-Solo-CI-2026';

/**
 * Contador para dar un correo distinto a cada cuenta.
 *
 * No es un detalle: el límite del login se cuenta por (correo, IP), y en un
 * test todas las peticiones salen de 127.0.0.1. Si dos tests usaran el mismo
 * correo, el segundo se encontraría con un 429 del primero y el fallo
 * aparecería en el test equivocado. Con correos distintos, cada uno tiene su
 * contador y los tests son independientes.
 */
let accountSeq = 0;
function freshEmail(prefix: string): string {
  accountSeq += 1;
  return `${prefix}-${accountSeq}@prospectiva.test`;
}

describe('Autenticación (e2e)', () => {
  let app: INestApplication<App>;
  let users: UsersService;

  /** Crea una cuenta y devuelve su correo. */
  async function makeUser(role: 'admin' | 'editor' = 'admin'): Promise<string> {
    const email = freshEmail(role);
    await users.create({ email, password: TEST_PASSWORD, role });
    return email;
  }

  async function tokenFor(email: string): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: TEST_PASSWORD })
      .expect(201);
    return res.body.accessToken as string;
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api', { exclude: ['health', 'health/(.*)'] });
    await app.init();
    users = app.get(UsersService);
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

  it('el login devuelve un accessToken', async () => {
    const email = await makeUser();
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: TEST_PASSWORD })
      .expect(201);
    expect(typeof res.body.accessToken).toBe('string');
    expect(res.body.accessToken.length).toBeGreaterThan(20);
    expect(res.body.user.role).toBe('admin');
  });

  it('rechaza credenciales inválidas', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: freshEmail('inexistente'), password: 'incorrecta' })
      .expect(401);
  });

  it('exige token en los endpoints protegidos (media)', async () => {
    await request(app.getHttpServer()).get('/api/media').expect(401);

    const token = await tokenFor(await makeUser());
    return request(app.getHttpServer())
      .get('/api/media')
      .set('authorization', `Bearer ${token}`)
      .expect(200);
  });

  describe('límite de intentos del login', () => {
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

  describe('cambio de contraseña', () => {
    it('cambia la contraseña y permite entrar con la nueva', async () => {
      const email = await makeUser();
      const token = await tokenFor(email);
      const nueva = 'Otra-Clave-Larga-2026';

      await request(app.getHttpServer())
        .post('/api/auth/password')
        .set('authorization', `Bearer ${token}`)
        .send({ currentPassword: TEST_PASSWORD, newPassword: nueva })
        .expect(201);

      // La nueva vale…
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password: nueva })
        .expect(201);

      // …y la vieja ya no.
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password: TEST_PASSWORD })
        .expect(401);
    });

    it('exige la contraseña actual', async () => {
      const email = await makeUser();
      const token = await tokenFor(email);

      const res = await request(app.getHttpServer())
        .post('/api/auth/password')
        .set('authorization', `Bearer ${token}`)
        .send({ currentPassword: 'equivocada', newPassword: 'Nueva-Clave-Larga-2026' })
        .expect(401);
      expect(res.body.message).toContain('actual');
    });

    it('no acepta contraseñas demasiado cortas', async () => {
      const email = await makeUser();
      const token = await tokenFor(email);

      await request(app.getHttpServer())
        .post('/api/auth/password')
        .set('authorization', `Bearer ${token}`)
        .send({ currentPassword: TEST_PASSWORD, newPassword: 'corta' })
        .expect(400);
    });

    it('exige token: sin sesión no se cambia nada', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/password')
        .send({ currentPassword: TEST_PASSWORD, newPassword: 'Nueva-Clave-Larga-2026' })
        .expect(401);
    });
  });

  describe('noticias: público y panel son superficies distintas', () => {
    it('la ruta pública no exige token', () => {
      return request(app.getHttpServer())
        .get('/api/noticias?perPage=1')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('el listado del panel exige token', async () => {
      await request(app.getHttpServer()).get('/api/noticias/panel').expect(401);
    });

    it('con token, el panel sí lista (incluye borradores)', async () => {
      const token = await tokenFor(await makeUser('editor'));
      await request(app.getHttpServer())
        .get('/api/noticias/panel?perPage=1')
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('un token de editor no filtra borradores por la ruta pública', async () => {
      // Este es el bug que se arregla: antes la ruta pública era @Public() y
      // miraba el token a mano, así que un editor veía los borradores sin
      // pasar por el guard. Ahora la ruta pública ni mira el token.
      const token = await tokenFor(await makeUser('editor'));

      const res = await request(app.getHttpServer())
        .get('/api/noticias?perPage=100')
        .set('authorization', `Bearer ${token}`)
        .expect(200);

      const data = res.body.data as { publicado?: boolean }[];
      expect(data.length).toBeGreaterThan(0);
      for (const n of data) {
        expect(n.publicado).toBe(true);
      }
    });
  });
});