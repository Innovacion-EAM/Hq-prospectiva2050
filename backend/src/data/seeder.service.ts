import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Convocatoria } from '../entities/convocatoria.entity';
import { Dimension } from '../entities/dimension.entity';
import { DocCategoria } from '../entities/doc-categoria.entity';
import { Documento } from '../entities/documento.entity';
import { Entidad } from '../entities/entidad.entity';
import { Mensaje } from '../entities/mensaje.entity';
import { Municipio } from '../entities/municipio.entity';
import { Noticia } from '../entities/noticia.entity';
import { PaginaProyecto } from '../entities/pagina-proyecto.entity';
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
  SEED_MUNICIPIOS,
  SEED_NOTICIAS,
  SEED_PROYECTO_PAGINAS,
  SEED_SITE,
  SEED_STATS,
  SEED_TALLERES,
  SEED_USERS,
} from '../seed-data';

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
      await this.seed(Entidad, SEED_ENTIDADES);
      await this.seed(Municipio, SEED_MUNICIPIOS);
      await this.seed(Taller, SEED_TALLERES);
      await this.seed(DocCategoria, SEED_CATEGORIAS);
      await this.seed(PaginaProyecto, SEED_PROYECTO_PAGINAS);
      await this.seed(Dimension, SEED_DIMENSIONES);
      await this.seed(Noticia, SEED_NOTICIAS);
      await this.seed(Documento, SEED_DOCUMENTOS);
      await this.seed(Convocatoria, SEED_CONVOCATORIAS);
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
    }
  }

  private async seedUsers(): Promise<void> {
    const repo = this.dataSource.getRepository(User);
    const count = await repo.count();
    if (count === 0) {
      for (const seed of SEED_USERS) {
        await repo.save(
          repo.create({
            email: seed.email,
            passwordHash: await bcrypt.hash(seed.password, 12),
            role: seed.role,
          }),
        );
      }
      this.logger.log(`Sembradas ${SEED_USERS.length} cuentas de usuario`);
    }
  }
}