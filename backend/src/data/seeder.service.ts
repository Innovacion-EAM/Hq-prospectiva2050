import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
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
  SEED_SITE,
  SEED_STATS,
  SEED_TALLERES,
  SEED_USERS,
} from '../seed-data';

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