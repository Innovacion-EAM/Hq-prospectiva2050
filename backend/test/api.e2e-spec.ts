import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/app.setup';
import { UsersService } from './../src/auth/users.service';
import { Mensaje } from './../src/entities/mensaje.entity';
import { Noticia } from './../src/entities/noticia.entity';
import { Dimension } from './../src/entities/dimension.entity';
import { SiteConfig, type LegalConfig, type Portada } from './../src/entities/site-config.entity';

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
let users: UsersService;

/**
 * Cuenta de administrador propia de esta corrida.
 *
 * Esta suite necesita un token de admin en casi todos los tests, y ya no puede
 * fiarse de la semilla: la semilla crea el admin con una contraseña aleatoria
 * que imprime una vez en el log (la que había, `Admin123*`, está en el
 * repositorio y se quitó a propósito). Así que el `beforeAll` crea su propia
 * cuenta de admin con esta clave conocida, y `tokenAdmin()` entra con ella.
 */
const ADMIN_EMAIL = `super-${Date.now().toString(36)}@prospectiva.test`;
const ADMIN_PASSWORD = 'Prueba-Solo-CI-2026';

/**
 * Id más alto de `mensajes` antes de que empezara la corrida. La red de
 * seguridad del `afterAll` borra **solo lo que se creó durante la corrida**, o
 * sea `id > idAlEmpezar`.
 *
 * No se puede limpiar por nombre ni por asunto. El e2e reproduce los payloads
 * reales a propósito —`nombre: 'Ciudadanía'` es lo que manda la caja del hero y
 * `asunto: 'Solicitud de suscripción al boletín'` lo pone el backend al
 * suscribirse—, y un borrado por contenido no distingue un mensaje de prueba de
 * uno que mandó una persona: se llevó la suscripción al boletín y la sugerencia
 * que había llegado de verdad. La suite corre contra la base de desarrollo, que
 * es la misma que usa el backoffice, así que el filtro no era un descuido
 * menor: borraba los mensajes de la ciudadanía.
 *
 * El valor inicial es `MAX_SAFE_INTEGER` y no `0` a propósito: si el `beforeAll`
 * llegara a fallar antes de anotarlo, el `afterAll` no borraría nada en vez de
 * vaciar la tabla entera. Ante la duda, no borrar.
 */
