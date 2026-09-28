import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/app.setup';
import { Mensaje } from './../src/entities/mensaje.entity';
import { Noticia } from './../src/entities/noticia.entity';

/**
 * Todos los correos que usan los tests de formularios. Se borran al terminar
 * para que `make test-e2e` se pueda repetir sin ir llenando la bandeja de
 * entrada de messages real.
 */
// La suscripción anónima guarda un correo de relleno
// (`anonimo@prospectiva.local`), así que el marcador es el asunto, que todos
// los mensajes de prueba comparten.
const ASUNTO_DE_PRUEBA = ['E2E', 'Solicitud de suscripción al boletín'];

/**
 * E2E de la API pública y de la validación de entrada.
 *
 * Monta la app con `configureApp`, la misma función que usa `main.ts`, para que
 * el `ValidationPipe` global esté activo. Si el test montara la app a mano se
 * saltaría la validación y no probaría nada de lo que aquí se comprueba.
 */
let app: INestApplication<App>;
let mensajes: Repository<Mensaje>;
let noticiasRepo: Repository<Noticia>;

describe('API pública y validación (e2e)', () => {
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    // `init()` no abre ningún puerto. Con `listen(0)` hay un servidor real en
    // un puerto efímero y supertest lo reutiliza; si no, abre y cierra uno por
    // petición y aparecen ECONNREFUSED intermitentes.
    await app.listen(0);

    mensajes = app.get<Repository<Mensaje>>(getRepositoryToken(Mensaje));
    noticiasRepo = app.get<Repository<Noticia>>(getRepositoryToken(Noticia));

  });

  afterAll(async () => {
    await mensajes.createQueryBuilder().delete().from(Mensaje)
      .where('nombre = :n', { n: 'E2E' })
      .orWhere('nombre = :c', { c: 'Ciudadanía' })
      .orWhere('asunto = :b', { b: 'Solicitud de suscripción al boletín' })
      .execute();
    // Red de seguridad: si una ejecución previa murió a mitad del test de
    // noticias, el slug quedó tomado y esta suite no podría ni arrancar.
    await noticiasRepo.createQueryBuilder().delete().from(Noticia)
      .where('slug = :s', { s: 'borrador-de-e2e' })
      .execute();
    await app.close();
  });

  // ── Dimensiones: la pantalla en blanco ────────────────────────────────────
  describe('dimensiones', () => {
    it('las 8 dimensiones traen body como lista de párrafos, no como texto', async () => {
      const res = await request(app.getHttpServer()).get('/api/site').expect(200);

      const dimensiones = res.body.dimensiones as Array<{ slug: string; body: unknown }>;
      expect(dimensiones.length).toBe(8);

      for (const dim of dimensiones) {
        // El frontend hace body.map(...): si esto no es un array, la página
        // /dimensiones/:slug se caía con TypeError.
        expect(Array.isArray(dim.body)).toBe(true);
        expect((dim.body as unknown[]).length).toBeGreaterThan(0);
        for (const parrafo of dim.body as unknown[]) {
          expect(typeof parrafo).toBe('string');
        }
      }
    });
  });

  // ── Formularios: los dos que faltaban ────────────────────────────────────
  describe('formularios públicos', () => {
    it('acepta una suscripción al boletín', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/forms/boletin')
        .send({ email: 'e2e-boletin@example.com', consentimiento: true })
        .expect(201);
      // No debe devolver la entidad creada: filtra el id interno y `leido`.
      expect(res.body).toEqual({ ok: true });
    });

    it('acepta una sugerencia anónima (sin correo)', async () => {
      // La caja del hero manda {nombre, sugerencia} y el correo llega vacío.
      const res = await request(app.getHttpServer())
        .post('/api/forms/sugerencias')
        .send({
          nombre: 'Ciudadanía',
          sugerencia: '¿Cómo se mide el avance del proyecto?',
          consentimiento: true,
        })
        .expect(201);
      expect(res.body).toEqual({ ok: true });
    });

    it('acepta contacto e inscripciones con los datos completos', async () => {
      await request(app.getHttpServer())
        .post('/api/forms/contacto')
        .send({
          nombre: 'E2E',
          email: 'e2e-contacto@example.com',
          mensaje: 'Mensaje de prueba del e2e.',
          consentimiento: true,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/forms/inscripciones')
        .send({
          nombre: 'E2E',
          email: 'e2e-inscripcion@example.com',
          taller: 'Mesa técnica',
          consentimiento: true,
        })
        .expect(201);
    });

    it.each([
      ['contacto', { nombre: 'X' }],
      ['sugerencias', { nombre: 'X' }],
      ['sugerencias', { nombre: 'X', sugerencia: 'corto' }],
      ['boletin', { email: 'no-es-un-correo' }],
      ['inscripciones', { nombre: 'X', email: 'x@example.com' }],
    ])('rechaza %s con cuerpo incompleto', async (ruta, cuerpo) => {
      await request(app.getHttpServer())
        .post(`/api/forms/${ruta}`)
        .send(cuerpo)
        .expect(400);
    });
  });

  // ── Ley 1581: la autorización es obligatoria, no una casilla decorativa ────
  describe('autorización de tratamiento de datos', () => {
    // La casilla del sitio deshabilita el botón, pero eso es solo interfaz: la
    // que obliga es esta. Un `curl` contra el endpoint tiene que ser rechazado
    // igual, que es lo que pide la ley.
    const CUERPOS: Record<string, Record<string, unknown>> = {
      contacto: {
        nombre: 'E2E',
        email: 'e2e-consentimiento@example.com',
        mensaje: 'Mensaje completo sin la casilla.',
      },
      sugerencias: {
        nombre: 'Ciudadanía',
        sugerencia: 'Una sugerencia completa sin la casilla.',
      },
      inscripciones: {
        nombre: 'E2E',
        email: 'e2e-consentimiento@example.com',
        taller: 'Mesa técnica',
      },
      boletin: { email: 'e2e-consentimiento@example.com' },
    };

    const RUTAS = Object.keys(CUERPOS);

    it.each(RUTAS)('rechaza %s si no viene la autorización marcada', async (ruta) => {
      const res = await request(app.getHttpServer())
        .post(`/api/forms/${ruta}`)
        .send(CUERPOS[ruta])
        .expect(400);

      // Un solo mensaje, y que sea el de la autorización: el DTO usa
      // `@Equals(true)`, no `@IsBoolean() + @IsIn([true])`, que devolvería dos
      // errores para un mismo campo y dejaría a quien llena el formulario sin
      // saber cuál corregir. Y que el mensaje diga lo que hay que hacer, no el
      // nombre técnico del campo, que es lo primero que vería quien recibe el
      // 400.
      const errores = res.body.message as string[];
      expect(Array.isArray(errores)).toBe(true);
      expect(errores).toHaveLength(1);
      expect(errores[0]).toBe(
        'Debes autorizar el tratamiento de tus datos personales para enviar el formulario. Revisa el Aviso de Privacidad.',
      );
    });

    it.each(RUTAS)('rechaza %s si la autorización viene en false', async (ruta) => {
      await request(app.getHttpServer())
        .post(`/api/forms/${ruta}`)
        .send({ ...CUERPOS[ruta], consentimiento: false })
        .expect(400);
    });

    it('guarda la autorización junto al mensaje, no la descarta', async () => {
      await request(app.getHttpServer())
        .post('/api/forms/contacto')
        .send({
          nombre: 'E2E',
          email: 'e2e-consentimiento@example.com',
          mensaje: 'Mensaje con la casilla marcada.',
          consentimiento: true,
        })
        .expect(201);

      // Sin esto, el 201 se podría estar dando con la autorización de adorno y
      // nadie se enteraría hasta que alguien pidiera la eliminación de un dato.
      const guardado = await mensajes.findOne({
        where: { email: 'e2e-consentimiento@example.com' },
        order: { fecha: 'DESC' },
      });
      expect(guardado).not.toBeNull();
      expect(guardado!.consentimiento).toBe(true);
    });
  });

  // ── Validación de escritura ─────────────────────────────────────────────
  describe('validación de entrada', () => {
    it('rechaza campos que el DTO no declara (mass assignment)', async () => {
      await request(app.getHttpServer())
        .post('/api/forms/contacto')
        .send({
          nombre: 'E2E',
          email: 'e2e@example.com',
          mensaje: 'texto',
          leido: true,
        })
        .expect(400);
    });

    it('rechaza un id no numérico donde va un id', async () => {
      await request(app.getHttpServer())
        .delete('/api/config/stats/abc')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .expect(400);
    });

    it('devuelve 404 para una colección de configuración inexistente', async () => {
      await request(app.getHttpServer())
        .post('/api/config/no-existe-esta')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .send({})
        .expect(404);
    });

    it('valida contra el DTO de la colección, no uno genérico', async () => {
      // `nombre` es válido en /config/entidades pero no en /config/stats.
      await request(app.getHttpServer())
        .post('/api/config/stats')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .send({ nombre: 'campo de entidad' })
        .expect(400);
    });
  });

  // ── Mensajes: borrar uno, que es lo único que puede hacer falta ───────────
  describe('mensajes', () => {
    // `Mensaje` no declara `@DeleteDateColumn`: los mensajes no tienen papelera
    // a propósito, porque son la bandeja de entrada y nobody consulta lo
    // borrado. El borrado es en firme. El detalle importa porque `CrudService`
    // llama a `softRemove` sin mirar la entidad, y sobre una que no tiene la
    // columna eso lanza `MissingDeleteDateColumnError`: el endpoint devolvía 500
    // y desde el backoffice no se podía borrar un mensaje suelto.
    it('borra un mensaje en firme y deja de estar en la lista', async () => {
      // Se crea por el repositorio y no por `POST /api/forms/contacto` porque
      // ese endpoint devuelve `{ok: true}` a propósito —no filtra el id interno—
      // y aquí hace falta el id para poder borrarlo por HTTP.
      const creado = await mensajes.save(
        mensajes.create({
          nombre: 'E2E',
          email: 'e2e-borrado@example.com',
          asunto: 'Formulario de contacto',
          mensaje: 'Este mensaje se borra en el mismo test.',
          tipo: 'contacto',
          fecha: new Date().toISOString().slice(0, 10),
          leido: false,
          consentimiento: true,
        }),
      );

      const antes = await request(app.getHttpServer())
        .get('/api/mensajes')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .expect(200);
      expect((antes.body as Array<{ id: number }>).some((m) => m.id === creado.id)).toBe(true);

      await request(app.getHttpServer())
        .delete(`/api/mensajes/${creado.id}`)
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .expect(200);

      // Borrado en firme de verdad: no solo desaparece del listado, la fila ya no
      // está. Si quedara con `eliminado_at` sería un `softRemove` disfrazado y
      // la fila seguiría ocupando sitio para siempre.
      const fila = await mensajes.findOne({ where: { id: creado.id } });
      expect(fila).toBeNull();

      const despues = await request(app.getHttpServer())
        .get('/api/mensajes')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .expect(200);
      expect((despues.body as Array<{ id: number }>).some((m) => m.id === creado.id)).toBe(
        false,
      );
    });

    it('devuelve 404 al borrar un mensaje que no existe', async () => {
      await request(app.getHttpServer())
        .delete('/api/mensajes/99999999')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .expect(404);
    });
  });

  // ── Noticias ────────────────────────────────────────────────────────────
  describe('noticias', () => {
    it('un slug inexistente devuelve 404, no el primer artículo', async () => {
      await request(app.getHttpServer())
        .get('/api/noticias/no-existe-este-slug-de-e2e')
        .expect(404);
    });

    it('un anónimo no ve borradores, el backoffice sí', async () => {
      const creado = await request(app.getHttpServer())
        .post('/api/noticias')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .send({
          slug: 'borrador-de-e2e',
          titulo: 'Borrador de e2e',
          fecha: '2026-01-01',
          categoria: 'Noticias y Comunicados',
          resumen: 'No debe verse en el sitio público.',
          contenido: ['Párrafo de prueba.'],
          publicado: false,
        })
        .expect(201);

      try {
        const anonimo = await request(app.getHttpServer())
          .get('/api/noticias?perPage=100')
          .expect(200);
        expect(
          (anonimo.body.data as Array<{ slug: string }>).some(
            (n) => n.slug === 'borrador-de-e2e',
          ),
        ).toBe(false);

        const backoffice = await request(app.getHttpServer())
          .get('/api/noticias?perPage=100')
          .set('authorization', `Bearer ${await tokenAdmin()}`)
          .expect(200);
        expect(
          (backoffice.body.data as Array<{ slug: string }>).some(
            (n) => n.slug === 'borrador-de-e2e',
          ),
        ).toBe(true);

        // El detalle sigue igual: 404 para el público, 200 para el backoffice.
        await request(app.getHttpServer()).get('/api/noticias/borrador-de-e2e').expect(404);
        await request(app.getHttpServer())
          .get('/api/noticias/borrador-de-e2e')
          .set('authorization', `Bearer ${await tokenAdmin()}`)
          .expect(200);
      } finally {
        // Borrado en firme a propósito. El `DELETE` de la API es lógico y deja
        // la fila con `eliminado_at`; como `noticias.slug` es UNIQUE sin mirar
        // esa columna, el slug quedaría ocupado y la suite no podría repetirse.
        await noticiasRepo.delete({ id: creado.body.id });
      }
    });
  });

  // ── Roles ───────────────────────────────────────────────────────────────
  describe('permisos por rol', () => {
    it('un editor puede usar la galería pero no borrarla ni tocar usuarios', async () => {
      const adminToken = await tokenAdmin();
      const email = 'e2e-editor@prospectiva.com';

      // Si una corrida anterior quedó a medias, el usuario ya puede existir.
      const previo = await idByEmail(email);
      if (previo !== undefined) {
        await request(app.getHttpServer())
          .delete(`/api/users/${previo}`)
          .set('authorization', `Bearer ${adminToken}`)
          .expect(200);
      }

      await request(app.getHttpServer())
        .post('/api/users')
        .set('authorization', `Bearer ${adminToken}`)
        .send({ email, password: 'TemporalE2E*', role: 'editor' })
        .expect(201);

      const editorToken = (
        await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({ email, password: 'TemporalE2E*' })
          .expect(201)
      ).body.accessToken as string;

      try {
        // Contenido y galería: sí.
        await request(app.getHttpServer())
          .get('/api/media')
          .set('authorization', `Bearer ${editorToken}`)
          .expect(200);
        await request(app.getHttpServer())
          .get('/api/noticias')
          .set('authorization', `Bearer ${editorToken}`)
          .expect(200);
        // Borrado de archivos, usuarios y ajustes del sitio: no.
        await request(app.getHttpServer())
          .delete('/api/media/999999')
          .set('authorization', `Bearer ${editorToken}`)
          .expect(403);
        await request(app.getHttpServer())
          .get('/api/users')
          .set('authorization', `Bearer ${editorToken}`)
          .expect(403);
        await request(app.getHttpServer())
          .put('/api/config/site')
          .set('authorization', `Bearer ${editorToken}`)
          .send({})
          .expect(403);
      } finally {
        const creado = await idByEmail(email);
        if (creado !== undefined) {
          await request(app.getHttpServer())
            .delete(`/api/users/${creado}`)
            .set('authorization', `Bearer ${adminToken}`)
            .expect(200);
        }
      }
    });
  });
});

async function tokenAdmin(): Promise<string> {
  const res = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email: 'admin@prospectiva.com', password: 'Admin123*' })
    .expect(201);
  return res.body.accessToken as string;
}

async function idByEmail(email: string): Promise<number | undefined> {
  const token = await tokenAdmin();
  const res = await request(app.getHttpServer())
    .get('/api/users')
    .set('authorization', `Bearer ${token}`)
    .expect(200);
  const usuarios = res.body as Array<{ id: number; email: string }>;
  return usuarios.find((u) => u.email === email)?.id;
}
