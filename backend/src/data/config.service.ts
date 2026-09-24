import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, DeepPartial, EntityTarget, Repository } from 'typeorm';
import { Dimension } from '../entities/dimension.entity';
import { DocCategoria } from '../entities/doc-categoria.entity';
import { Entidad } from '../entities/entidad.entity';
import { PaginaProyecto } from '../entities/pagina-proyecto.entity';
import { SiteConfig } from '../entities/site-config.entity';
import { Stat } from '../entities/stat.entity';
import { Taller } from '../entities/taller.entity';

const COLLECTIONS: Record<string, EntityTarget<object>> = {
  stats: Stat,
  entidades: Entidad,
  talleres: Taller,
  'doc-categorias': DocCategoria,
  'proyecto-paginas': PaginaProyecto,
  dimensiones: Dimension,
};

@Injectable()
export class ConfigService {
  constructor(private readonly dataSource: DataSource) {}

  private repo(collection: string): Repository<object> {
    const target = COLLECTIONS[collection];
    if (!target) {
      throw new NotFoundException(`Colección de configuración "${collection}" no existe`);
    }
    return this.dataSource.getRepository(target);
  }

  list(collection: string): Promise<object[]> {
    return this.repo(collection).find();
  }

  create(collection: string, data: unknown) {
    return this.repo(collection).save(this.repo(collection).create(data as DeepPartial<object>));
  }

  async update(collection: string, id: number, data: unknown) {
    const repo = this.repo(collection);
    const entity = await repo.findOne({ where: { id } as never });
    if (!entity) {
      throw new NotFoundException(`Recurso ${id} no encontrado`);
    }
    Object.assign(entity, data as object);
    return repo.save(entity);
  }

  async remove(collection: string, id: number) {
    const repo = this.repo(collection);
    const entity = await repo.findOne({ where: { id } as never });
    if (!entity) {
      throw new NotFoundException(`Recurso ${id} no encontrado`);
    }
    await repo.remove(entity);
  }

  getSite(): Promise<SiteConfig | null> {
    return this.dataSource.getRepository(SiteConfig).findOne({ where: { id: 1 } });
  }

  async setSite(data: unknown): Promise<SiteConfig> {
    const repo = this.dataSource.getRepository(SiteConfig);
    const existing = await repo.findOne({ where: { id: 1 } });
    const row = existing ?? repo.create({ id: 1 } as DeepPartial<SiteConfig>);
    Object.assign(row, data as object);
    return repo.save(row);
  }
}