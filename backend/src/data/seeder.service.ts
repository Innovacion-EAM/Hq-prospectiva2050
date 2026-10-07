import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { randomInt } from 'node:crypto';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Convocatoria } from '../entities/convocatoria.entity';
import { Dimension } from '../entities/dimension.entity';
import { DocCategoria } from '../entities/doc-categoria.entity';
import { Documento } from '../entities/documento.entity';
import { Mensaje } from '../entities/mensaje.entity';
import { Municipio } from '../entities/municipio.entity';
import { Noticia } from '../entities/noticia.entity';
import { PaginaProyecto } from '../entities/pagina-proyecto.entity';
import { RepositorioItem } from '../entities/repositorio-item.entity';
import { SiteConfig } from '../entities/site-config.entity';
import { Stat } from '../entities/stat.entity';
import { Taller } from '../entities/taller.entity';
import { User } from '../entities/user.entity';
import {
  SEED_CATEGORIAS,
  SEED_CONVOCATORIAS,
  SEED_DIMENSIONES,
  SEED_DOCUMENTOS,
  SEED_HOME,
  SEED_MENSAJES,
  SEED_MUNICIPIOS,
  SEED_NOTICIAS,
  SEED_PROYECTO_PAGINAS,
  SEED_REPOSITORIO,
  SEED_SITE,
  SEED_STATS,
  SEED_TALLERES,
  SEED_USERS,
} from '../seed-data';

/**
 * Longitud de las contraseñas iniciales generadas. 20 caracteres de un
 * alfabeto de 56 dan ~117 bits de entropía, de sobra para una cuenta que se
 * cambia en el primer uso.
 */
const SEED_PASSWORD_LENGTH = 20;

/**
 * alfabeto sin caracteres ambiguos: sin 0/O ni 1/l/I. Quien lea la contraseña
 * de un log o se la dicten por teléfono no tiene que adivinar si es una "O"
 * mayúscula o un cero, que es la causa habitual de un ticket de soporte en el
 * momento más tonto.
 *
 * El sorteo usa randomInt() y NO `byte % longitud`: el módulo sobre 256
 * reparte los restos de forma desigual, y con un alfabeto de 57 caracteres los
 * primeros 28 saldrían un 11% más veces que el resto. En una contraseña de un
 * solo uso es irrelevante, pero es un sesgo gratis de quitar.
 */
