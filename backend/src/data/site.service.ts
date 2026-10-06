import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Dimension } from '../entities/dimension.entity';
import { DocCategoria } from '../entities/doc-categoria.entity';
import { Municipio } from '../entities/municipio.entity';
import { PaginaProyecto } from '../entities/pagina-proyecto.entity';
import { SiteConfig } from '../entities/site-config.entity';
import { Stat } from '../entities/stat.entity';
import { Taller } from '../entities/taller.entity';

@Injectable()
export class SiteService {
  constructor(private readonly dataSource: DataSource) {}

  async getSiteData() {
    // Las entidades aliadas no vienen de su tabla: desde que se editan en
    // Ajustes → El proyecto viven en `home.elProyecto.entidades`, dentro de
    // `site`, y el frontend las lee de ahí (`PORTADA.elProyecto`).
    const [site, stats, municipios, talleres, categorias, paginas, dimensiones] =
      await Promise.all([
        this.dataSource.getRepository(SiteConfig).findOne({ where: { id: 1 } }),
        this.dataSource.getRepository(Stat).find({ order: { id: 'ASC' } }),
        this.dataSource.getRepository(Municipio).find({ order: { id: 'ASC' } }),
        this.dataSource.getRepository(Taller).find({ order: { id: 'ASC' } }),
        this.dataSource.getRepository(DocCategoria).find({ order: { id: 'ASC' } }),
        this.dataSource.getRepository(PaginaProyecto).find({ order: { id: 'ASC' } }),
        this.dataSource.getRepository(Dimension).find({ order: { id: 'ASC' } }),
      ]);
    return { site, stats, municipios, talleres, categorias, paginas, dimensiones };
  }
}