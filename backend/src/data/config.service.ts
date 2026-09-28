import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, DeepPartial, EntityTarget, Repository } from 'typeorm';
import { Dimension } from '../entities/dimension.entity';
import { DocCategoria } from '../entities/doc-categoria.entity';
import { Entidad } from '../entities/entidad.entity';
import { Municipio } from '../entities/municipio.entity';
import { PaginaProyecto } from '../entities/pagina-proyecto.entity';
import { SiteConfig } from '../entities/site-config.entity';
import { Stat } from '../entities/stat.entity';
import { Taller } from '../entities/taller.entity';
import { sinCamposProtegidos } from '../common/crud.service';

const COLLECTIONS: Record<string, EntityTarget<object>> = {
  stats: Stat,
  entidades: Entidad,
  municipios: Municipio,
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
    return this.repo(collection).find({ order: { id: 'ASC' } });
  }

  create(collection: string, data: object) {
    const repo = this.repo(collection);
    return repo.save(repo.create(sinCamposProtegidos(data as DeepPartial<object>)));
  }

  async update(collection: string, id: number, data: object) {
    const repo = this.repo(collection);
    const entity = await repo.findOne({ where: { id } as never });
    if (!entity) {
      throw new NotFoundException(`Recurso ${id} no encontrado`);
    }
    Object.assign(entity, sinCamposProtegidos(data as DeepPartial<object>));
    return repo.save(entity);
  }

  /**
   * Borrado lógico, igual que en CrudService: se retira, no se destruye.
   *
   * Con la misma excepción: si la entidad de la colección no declara
   * `@DeleteDateColumn`, `softRemove` lanza `MissingDeleteDateColumnError` y el
   * endpoint devolvía 500. Ahí el borrado es en firme. Ver `CrudService.remove`.
   */
  async remove(collection: string, id: number) {
    const repo = this.repo(collection);
    const entity = await repo.findOne({ where: { id } as never });
    if (!entity) {
      throw new NotFoundException(`Recurso ${id} no encontrado`);
    }
    if (!repo.metadata.deleteDateColumn) {
      return repo.remove(entity);
    }
    return repo.softRemove(entity);
  }

  /** Ver CrudService.restore: `repo.restore()` rompe con columnas jsonb. */
  async restore(collection: string, id: number) {
    const repo = this.repo(collection);
    const { affected } = await repo
      .createQueryBuilder()
      .withDeleted()
      .update()
      .set({ eliminadoAt: null } as never)
      .where('id = :id', { id })
      .andWhere('eliminado_at IS NOT NULL')
      .execute();

    if (affected === 0) {
      const existe = await repo.findOne({ where: { id } as never });
      if (!existe) {
        throw new NotFoundException(`Recurso ${id} no encontrado en la papelera`);
      }
      throw new BadRequestException(`Recurso ${id} no está en la papelera`);
    }
    return repo.findOne({ where: { id } as never });
  }

  async listTrashed(collection: string) {
    const repo = this.repo(collection);
    const todas = await repo.find({ withDeleted: true, order: { id: 'ASC' } });
    return todas.filter((e) => (e as { eliminadoAt?: Date | null }).eliminadoAt);
  }

  getSite(): Promise<SiteConfig | null> {
    return this.dataSource.getRepository(SiteConfig).findOne({ where: { id: 1 } });
  }

  async setSite(data: object): Promise<SiteConfig> {
    const repo = this.dataSource.getRepository(SiteConfig);
    const existing = await repo.findOne({ where: { id: 1 } });
    const row = existing ?? repo.create({ id: 1 } as DeepPartial<SiteConfig>);
    Object.assign(row, sinCamposProtegidos(data as DeepPartial<SiteConfig>));
    return repo.save(row);
  }
}