const PASSWORD_ALPHABET = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);

  /**
   * Si vale `true`, se siembra contenido de muestra; si no, la base arranca vacía
   * para poder probar el sitio de verdad, con lo que se escriba a mano en lugar
   * de con lo que el seedy inventó.
   *
   * El interruptor es **opt-in**: hay que pedir el contenido de muestra
   * explícitamente. Antes era al revés (se sembraba salvo que se pusiera
   * `false`), y salió caro: `.env.dev` no tenía la variable, así que un backend
   * levantado a mano rellenaba las tablas vacías sin avisar y la base volvía a
   * tener 12 noticias deYYY que uno no había escrito. Que ningún entorno pueda
   *_resetear_ la base de trabajo por olvido es lo que hace falta aquí.
   *
   * Las dos cosas que sí se siembran siempre son las **cuentas** y la
   * **configuración del sitio**, y no por descuido: sin una cuenta no hay forma
   * de entrar al backoffice a llenar la base, y sin la fila de configuración el
   * sitio no tiene con qué arrancar. Lo único que se puede quitar es el contenido
   * de muestra, y eso es justo lo que estorba al probar desde cero.
   *
   * `make db-reset` es quien pone `SEED_CONTENIDO=true` cuando se quiere el
   * contenido de vuelta.
   */
  private readonly sembrarContenido = process.env.SEED_CONTENIDO === 'true';

  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap(): Promise<void> {
if (this.sembrarContenido) {
      await this.seed(Stat, SEED_STATS);
      await this.seed(Municipio, SEED_MUNICIPIOS);
      await this.seed(Taller, SEED_TALLERES);
      await this.seed(DocCategoria, SEED_CATEGORIAS);
      await this.seed(PaginaProyecto, SEED_PROYECTO_PAGINAS);
      await this.seed(Dimension, SEED_DIMENSIONES);
      await this.seed(Noticia, SEED_NOTICIAS);
      await this.seed(Documento, SEED_DOCUMENTOS);
      await this.seed(Convocatoria, SEED_CONVOCATORIAS);
      await this.seed(RepositorioItem, SEED_REPOSITORIO);
      await this.seed(Mensaje, SEED_MENSAJES);
    } else {
      this.logger.warn(
        'SEED_CONTENIDO=false: la base queda sin contenido de muestra. Cuentas y configuración del sitio sí se siembran.',
      );
    }
    await this.seedSite();
    await this.seedUsers();
  }

  private async seed<T extends object>(entity: new () => T, rows: unknown[]): Promise<void> {
    const repo = this.dataSource.getRepository(entity);
    // Con borrado lógico, `count()` solo cuenta las filas activas: si alguien
    // vaciara una colección entera desde la papelera, al reiniciar el backend
    // el seeder vería 0 y resucitaría justo lo que se pidió eliminar. Se cuentan
    // también las dadas de baja para que la tabla vacío siga siendo vacío.
    const incluyeBorradas = repo.metadata.deleteDateColumn ? { withDeleted: true } : {};
    const count = await repo.count(incluyeBorradas);
    if (count === 0) {
      await repo.save(repo.create(rows as never[]));
      this.logger.log(`Sembradas ${rows.length} filas en ${repo.metadata.name}`);
    }
  }

  private async seedSite(): Promise<void> {
    const repo = this.dataSource.getRepository(SiteConfig);
    const existing = await repo.findOne({ where: { id: 1 } });
    if (!existing) {
      await repo.save(repo.create({ id: 1, ...SEED_SITE } as never));
      this.logger.log('Configuración del sitio sembrada (fila 1)');
      return;
    }

    /*
     * Rellena los campos que todavía no existen en esta base.
     *
     * Añadir una columna a `config_site` no la llena: la fila 1 ya estaba, así que
     * la columna nueva le cae con su valor por defecto y la base queda con el
     * encabezado vacío —menú sin enlaces y textos en blanco— aunque la semilla
     * diga que no. Pasó con el módulo Header.
     *
     * Es el mismo relleno idempotente que hace la migración 0008, y está aquí por
     * la misma razón: en desarrollo el esquema lo crea TypeORM con
     * `DB_SYNCHRONIZE` y las migraciones no se ejecutan, así que sin esto el
     * relleno solo existiría en producción.
     *
     * Solo escribe donde el valor está vacío, de modo que no pisa lo que se haya
     * cambiado desde el backoffice.
     */
    const cambios: Partial<SiteConfig> = {};
    if (!existing.logoTitulo?.trim()) cambios.logoTitulo = SEED_SITE.logoTitulo;
    if (!existing.logoSubtitulo?.trim()) cambios.logoSubtitulo = SEED_SITE.logoSubtitulo;
    if (!existing.navLinks?.length) cambios.navLinks = SEED_SITE.navLinks;
    // La portada se rellena entera y de una vez: son siete bloques de textos e
    // imágenes que van juntos, y rellenarlos campo a campo dejaría la portada a
    // medio camino —con un titular y sin imagen, o al revés— si el proceso se
    // cortara a la mitad.
    //
    // Si la portada ya existe pero le falta una sección añadida después —como
    // «Repositorio de información»—, se rellena **solo esa**: la fila de una
    // base que ya estaba no la tiene, y sin esto el módulo Home del panel
    // abriría con esos campos en blanco aunque el sitio los muestre por su
    // respaldo. No se pisa nada de lo que ya hubiera.
    if (!Object.keys(existing.home ?? {}).length) {
      cambios.home = SEED_HOME;
    } else {
      // La portada ya existe: solo se rellenan las piezas añadidas después, sin
      // pisar nada de lo que ya hubiera. Se acumulan en `homeNueva` para no
      // sobrescribir un parche con el siguiente.
      let homeNueva: Record<string, unknown> | null = null;
      if (!Object.keys(existing.home.repositorio ?? {}).length) {
        homeNueva = { ...existing.home, repositorio: SEED_HOME.repositorio };
      }
      // El texto de la barra inferior del pie también es nuevo: una fila vieja
      // tiene `footer.enlaces` pero no `copyright`, y sin esto el módulo Footer
      // del panel abriría con el campo en blanco.
      const footer = ((homeNueva ?? (existing.home as Record<string, unknown>)).footer ??
        {}) as Record<string, unknown>;
      if (!footer.copyright) {
        homeNueva = {
          ...(homeNueva ?? (existing.home as Record<string, unknown>)),
          footer: { ...footer, copyright: SEED_HOME.footer.copyright },
        };
      }
      if (homeNueva) cambios.home = homeNueva as unknown as typeof existing.home;
    }
    // Los datos legales, igual: la columna nueva cae con `{}` en la fila que ya
    // estaba, y sin esto el módulo Legal del panel abriría sin la estructura.
    if (!Object.keys(existing.legal ?? {}).length) cambios.legal = SEED_SITE.legal;
    if (Object.keys(cambios).length === 0) return;

    // Se modifica la entidad que ya se leyó en vez de armar un objeto con
    // `...`: repartir una instancia de TypeORM con spread le quita el prototipo y
    // el linter lo marca. `Object.assign` + `save` es la vía de siempre.
    Object.assign(existing, cambios);
    await repo.save(existing);
    this.logger.log(
      `Configuración del sitio: rellenados los campos vacíos (${Object.keys(cambios).join(', ')})`,
    );
  }

  /** Genera una contraseña aleatoria legible (ver PASSWORD_ALPHABET). */
  private generatePassword(): string {
    let out = '';
    for (let i = 0; i < SEED_PASSWORD_LENGTH; i += 1) {
      out += PASSWORD_ALPHABET[randomInt(PASSWORD_ALPHABET.length)];
    }
    return out;
  }

  /**
   * Siembra la cuenta de administrador la PRIMERA vez, y solo si la tabla está
   * vacía: en cuanto existe una cuenta, la semilla no vuelve a tocar los
   * usuarios, así que cambiar la contraseña desde el panel no se deshace al
   * redesplegar.
   *
   * Cuando la semilla pide una contraseña generada (password: null), se crea
   * una aleatoria y se imprime UNA vez en el log. Esos logs solo los ve quien
   * tiene acceso al servidor; nadie más puede conocerla nunca, porque en la
   * base de datos solo queda el hash bcrypt.
   */
  private async seedUsers(): Promise<void> {
    const repo = this.dataSource.getRepository(User);
    const count = await repo.count();
    if (count > 0) {
      return;
    }

    const generated: { email: string; password: string }[] = [];

    for (const seed of SEED_USERS) {
      const password = seed.password ?? this.generatePassword();
      if (seed.password === null) {
        generated.push({ email: seed.email, password });
      }
      await repo.save(
        repo.create({
          email: seed.email,
          passwordHash: await bcrypt.hash(password, 12),
          role: seed.role,
        }),
      );
    }

    this.logger.log(`Sembradas ${SEED_USERS.length} cuentas de usuario`);

    if (generated.length > 0) {
      // A un panel de texto le cuesta un sobre todo que este bloque quede
      // separado del resto del log: es la única vez que estas claves existen
      // en claro en algún sitio, y tiene que ser fácil de encontrar.
      this.logger.warn(
        [
          '',
          '╔══════════════════════════════════════════════════════════════╗',
          '║  CONTRASEÑAS INICIALES (se muestran UNA sola vez)             ║',
          '╚══════════════════════════════════════════════════════════════╝',
          ...generated.map(
            (g) => `║  ${g.email.padEnd(28)} ${g.password.padEnd(22)} ║`,
          ),
          '║                                                              ║',
          '║  Cámbialas desde el panel: Ajustes → Mi cuenta.             ║',
          '╚══════════════════════════════════════════════════════════════╝',
          '',
        ].join('\n'),
      );
    }
  }
}