let idAlEmpezar = Number.MAX_SAFE_INTEGER;

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

    users = app.get(UsersService);
    mensajes = app.get<Repository<Mensaje>>(getRepositoryToken(Mensaje));
    noticiasRepo = app.get<Repository<Noticia>>(getRepositoryToken(Noticia));
    // Cuenta de admin propia: ver `ADMIN_EMAIL` más arriba. Si una corrida
    // anterior quedó a medias, el correo es distinto (lleva el timestamp), así
    // que nunca choca con un `UNIQUE`; el `beforeAll` la crea siempre.
    await users.create({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
    });
    // Se anota el punto de partida antes de crear nada: a partir de aquí, todo
    // lo que aparezca en `mensajes` es de esta corrida y se puede borrar.
    const [elMasAlto] = await mensajes.find({ order: { id: 'DESC' }, take: 1 });
    idAlEmpezar = elMasAlto?.id ?? 0;
  });

  afterAll(async () => {
    // Red de seguridad: si un test murió a mitad, su mensaje quedó en la base.
    // Se borra por id —todo lo de esta corrida— y nunca por contenido, para no
    // llevarse lo que haya mandado la gente (ver `idAlEmpezar`).
    await mensajes.createQueryBuilder().delete().from(Mensaje)
      .where('id > :id', { id: idAlEmpezar })
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
    /**
     * La forma de `body` es lo que se está vigilando aquí, no cuántas hay: el
     * frontend hace `body.map(...)` y, si esto volviera a ser un texto suelto,
     * la página `/dimensiones/:slug` se caía con un TypeError y se quedaba en
     * blanco.
     *
     * La dimensión la crea el propio test en vez de confiar en la semilla. La
     * suite corre contra la base de desarrollo, que puede estar vacía a
     * propósito (`make db-vacia` la deja sin contenido), y un test que exige
     * que haya contenido de muestra obliga a que la base nunca pueda estar
     * vacía.
     */
    it('cada dimensión trae el body como lista de párrafos, no como texto', async () => {
      const repo = app.get<Repository<Dimension>>(getRepositoryToken(Dimension));
      const slug = 'e2e-dimension';
      const creada = await repo.save(
        repo.create({
          slug,
          title: 'Dimensión de prueba',
          tipo: 'dimension',
          icon: 'target',
          short: 'De prueba',
          summary: 'Dimensión que crea el e2e.',
          body: ['Primer párrafo.', 'Segundo párrafo.'],
          stepsLabel: 'Retos de prueba',
          layersLabel: 'Líneas de prueba',
        }),
      );

      try {
        const res = await request(app.getHttpServer()).get('/api/site').expect(200);
        const dimensiones = (
          res.body.dimensiones as Array<{
            slug: string;
            body: unknown;
            stepsLabel?: unknown;
            layersLabel?: unknown;
          }>
        ).filter((d) => d.slug === slug);
        expect(dimensiones).toHaveLength(1);

        for (const parrafo of dimensiones[0].body as string[]) {
          expect(typeof parrafo).toBe('string');
        }
        expect(dimensiones[0].body as string[]).toEqual(['Primer párrafo.', 'Segundo párrafo.']);

        // Los rótulos de las listas viajan en el mismo payload público: la ficha
        // los usa para encabezar «retos» y «líneas», que en un bloque cambian.
        expect(dimensiones[0].stepsLabel).toBe('Retos de prueba');
        expect(dimensiones[0].layersLabel).toBe('Líneas de prueba');
      } finally {
        await repo.delete(creada.id);
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

  // ── Encabezado configurable (Ajustes → Header) ────────────────────────────
  describe('encabezado del sitio', () => {
    let configRepo: Repository<SiteConfig>;
    let original: SiteConfig | null = null;

    beforeAll(async () => {
      configRepo = app.get<Repository<SiteConfig>>(getRepositoryToken(SiteConfig));
      // Se guarda la fila que hay y se vuelve a dejar tal cual al terminar. Esta
      // suite corre contra la base de desarrollo, que es la que usa el panel de
      // verdad: cambiarla sería tocar la configuración que está viendo la gente.
      original = await configRepo.findOne({ where: { id: 1 } });
    });

    afterAll(async () => {
      // `save` con la entidad tal cual la leyó, sin `...`: repartir con spread le
      // quita el prototipo y el linter lo marca.
      if (original) await configRepo.save(original);
    });

    it('guarda el logo, los textos y el orden de los enlaces', async () => {
      const navLinks = [
        { label: 'Noticias', href: '/noticias' },
        { label: 'Inicio', href: '/' },
        { label: 'Externo', href: 'https://ejemplo.com' },
      ];
      const token = await tokenAdmin();

      await request(app.getHttpServer())
        .put('/api/config/site')
        .set('authorization', `Bearer ${token}`)
        .send({ logoUrl: '/uploads/logo.png', logoTitulo: 'Prueba', logoSubtitulo: '2050', navLinks })
        .expect(200);

      // Se lee por la ruta **pública**: así se comprueba lo que de verdad ve un
      // visitante, no solo que el PUT respondió bien.
      const publica = (await request(app.getHttpServer()).get('/api/site').expect(200)).body
        .site as SiteConfig;
      expect(publica.logoUrl).toBe('/uploads/logo.png');
      expect(publica.logoTitulo).toBe('Prueba');
      expect(publica.navLinks).toEqual(navLinks);
    });

    it('guarda el orden tal cual, sin reordenar nada por su cuenta', async () => {
      // El orden es lo que la persona eligió en el panel. Si el servidor lo
      // "arreglara" por su cuenta, el menú del sitio nunca coincidiría con lo
      // que se ve en la pantalla de ajustes.
      const navLinks = [
        { label: 'Contáctanos', href: '/contactos' },
        { label: 'Inicio', href: '/' },
        { label: 'Participa', href: '/participa' },
      ];
      await request(app.getHttpServer())
        .put('/api/config/site')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .send({ navLinks })
        .expect(200);

      const publica = (await request(app.getHttpServer()).get('/api/site').expect(200)).body
        .site as SiteConfig;
      expect(publica.navLinks.map((l) => l.label)).toEqual([
        'Contáctanos',
        'Inicio',
        'Participa',
      ]);
    });

    it('deja quitar la imagen del logo', async () => {
      // Con `VacioOpcional` el vacío llegaba como `undefined`, es decir como campo
      // ausente, y un campo ausente no se asigna: el botón "Quitar imagen"
      // respondía 200 y el logo se quedaba. El vacío tiene que llegar como `null`.
      await request(app.getHttpServer())
        .put('/api/config/site')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .send({ logoUrl: '/uploads/logo.png' })
        .expect(200);
      await request(app.getHttpServer())
        .put('/api/config/site')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .send({ logoUrl: '' })
        .expect(200);

      const publica = (await request(app.getHttpServer()).get('/api/site').expect(200)).body
        .site as SiteConfig;
      expect(publica.logoUrl).toBeNull();
    });

    it('deja guardar el menú vacío sin romper nada', async () => {
      // Una lista vacía es un estado válido, no un error: significa "usa el menú de
      // respaldo". Por eso el panel la tiene que poder guardar y, sobre todo,
      // reponer. Sin esa vuelta atrás, borrar los siete enlaces y guardar dejaba
      // el editor vacío sin forma de volver, y el menú de respaldo del sitio
      // quedaba como la única copia en pie.
      await request(app.getHttpServer())
        .put('/api/config/site')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .send({ navLinks: [] })
        .expect(200);

      const publica = (await request(app.getHttpServer()).get('/api/site').expect(200)).body
        .site as SiteConfig;
      expect(publica.navLinks).toEqual([]);
    });

    it.each([
      ['una dirección que no es ruta ni http', [{ label: 'X', href: 'noticias' }]],
      ['una dirección vacía', [{ label: 'X', href: '' }]],
      ['un texto vacío', [{ label: '', href: '/noticias' }]],
      ['un campo de más dentro del enlace', [{ label: 'X', href: '/x', target: '_blank' }]],
      ['más de veinte enlaces', Array.from({ length: 21 }, (_, i) => ({ label: `L${i}`, href: `/l${i}` }))],
    ])('rechaza %s', async (_caso, navLinks) => {
      await request(app.getHttpServer())
        .put('/api/config/site')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .send({ navLinks })
        .expect(400);
    });

    it.each([
      ['javascript:', 'javascript:alert(1)'],
      ['data:', 'data:image/png;base64,AAAA'],
      ['una ruta suelta sin barra', 'uploads/logo.png'],
    ])('no acepta una imagen de logo que empieza por %s', async (_caso, logoUrl) => {
      // Sin este patrón, `javascript:…` se guardaría como logo y quedaría a un
      // paso de acabar en un atributo que sí lo ejecuta.
      await request(app.getHttpServer())
        .put('/api/config/site')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .send({ logoUrl })
        .expect(400);
    });

    it('no acepta el id de la fila: lo pone el servidor', async () => {
      // `forbidNonWhitelisted` es lo que evita que se escriban campos que no
      // están en el DTO. El panel tiene que quitarlo antes de mandar (ver
      // `sanear` en `backoffice/src/lib/data.ts`): cuando se colaba, **ningún**
      // guardado de los ajustes funcionaba y el aviso no decía por qué.
      await request(app.getHttpServer())
        .put('/api/config/site')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .send({ id: 1, logoTitulo: 'Con id' })
        .expect(400);
    });
  });

  // ── Portada: el hero y las secciones hasta antes del pie de página ────────
  describe('portada (módulo Home)', () => {
    let configRepo: Repository<SiteConfig>;
    let original: SiteConfig | null = null;

    beforeAll(async () => {
      configRepo = app.get<Repository<SiteConfig>>(getRepositoryToken(SiteConfig));
      original = await configRepo.findOne({ where: { id: 1 } });
    });

    afterAll(async () => {
      if (original) await configRepo.save(original);
    });

    /** Lo que ve un visitante, no lo que se envió. */
    async function portadaPublica(): Promise<Portada> {
      const res = await request(app.getHttpServer()).get('/api/site').expect(200);
      return (res.body.site as SiteConfig).home;
    }

    it('guarda el hero y las siete secciones', async () => {
      const home = {
        hero: {
          fondo: '/uploads/hero.jpg',
          botonTexto: 'Ver el proyecto',
          botonColor: 'tinta',
          cajaTitulo: '¿Alguna pregunta?',
          cajaBotonColor: 'convoca',
        },
        proyecto: {
          fondo: '/images/city-aerial.jpg',
          titulo: 'El ejercicio',
          texto: 'Catorce entidades y la CEPAL.',
          tarjetaBoton: 'Leer más',
          botonColor: 'verde',
          dimsTitulo: 'Las dimensiones',
          dimsTexto: 'Cuatro lecturas del territorio.',
          accionTitulo: 'Del diagnóstico a la acción',
        },
        cobertura: { titulo: 'Los doce municipios', texto: 'Todo el departamento.' },
        documentos: { titulo: 'Documentos', texto: 'Convenios e informes.', botonColor: 'convoca' },
        repositorio: {
          titulo: 'El inventario documental',
          texto: 'Más de {total} documentos del territorio.',
          dashboardBoton: 'Abrir el dashboard',
          dashboardColor: 'verde',
          catalogoBoton: 'Ver el catálogo',
        },
        noticias: {
          titulo: 'Actualidad',
          texto: 'Comunicados del proceso.',
          botonTexto: 'Ver todo',
          botonColor: 'tinta',
          tarjetaBotonColor: 'verde',
        },
        contacto: {
          titulo: 'Escríbenos',
          texto: 'Para más información.',
          formTitulo: 'Cuéntanos',
          botonColor: 'convoca',
          enviarColor: 'verde',
        },
      };

      await request(app.getHttpServer())
        .put('/api/config/site')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .send({ home })
        .expect(200);

      const guardada = await portadaPublica();
      expect(guardada.hero.botonColor).toBe('tinta');
      expect(guardada.hero.botonTexto).toBe('Ver el proyecto');
      expect(guardada.hero.fondo).toBe('/uploads/hero.jpg');
      expect(guardada.proyecto.dimsTitulo).toBe('Las dimensiones');
      expect(guardada.cobertura.titulo).toBe('Los doce municipios');
      expect(guardada.documentos.texto).toBe('Convenios e informes.');
      expect(guardada.repositorio.titulo).toBe('El inventario documental');
      expect(guardada.repositorio.dashboardColor).toBe('verde');
      expect(guardada.repositorio.catalogoBoton).toBe('Ver el catálogo');
      expect(guardada.noticias.botonTexto).toBe('Ver todo');
      expect(guardada.contacto.formTitulo).toBe('Cuéntanos');
    });

    it('guarda un color distinto en cada botón', async () => {
      // Cada botón tiene su campo y no hay uno compartido. Con un solo color
      // habría que decidir cuál de los dos lados de cada botón se enteraba: el
      // «Ver más» de las noticias va **encima** de la foto y «Ver todas» va sobre
      // el papel, y no siempre se lee bien el mismo color en los dos sitio.
      // Aquí se mandan seis distintos a la vez —si alguno se guardara en el campo
      // de otro, no podrían serlo—.
      const colores = {
        proyecto: 'convoca',
        documentos: 'lima-oscuro',
        noticias: 'tinta',
        tarjeta: 'verde',
        telefono: 'lima',
        enviar: 'convoca',
      };

      await request(app.getHttpServer())
        .put('/api/config/site')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .send({
          home: {
            proyecto: { botonColor: colores.proyecto },
            documentos: { botonColor: colores.documentos },
            noticias: { botonColor: colores.noticias, tarjetaBotonColor: colores.tarjeta },
            contacto: { botonColor: colores.telefono, enviarColor: colores.enviar },
          },
        })
        .expect(200);

      const guardada = await portadaPublica();
      expect(guardada.proyecto.botonColor).toBe(colores.proyecto);
      expect(guardada.documentos.botonColor).toBe(colores.documentos);
      expect(guardada.noticias.botonColor).toBe(colores.noticias);
      expect(guardada.noticias.tarjetaBotonColor).toBe(colores.tarjeta);
      expect(guardada.contacto.botonColor).toBe(colores.telefono);
      expect(guardada.contacto.enviarColor).toBe(colores.enviar);
    });

    it('guardar una sección no borra las demás', async () => {
      // Es lo que permite abrir el panel, cambiar un rótulo y guardar sin
      // tener que reenviar la portada entera. Si no, el PUT entero dejaría el
      // resto en `undefined` y el sitio caería al respaldo en todo lo demás.
      await request(app.getHttpServer())
        .put('/api/config/site')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .send({ home: { noticias: { titulo: 'Solo noticias' } } })
        .expect(200);

      const guardada = await portadaPublica();
      expect(guardada.noticias.titulo).toBe('Solo noticias');
      // Lo que no viene en el PUT se queda como estaba —estos valores son los que
      // dejó el test anterior—, y no se convierte en vacío ni desaparece.
      expect(guardada.contacto.titulo).toBe('Escríbenos');
      expect(guardada.hero.botonColor).toBe('tinta');
      expect(guardada.proyecto.dimsTitulo).toBe('Las dimensiones');
      expect(guardada.documentos.titulo).toBe('Documentos');
    });

    it('guarda una sección sin que las otras queden ni tocadas ni borradas', async () => {
      // `class-transformer` crea las seis secciones del DTO siempre que venga
      // `home`, y deja en `undefined` las que no se mandaron. Al fusionar, esas
      // `undefined` no son objetos y `Object.entries(undefined)` revienta con un
      // `500`. El panel no lo notaba porque manda el bloque entero, pero
      // cualquier guardado parcial —un script, un `curl`, la suite— sí.
      const antes = await portadaPublica();

      await request(app.getHttpServer())
        .put('/api/config/site')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .send({ home: { noticias: { titulo: 'Solo noticias' } } })
        .expect(200);

      const guardada = await portadaPublica();
      expect(guardada.noticias.titulo).toBe('Solo noticias');
      // Lo que no se mandó queda igual, no se convierte en `{}` ni desaparece.
      expect(guardada.hero).toEqual(antes.hero);
      expect(guardada.contacto).toEqual(antes.contacto);
    });

    it('deja vaciar un campo sin llevarse el resto de su sección', async () => {
      // Vacío significa "usa el texto del sitio", no "sin texto": así es como el
      // frontend lo resuelve (`pickPortada`). Por eso el backend tiene que
      // aceptarlo —si lo rechazara, el panel no podría devolver un rótulo a su
      // valor de fábrica sin escribirlo a mano— y, sobre todo, por qué no puede
      // llevarse el resto: vaciar el texto del botón no puede borrar el fondo
      // del hero ni el rótulo de la caja de preguntas.
      await request(app.getHttpServer())
        .put('/api/config/site')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .send({ home: { hero: { botonTexto: '' }, noticias: { botonTexto: '' } } })
        .expect(200);

      const guardada = await portadaPublica();
      expect(guardada.hero.botonTexto).toBeFalsy();
      expect(guardada.noticias.botonTexto).toBeFalsy();
      expect(guardada.hero.fondo).toBe('/uploads/hero.jpg');
      expect(guardada.hero.cajaTitulo).toBe('¿Alguna pregunta?');
      expect(guardada.noticias.titulo).toBe('Solo noticias');
    });

    it('deja volver a la del sitio el fondo del hero sin llevarse el resto', async () => {
      // Es el botón «Usar la del sitio» del panel, y hace falta cuando una
      // imagen subida no era la buena. La cadena vacía es cómo el panel dice
      // "usa la del sitio": el backend tiene que aceptarla y guardarla, porque
      // el frontend la resuelve al respaldo (`imagenO`). Antes devolvía `400`
      // —"La imagen de fondo debe empezar por "/" o por "https://""—, así que
      // subir una imagen nueva funcionaba pero quitarla no, que es justo lo
      // que dejaba el botón sin efecto.
      const auth = `Bearer ${await tokenAdmin()}`;
      // El fondo queda con un valor conocido antes de probar a quitarlo, y el
      // rótulo de la caja con el suyo para comprobar que vaciar el fondo no se
      // lleva el resto de la sección.
      await request(app.getHttpServer())
        .put('/api/config/site')
        .set('authorization', auth)
        .send({ home: { hero: { fondo: '/uploads/nueva.jpg', cajaTitulo: '¿Alguna pregunta?' } } })
        .expect(200);

      await request(app.getHttpServer())
        .put('/api/config/site')
        .set('authorization', auth)
        .send({ home: { hero: { fondo: '' } } })
        .expect(200);

      const hero = (await portadaPublica()).hero;
      expect(hero.fondo).toBeFalsy();
      // Y quitarlo no puede llevarse el resto de la sección.
      expect(hero.cajaTitulo).toBe('¿Alguna pregunta?');
    });

    it('deja volver a la del sitio el fondo de la sección del proyecto', async () => {
      // La tercera imagen de la portada, y el mismo caso: se sube una y hay que
      // poder quitarla. Es el mismo botón del panel, en otra sección.
      const tituloPrevio = (await portadaPublica()).proyecto.titulo;

      await request(app.getHttpServer())
        .put('/api/config/site')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .send({ home: { proyecto: { fondo: '' } } })
        .expect(200);

      const guardada = await portadaPublica();
      expect(guardada.proyecto.fondo).toBeFalsy();
      // Y el resto de la sección del proyecto sigue como estaba.
      expect(guardada.proyecto.titulo).toBe(tituloPrevio);
    });

    it('guarda el contenido de la página El proyecto, incluidas las entidades en su orden', async () => {
      await request(app.getHttpServer())
        .put('/api/config/site')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .send({
          home: {
            elProyecto: {
              titulo: 'Una visión editada',
              intro: 'Introduccion nueva.',
              parrafoUno: 'Primer parrafo.',
              parrafoDos: 'Segundo parrafo.',
              etapas: ['Etapa A', 'Etapa B', 'Etapa C'],
              entidades: ['Universidad del Quindío', 'CEPAL — ILPES (acompañamiento técnico)'],
            },
          },
        })
        .expect(200);

      const guardada = await portadaPublica();
      expect(guardada.elProyecto.titulo).toBe('Una visión editada');
      expect(guardada.elProyecto.intro).toBe('Introduccion nueva.');
      expect(guardada.elProyecto.parrafoUno).toBe('Primer parrafo.');
      expect(guardada.elProyecto.etapas).toEqual(['Etapa A', 'Etapa B', 'Etapa C']);
      expect(guardada.elProyecto.entidades).toEqual([
        'Universidad del Quindío',
        'CEPAL — ILPES (acompañamiento técnico)',
      ]);
    });

    it('guardar El proyecto no borra el resto de la portada', async () => {
      const antes = await portadaPublica();

      await request(app.getHttpServer())
        .put('/api/config/site')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .send({ home: { elProyecto: { titulo: 'Solo el titular' } } })
        .expect(200);

      const guardada = await portadaPublica();
      expect(guardada.elProyecto.titulo).toBe('Solo el titular');
      expect(guardada.elProyecto.entidades).toEqual(antes.elProyecto.entidades);
      expect(guardada.hero).toEqual(antes.hero);
    });

    it.each([
      ['un color que no está en la lista', { hero: { botonColor: 'blanco-neon' } }],
      [
        'un color del botón de las tarjetas que no está en la lista',
        { proyecto: { botonColor: 'blanco-neon' } },
      ],
      [
        'un color del botón de las noticias que no está en la lista',
        { noticias: { tarjetaBotonColor: 'blanco-neon' } },
      ],
      [
        // `lima` es un color **válido**, pero no para este botón: la caja de
        // sugerencias es lima, y un botón lima encima de una caja lima es el
        // mismo color con el mismo texto encima. El backend tiene que
        // rechazarlo aunque la lista general lo admita.
        'un color que se fundiría con el fondo del botón',
        { hero: { cajaBotonColor: 'lima' } },
      ],
      ['una imagen que no es ruta ni http', { hero: { fondo: 'uploads/hero.jpg' } }],
      ['un javascript: como imagen', { proyecto: { fondo: 'javascript:alert(1)' } }],
      ['un campo de más dentro de una sección', { hero: { color: 'rojo' } }],
      ['una sección que no existe', { pieDePagina: { titulo: 'X' } }],
    ])('rechaza %s', async (_caso, home) => {
      // El color de un botón es una lista cerrada a propósito: con un selector
      // libre se podía elegir un fondo claro con la letra oscura encima y
      // quedaba ilegible sin que nada lo avisara.
      await request(app.getHttpServer())
        .put('/api/config/site')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .send({ home })
        .expect(400);
    });

    it('guarda los enlaces del pie en su orden', async () => {
      await request(app.getHttpServer())
        .put('/api/config/site')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .send({
          home: {
            footer: {
              enlaces: [
                { label: 'Objetivo', href: '/proyecto/objetivo' },
                { label: 'Gobernanza', href: '/proyecto/gobernanza' },
              ],
            },
          },
        })
        .expect(200);

      const guardada = await portadaPublica();
      expect(guardada.footer?.enlaces).toEqual([
        { label: 'Objetivo', href: '/proyecto/objetivo' },
        { label: 'Gobernanza', href: '/proyecto/gobernanza' },
      ]);
    });

    it('deja vaciar la lista del pie sin llevarse el resto', async () => {
      // Lista vacía significa "el sitio vuelve a sus páginas por defecto", igual
      // que el menú del encabezado: es como el panel representa "no tocar esta
      // parte". Por eso debe aceptarse, y además no puede llevarse las otras
      // secciones de `home`.
      const antes = await portadaPublica();

      await request(app.getHttpServer())
        .put('/api/config/site')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .send({ home: { footer: { enlaces: [] } } })
        .expect(200);

      const guardada = await portadaPublica();
      expect(guardada.footer?.enlaces ?? []).toEqual([]);
      expect(guardada.hero).toEqual(antes.hero);
    });

    it('rechaza más de seis enlaces en el pie', async () => {
      // El tope es el del diseño: la columna del pie pinta máximo seis. Sin la
      // validación, el panel dejaría añadir el séptimo y el guardado moriría
      // con un 400 que no dice qué lista sobra.
      const enlaces = Array.from({ length: 7 }, (_, i) => ({
        label: `Enlace ${i + 1}`,
        href: `/proyecto/pagina-${i + 1}`,
      }));

      await request(app.getHttpServer())
        .put('/api/config/site')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .send({ home: { footer: { enlaces } } })
        .expect(400);
    });

    it('guarda el texto de la barra inferior del pie junto a sus enlaces', async () => {
      // El texto de derechos vive en `home.footer.copyright` y se fusiona campo
      // a campo: guardarlo no puede llevarse los enlaces ya guardados, ni
      // guardar los enlaces puede borrarlo.
      await request(app.getHttpServer())
        .put('/api/config/site')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .send({
          home: {
            footer: {
              enlaces: [{ label: 'Inicio', href: '/' }],
              copyright: 'Horizonte Quindío 2050 — Todos los derechos reservados',
            },
          },
        })
        .expect(200);

      const guardada = await portadaPublica();
      expect(guardada.footer?.copyright).toBe(
        'Horizonte Quindío 2050 — Todos los derechos reservados',
      );
      expect(guardada.footer?.enlaces).toEqual([{ label: 'Inicio', href: '/' }]);
    });

    it('acepta dejar el texto del pie vacío sin tocar los enlaces', async () => {
      await request(app.getHttpServer())
        .put('/api/config/site')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .send({ home: { footer: { enlaces: [{ label: 'Documentos', href: '/documentos' }], copyright: '' } } })
        .expect(200);

      const guardada = await portadaPublica();
      expect(guardada.footer?.copyright).toBe('');
      expect(guardada.footer?.enlaces).toEqual([{ label: 'Documentos', href: '/documentos' }]);
    });

    it('guarda el titular del hero y no lo pisa al guardar la portada', async () => {
      // El titular vive en la columna `headline` de la fila, no dentro de `home`:
      // se edita en Ajustes → Home pero viaja aparte, para que guardar una
      // sección de la portada no tenga que reenviarlo.
      await request(app.getHttpServer())
        .put('/api/config/site')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .send({ headline: ['Una línea'], home: { hero: { botonTexto: 'Otro texto' } } })
        .expect(200);

      const publica = (await request(app.getHttpServer()).get('/api/site').expect(200)).body
        .site as SiteConfig;
      expect(publica.headline).toEqual(['Una línea']);
      expect(publica.home.hero.botonTexto).toBe('Otro texto');
    });
  });

  // ── Datos legales: el módulo "Legal" de los ajustes ───────────────────────
  describe('datos legales', () => {
    let configRepo: Repository<SiteConfig>;
    let original: SiteConfig | null = null;

    beforeAll(async () => {
      configRepo = app.get<Repository<SiteConfig>>(getRepositoryToken(SiteConfig));
      original = await configRepo.findOne({ where: { id: 1 } });
    });

    afterAll(async () => {
      if (original) await configRepo.save(original);
    });

    /** Lo que ve un visitante, no lo que se envió. */
    async function legalPublica(): Promise<LegalConfig> {
      const res = await request(app.getHttpServer()).get('/api/site').expect(200);
      return (res.body.site as SiteConfig).legal;
    }

    it('guarda los datos y un guardado parcial no borra los demás', async () => {
      // El panel manda el bloque entero, pero un `curl` o un script pueden
      // mandar solo el campo que cambia. Sin la fusión campo a campo, ese PUT
      // parcial borraría el resto y el aviso de privacidad volvería a mostrar
      // sus marcadores de PENDIENTE sin que nadie hubiera tocado esos campos.
      await request(app.getHttpServer())
        .put('/api/config/site')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .send({ legal: { responsable: 'Gobernación del Quindío', nit: '890000000-0' } })
        .expect(200);

      await request(app.getHttpServer())
        .put('/api/config/site')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .send({ legal: { correoArco: 'datos@quindio.gov.co' } })
        .expect(200);

      const legal = await legalPublica();
      expect(legal.correoArco).toBe('datos@quindio.gov.co');
      expect(legal.responsable).toBe('Gobernación del Quindío');
      expect(legal.nit).toBe('890000000-0');
    });

    it('rechaza un correo ARCO que no es válido', async () => {
      await request(app.getHttpServer())
        .put('/api/config/site')
        .set('authorization', `Bearer ${await tokenAdmin()}`)
        .send({ legal: { correoArco: 'no-es-un-correo' } })
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

    // El ciclo de atención (estado + seguimiento) existe porque la caja del hero
    // es anónima y el sistema no manda correos: sin un registro de a quién se le
    // contestó y por qué canal, el mensaje se perdía. Estos tests fijan que el
    // estado se mueve, que la nota se guarda, y que el texto que envió la
    // ciudadanía no se puede reescribir desde el backoffice.
    describe('ciclo de atención', () => {
      async function crearMensaje(email: string | null): Promise<{ id: number }> {
        const creado = await mensajes.save(
          mensajes.create({
            nombre: 'E2E atención',
            email,
            asunto: 'Pregunta o recomendación',
            mensaje: 'Mensaje para probar el ciclo de atención.',
            tipo: 'sugerencias',
            fecha: new Date().toISOString().slice(0, 10),
            leido: false,
            consentimiento: true,
            estado: 'nuevo',
            seguimiento: null,
          }),
        );
        return creado;
      }

      it('mueve el estado y guarda el seguimiento sin tocar lo que envió la ciudadanía', async () => {
        const creado = await crearMensaje('e2e-atencion@example.com');

        try {
          const token = await tokenAdmin();

          const enRevision = await request(app.getHttpServer())
            .patch(`/api/mensajes/${creado.id}`)
            .set('authorization', `Bearer ${token}`)
            .send({ estado: 'en_revision' })
            .expect(200);
          expect(enRevision.body.estado).toBe('en_revision');

          const respondido = await request(app.getHttpServer())
            .patch(`/api/mensajes/${creado.id}`)
            .set('authorization', `Bearer ${token}`)
            .send({
              estado: 'respondido',
              leido: true,
              seguimiento: 'Respondido por correo el 29/09/2026.',
            })
            .expect(200);

          expect(respondido.body.estado).toBe('respondido');
          expect(respondido.body.leido).toBe(true);
          expect(respondido.body.seguimiento).toBe('Respondido por correo el 29/09/2026.');

          // Lo que la ciudadanía escribió es evidencia: no puede cambiar desde el
          // backoffice, solo se le puede anotar al lado.
          expect(respondido.body.mensaje).toBe('Mensaje para probar el ciclo de atención.');
          expect(respondido.body.consentimiento).toBe(true);
          expect(respondido.body.email).toBe('e2e-atencion@example.com');
        } finally {
          await mensajes.delete(creado.id);
        }
      });

      it('rechaza un estado fuera de la lista y no lo guarda a medias', async () => {
        const creado = await crearMensaje(null);

        try {
          const token = await tokenAdmin();

          const error = await request(app.getHttpServer())
            .patch(`/api/mensajes/${creado.id}`)
            .set('authorization', `Bearer ${token}`)
            .send({ estado: 'inventado' })
            .expect(400);
          expect(error.body.message).toEqual([
            'El estado debe ser uno de: nuevo, en_revision, respondido, archivado',
          ]);

          const fila = await mensajes.findOne({ where: { id: creado.id } });
          expect(fila?.estado).toBe('nuevo');
        } finally {
          await mensajes.delete(creado.id);
        }
      });

      // El `whitelist` del ValidationPipe es lo que impide que un PATCH
      // reescriba el texto original del mensaje. Si algún día se afloja, alguien
      // podría hacer pasar por suyo un mensaje que nunca llegó así.
      it('no deja reescribir el mensaje original ni la autorización', async () => {
        const creado = await crearMensaje(null);

        try {
          await request(app.getHttpServer())
            .patch(`/api/mensajes/${creado.id}`)
            .set('authorization', `Bearer ${await tokenAdmin()}`)
            .send({ mensaje: 'Texto inventado', consentimiento: false, nombre: 'Otro' })
            .expect(400);

          const fila = await mensajes.findOne({ where: { id: creado.id } });
          expect(fila?.mensaje).toBe('Mensaje para probar el ciclo de atención.');
          expect(fila?.consentimiento).toBe(true);
          expect(fila?.nombre).toBe('E2E atención');
        } finally {
          await mensajes.delete(creado.id);
        }
      });
    });
  });

  // ── Sugerencias: la caja del hero ──────────────────────────────────────
  describe('sugerencias del hero', () => {
    /**
     * La caja del hero es anónima pero admite correo para quien quiera que le
     * contesten. Estos tests fijan las tres formas en que puede llegar el campo:
     * ausente, vacío y con valor.
     */
    // Devuelve el `Test` de supertest tal cual, para poder encadenar `.expect()`
    // en cada test, que es donde se lee el código de respuesta.
    function enviarSugerencia(cuerpo: Record<string, unknown>) {
      return request(app.getHttpServer())
        .post('/api/forms/sugerencias')
        .send({
          nombre: 'Ciudadanía',
          sugerencia: 'Pregunta válida de prueba.',
          consentimiento: true,
          ...cuerpo,
        });
    }

    async function ultimaSugerencia() {
      return (
        await mensajes.findOne({ where: { tipo: 'sugerencias' }, order: { id: 'DESC' } })
      ) as unknown as { id: number; email: string | null; estado: string; seguimiento: string | null } | null;
    }

    it('sin correo guarda null, no una dirección inventada', async () => {
      await enviarSugerencia({}).expect(201);
      const fila = await ultimaSugerencia();
      try {
        // Antes se guardaba `anonimo@prospectiva.local`: una dirección que parecía
        // real en la bandeja y contra la que nadie podía escribir.
        expect(fila?.email).toBeNull();
        expect(fila?.estado).toBe('nuevo');
        expect(fila?.seguimiento).toBeNull();
      } finally {
        if (fila) await mensajes.delete(fila.id);
      }
    });

    it('un correo vacío es la misma cosa que no dejarlo', async () => {
      await enviarSugerencia({ email: '' }).expect(201);
      const fila = await ultimaSugerencia();
      try {
        expect(fila?.email).toBeNull();
      } finally {
        if (fila) await mensajes.delete(fila.id);
      }
    });

    // Pegar un correo con espacio al final es lo más normal del mundo, y
    // `@IsEmail` es estricto: sin recortar antes de validar, la petición moría
    // con un 400 aunque la dirección fuera buena.
    it('acepta un correo con espacios y lo guarda recortado y en minúsculas', async () => {
      await enviarSugerencia({ email: '  E2E.Sugerencia@Correo.COM  ' }).expect(201);
      const fila = await ultimaSugerencia();
      try {
        expect(fila?.email).toBe('e2e.sugerencia@correo.com');
      } finally {
        if (fila) await mensajes.delete(fila.id);
      }
    });

    it('rechaza un correo que no es una dirección', async () => {
      await enviarSugerencia({ email: 'esto-no-es-un-correo' }).expect(400);
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
          .get('/api/noticias/panel?perPage=100')
          .set('authorization', `Bearer ${await tokenAdmin()}`)
          .expect(200);
        expect(
          (backoffice.body.data as Array<{ slug: string }>).some(
            (n) => n.slug === 'borrador-de-e2e',
          ),
        ).toBe(true);

        // El detalle sigue igual: 404 para el público (incluso con token: las
        // rutas públicas no miran el token) y 200 para el backoffice por el
        // panel. Antes este test pasaba por la ruta pública porque la ruta
        // resolvía el token a mano; el fix de main hace que el backoffice use
        // `/panel`.
        await request(app.getHttpServer()).get('/api/noticias/borrador-de-e2e').expect(404);
        await request(app.getHttpServer())
          .get('/api/noticias/borrador-de-e2e')
          .set('authorization', `Bearer ${await tokenAdmin()}`)
          .expect(404);
        await request(app.getHttpServer())
          .get('/api/noticias/panel/borrador-de-e2e')
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
    .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
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
