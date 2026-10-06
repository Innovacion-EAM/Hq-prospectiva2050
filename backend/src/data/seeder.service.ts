import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { randomInt } from 'node:crypto';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Convocatoria } from '../entities/convocatoria.entity';
import { Dimension } from '../entities/dimension.entity';
import { DocCategoria } from '../entities/doc-categoria.entity';
import { Documento } from '../entities/documento.entity';
import { Entidad } from '../entities/entidad.entity';
import { Mensaje } from '../entities/mensaje.entity';
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
  SEED_ENTIDADES,
  SEED_MENSAJES,
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

  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seed(Stat, SEED_STATS);
    await this.seed(Entidad, SEED_ENTIDADES);
    await this.seed(Taller, SEED_TALLERES);
    await this.seed(DocCategoria, SEED_CATEGORIAS);
    await this.seed(PaginaProyecto, SEED_PROYECTO_PAGINAS);
    await this.seed(Dimension, SEED_DIMENSIONES);
    await this.seed(Noticia, SEED_NOTICIAS);
    await this.seed(Documento, SEED_DOCUMENTOS);
    await this.seed(Convocatoria, SEED_CONVOCATORIAS);
    await this.seed(RepositorioItem, SEED_REPOSITORIO);
    await this.seed(Mensaje, SEED_MENSAJES);
    await this.seedSite();
    await this.seedUsers();
  }

  private async seed<T extends object>(entity: new () => T, rows: unknown[]): Promise<void> {
    const repo = this.dataSource.getRepository(entity);
    const count = await repo.count();
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
    }
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