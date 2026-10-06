import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { UsersService } from './../src/auth/users.service';
import { RepositorioService } from './../src/data/repositorio.service';

/**
 * Cuentas propias por test, igual que en auth.e2e-spec.ts: la semilla genera
 * contraseñas aleatorias, así que ningún test puede (ni debe) usarlas.
 */
const TEST_PASSWORD = 'Prueba-Solo-CI-2026';

let accountSeq = 0;
function freshEmail(prefix: string): string {
  accountSeq += 1;
  return `${prefix}-${accountSeq}@prospectiva.test`;
}

/**
 * CSV con los encabezados EXACTOS del Excel original (exportado por
 * LibreOffice), que incluye la columna "Dimensión" SIN encabezado. Cada test
 * usa un rango de `codigo` propio para no pisarse: los tests comparten la
 * misma base de datos y corren en serie.
 */
function csvExcel(codigos: string[]): string {
  const filas = codigos
    .map((c, i) => {
      const dimensiones = ['Dimensión Físico-ambiental', 'Dimensión Económico-productivo'];
      const drive = i % 2 === 1
        ? 'https://drive.google.com/file/d/XYZ987/view?usp=drive_link'
        : 'https://example.com/a.pdf';
      return [
        c,
        dimensiones[i % 2],
        `Documento de prueba CI ${c}`,
        i % 2 ? 'Instituto' : 'Equipo técnico',
        String(2019 + i),
        i % 2 ? 'Ley Nacional' : 'Plan Maestro',
        i % 2 ? 'Nacional (Colombia)' : 'Departamental (Quindío)',
        i % 2 ? 'Excel' : 'PDF',
        drive,
      ].join(',');
    })
    .join('\n');
  return [
    'No.,,Título del documento,Autor(es),Fecha de publicación,Tipo de documento,Delimitación espacial,Formato,Link de acceso/descarga',
    filas,
  ].join('\n');
}

