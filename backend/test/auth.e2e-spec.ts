import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from './../src/app.module';
import { UsersService } from './../src/auth/users.service';
import { Noticia } from './../src/entities/noticia.entity';
import { configureApp } from './../src/app.setup';

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
const runId = Date.now().toString(36);
let accountSeq = 0;
function freshEmail(prefix: string): string {
  accountSeq += 1;
  return `${prefix}-${runId}-${accountSeq}@prospectiva.test`;
}

describe('Autenticación (e2e)', () => {
  let app: INestApplication<App>;
  let users: UsersService;
  let noticiasRepo: Repository<Noticia>;

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
    configureApp(app);
    await app.init();
    users = app.get(UsersService);
    noticiasRepo = app.get<Repository<Noticia>>(getRepositoryToken(Noticia));
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

      // La suite crea sus propias noticias: no puede depender de la semilla
      // (los e2e corren con SEED_CONTENIDO=false).
      const fecha = '2026-01-01';
      const publicada = await request(app.getHttpServer())
        .post('/api/noticias')
        .set('authorization', `Bearer ${token}`)
        .send({
          slug: `publicada-${runId}`,
          titulo: 'Noticia pública de e2e',
          fecha,
          categoria: 'Noticias y Comunicados',
          resumen: 'Debe verse en la ruta pública.',
          contenido: ['Párrafo de prueba.'],
          publicado: true,
        })
        .expect(201);
      const borrador = await request(app.getHttpServer())
        .post('/api/noticias')
        .set('authorization', `Bearer ${token}`)
        .send({
          slug: `borrador-${runId}`,
          titulo: 'Borrador de e2e',
          fecha,
          categoria: 'Noticias y Comunicados',
          resumen: 'No debe verse en la ruta pública.',
          contenido: ['Párrafo de prueba.'],
          publicado: false,
        })
        .expect(201);

      try {
        const res = await request(app.getHttpServer())
          .get('/api/noticias?perPage=100')
          .set('authorization', `Bearer ${token}`)
          .expect(200);

        const datos = res.body.data as Array<{ slug?: string; publicado?: boolean }>;
        expect(datos.some((n) => n.slug === publicada.body.slug)).toBe(true);
        expect(datos.some((n) => n.slug === borrador.body.slug)).toBe(false);
        for (const n of datos) {
          expect(n.publicado).toBe(true);
        }
      } finally {
        // Borrado en firme: si no, el slug (UNIQUE) queda tomado y la suite no
        // puede repetirse.
        await noticiasRepo.delete({ id: publicada.body.id });
        await noticiasRepo.delete({ id: borrador.body.id });
      }
    });
  });
});