describe('Repositorio (e2e)', () => {
  let app: INestApplication<App>;
  let users: UsersService;
  let items: RepositorioService;

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

  async function importarCsv(token: string, csv: string) {
    return request(app.getHttpServer())
      .post('/api/repositorio/importar')
      .set('authorization', `Bearer ${token}`)
      .attach('file', Buffer.from(csv), {
        filename: 'repositorio.csv',
        contentType: 'text/csv',
      })
      .expect(201);
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api', { exclude: ['health', 'health/(.*)'] });
    await app.init();
    users = app.get(UsersService);
    items = app.get(RepositorioService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('superficies públicas', () => {
    it('el catálogo público no exige token y solo devuelve publicado', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/repositorio?perPage=10')
        .expect(200);

      const data = res.body.data as { publicado?: boolean }[];
      expect(res.body.meta.total).toBeGreaterThan(0);
      for (const doc of data) {
        expect(doc.publicado).toBe(true);
      }
    });

    it('la ficha pública ignora los borradores', async () => {
      const creado = await items.create({
        codigo: 9001,
        titulo: 'BORRADOR invisibles para público',
        tipo: 'Informe General o de Gestión',
        formato: 'PDF',
        publicado: false,
      });

      await request(app.getHttpServer())
        .get(`/api/repositorio/${creado.id}`)
        .expect(404);
    });

    it('estadísticas y facetas son públicas y coherentes', async () => {
      const stats = await request(app.getHttpServer())
        .get('/api/repositorio/estadisticas')
        .expect(200);
      expect(stats.body.total).toBeGreaterThan(0);
      expect(Array.isArray(stats.body.porDimension)).toBe(true);
      expect(stats.body.porDimension.length).toBeGreaterThan(0);
      // El total es la suma de lo publicado; la semilla publica 297 ítems y
      // este suite no borra ni los toca.
      expect(stats.body.porTipo.length).toBeGreaterThan(0);

      const facetas = await request(app.getHttpServer())
        .get('/api/repositorio/facetas')
        .expect(200);
      expect(facetas.body.dimensiones.length).toBeGreaterThan(0);
      expect(facetas.body.anios.length).toBeGreaterThan(0);
    });
  });

  describe('superficie del panel y roles', () => {
    it('el panel exige token', async () => {
      await request(app.getHttpServer()).get('/api/repositorio/panel').expect(401);
    });

    it('con token, el panel lista también borradores', async () => {
      const token = await tokenFor(await makeUser('editor'));
      await items.create({
        codigo: 9002,
        titulo: 'Borrador solo visible en el panel',
        tipo: 'Plan de Desarrollo o Plan Estratégico',
        formato: 'PDF',
        publicado: false,
      });

      const res = await request(app.getHttpServer())
        .get('/api/repositorio/panel?q=Borrador%20solo')
        .set('authorization', `Bearer ${token}`)
        .expect(200);

      const data = res.body.data as { publicado?: boolean }[];
      expect(data.length).toBeGreaterThan(0);
      expect(data.some((d) => d.publicado === false)).toBe(true);
    });

    it('un editor puede crear, publicar y borrar', async () => {
      const token = await tokenFor(await makeUser('editor'));

      const creado = await request(app.getHttpServer())
        .post('/api/repositorio')
        .set('authorization', `Bearer ${token}`)
        .send({
          codigo: 9003,
          titulo: 'Creado por editor desde el API',
          tipo: 'Acuerdo',
          formato: 'PDF',
          publicado: false,
        })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/api/repositorio/${creado.body.id}`)
        .set('authorization', `Bearer ${token}`)
        .send({ publicado: true })
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/api/repositorio/${creado.body.id}`)
        .set('authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('importador de CSV', () => {
    it('importa el formato del Excel y normaliza dimensión, año y link de Drive', async () => {
      const token = await tokenFor(await makeUser());
      const res = await importarCsv(token, csvExcel(['7000', '7001']));
      expect(res.body).toEqual({ creados: 2, actualizados: 0, errores: [] });

      const doc = (
        await request(app.getHttpServer())
          .get('/api/repositorio/panel?q=7001')
          .set('authorization', `Bearer ${token}`)
          .expect(200)
      ).body.data as Record<string, unknown>[];

      const primero = doc.find((d) => d.codigo === 7001);
      expect(primero).toBeDefined();
      expect(primero?.dimension).toBe('economica-productiva');
      expect(primero?.anio).toBe(2020);
      expect(primero?.link).toBe('https://drive.google.com/uc?export=download&id=XYZ987');
    });

    it('reimportar el mismo archivo actualiza, no duplica', async () => {
      const token = await tokenFor(await makeUser());
      const csv = csvExcel(['7100', '7101']);

      const primera = await importarCsv(token, csv);
      expect(primera.body).toEqual({ creados: 2, actualizados: 0, errores: [] });

      const segunda = await importarCsv(token, csv);
      expect(segunda.body).toEqual({ creados: 0, actualizados: 2, errores: [] });
    });

    it('una fila sin título se reporta como error sin romper la importación', async () => {
      const conError = `${csvExcel([
        '7200',
        '7201',
      ])}\n7202,Dimensión Socio-cultural,,Instituto,2024,Base de Datos,Municipal (Específico),Excel,https://example.com/x.xlsx\n`;
      const token = await tokenFor(await makeUser());
      const res = await importarCsv(token, conError);

      expect(res.body.creados).toBe(2);
      expect(res.body.errores).toHaveLength(1);
      expect(res.body.errores[0].motivo).toContain('título');
    });

    it('exige token y archivo', async () => {
      await request(app.getHttpServer())
        .post('/api/repositorio/importar')
        .attach('file', Buffer.from(csvExcel(['7300'])), { filename: 'a.csv' })
        .expect(401);

      const token = await tokenFor(await makeUser());
      await request(app.getHttpServer())
        .post('/api/repositorio/importar')
        .set('authorization', `Bearer ${token}`)
        .expect(400);
    });
  });
});