import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../common/crud.service';
import { Dimension } from '../entities/dimension.entity';
import { RepositorioItem } from '../entities/repositorio-item.entity';

export interface RepositorioQuery {
  page?: number;
  perPage?: number;
  dimension?: string;
  tipo?: string;
  delimitacion?: string;
  formato?: string;
  anio?: string;
  desde?: string;
  hasta?: string;
  q?: string;
  orden?: 'recientes' | 'antiguos' | 'titulo';
  /** True en las rutas del panel: incluye borradores y programados. */
  includeAll?: boolean;
}

export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; perPage: number };
}

/** Un grupo de la agregación (filtros y gráficas). */
export interface Grupo {
  clave: string | number | null;
  etiqueta?: string | null;
  count: number;
}

/**
 * Repositorio de información: CRUD, listado con filtros, facetas para los
 * desplegables y estadísticas para las gráficas del sitio público.
 *
 * Como `noticias`, tiene dos superficies: las rutas públicas solo devuelven lo
 * publicado (con `includeAll: false`) y las del panel incluyen borradores. Toda
 * agregación (facetas/estadísticas) cuenta SOLO publicados, para que las cifras
 * que ve el público coincidan con lo que realmente ve.
 */
@Injectable()
export class RepositorioService extends CrudService<RepositorioItem> {
  constructor(
    @InjectRepository(RepositorioItem)
    repository: Repository<RepositorioItem>,
    @InjectRepository(Dimension)
    private readonly dimensiones: Repository<Dimension>,
  ) {
    super(repository);
  }

  async list(query: RepositorioQuery): Promise<Paginated<RepositorioItem>> {
    const page = Math.max(1, Number(query.page) || 1);
    const perPage = Math.max(1, Number(query.perPage) || 30);

    const qb = this.repository.createQueryBuilder('r');
    if (!query.includeAll) {
      qb.andWhere('r.publicado = :pub', { pub: true }).andWhere(
        '(r.publicadoEn IS NULL OR r.publicadoEn <= :now)',
        { now: new Date() },
      );
    }
    if (query.dimension) {
      qb.andWhere('r.dimension = :dimension', { dimension: query.dimension });
    }
    if (query.tipo) {
      qb.andWhere('r.tipo = :tipo', { tipo: query.tipo });
    }
    if (query.delimitacion) {
      qb.andWhere('r.delimitacion = :delimitacion', { delimitacion: query.delimitacion });
    }
    if (query.formato) {
      qb.andWhere('r.formato = :formato', { formato: query.formato });
    }
    if (query.anio) {
      qb.andWhere('r.anio = :anio', { anio: Number(query.anio) });
    }
    if (query.desde) {
      qb.andWhere('r.anio >= :desde', { desde: Number(query.desde) });
    }
    if (query.hasta) {
      qb.andWhere('r.anio <= :hasta', { hasta: Number(query.hasta) });
    }
    if (query.q) {
      qb.andWhere('(r.titulo ILIKE :q OR r.autor ILIKE :q)', { q: `%${query.q}%` });
    }

    switch (query.orden) {
      case 'antiguos':
        qb.orderBy('r.anio', 'ASC', 'NULLS LAST').addOrderBy('r.id', 'ASC');
        break;
      case 'titulo':
        qb.orderBy('r.titulo', 'ASC', 'NULLS LAST').addOrderBy('r.id', 'ASC');
        break;
      default:
        // 'recientes' es también el orden por omisión.
        qb.orderBy('r.anio', 'DESC', 'NULLS LAST').addOrderBy('r.id', 'DESC');
        break;
    }

    const [data, total] = await qb
      .skip((page - 1) * perPage)
      .take(perPage)
      .getManyAndCount();

    return { data, meta: { total, page, perPage } };
  }

  /** Detalle público: solo lo publicado y ya visible. */
  findPublished(id: number): Promise<RepositorioItem | null> {
    return this.repository
      .createQueryBuilder('r')
      .where('r.id = :id', { id })
      .andWhere('r.publicado = :pub', { pub: true })
      .andWhere('(r.publicadoEn IS NULL OR r.publicadoEn <= :now)', { now: new Date() })
      .getOne();
  }

  /** Valores con conteo para los desplegables de filtrado del catálogo. */
  async facetas(): Promise<{
    dimensiones: Grupo[];
    tipos: Grupo[];
    delimitaciones: Grupo[];
    formatos: Grupo[];
    anios: Grupo[];
  }> {
    const [tipos, delimitaciones, formatos, anios, dimensionesConteo] = await Promise.all([
      this.grupoPorColumna('tipo', 'DESC'),
      this.grupoPorColumna('delimitacion', 'DESC'),
      this.grupoPorColumna('formato', 'DESC'),
      this.grupoPorColumna('anio', 'ASC'),
      this.grupoPorColumna('dimension', 'ASC'),
    ]);

    return {
      tipos,
      delimitaciones,
      formatos,
      anios,
      dimensiones: await this.dimensionesConTitulo(dimensionesConteo),
    };
  }

  /**
   * Agregados para las gráficas del sitio público.
   *
   * Un solo endpoint sirve las gráficas del home del repositorio Y las
   * mini-gráficas de la portada del sitio principal, así los dos dicen lo
   * mismo con la misma fuente.
   */
  async estadisticas(): Promise<{
    total: number;
    conEnlace: number;
    sinEnlace: number;
    porDimension: Grupo[];
    porTipo: Grupo[];
    porDelimitacion: Grupo[];
    porFormato: Grupo[];
    porAnio: Grupo[];
    topAutores: Grupo[];
  }> {
    const [
      total,
      conEnlace,
      porTipo,
      porDelimitacion,
      porFormato,
      porAnio,
      dimensionesConteo,
      topAutores,
    ] = await Promise.all([
      this.repository
        .createQueryBuilder('r')
        .where('r.publicado = :pub', { pub: true })
        .getCount(),
      this.repository
        .createQueryBuilder('r')
        .where('r.publicado = :pub', { pub: true })
        .andWhere('r.link IS NOT NULL')
        .getCount(),
      this.grupoPorColumna('tipo', 'DESC'),
      this.grupoPorColumna('delimitacion', 'DESC'),
      this.grupoPorColumna('formato', 'DESC'),
      this.grupoPorColumna('anio', 'ASC'),
      this.grupoPorColumna('dimension', 'ASC'),
      this.repository
        .createQueryBuilder('r')
        .select('r.autor', 'clave')
        .addSelect('COUNT(*)', 'count')
        .where('r.publicado = :pub', { pub: true })
        .andWhere('r.autor IS NOT NULL')
        .groupBy('r.autor')
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany<{ clave: string; count: string }>(),
    ]);

    return {
      total,
      conEnlace,
      sinEnlace: total - conEnlace,
      porDimension: await this.dimensionesConTitulo(dimensionesConteo),
      porTipo,
      porDelimitacion,
      porFormato,
      porAnio,
      topAutores: topAutores.map((fila) => ({
        clave: fila.clave,
        count: Number(fila.count),
      })),
    };
  }

  /** Publica todo lo que esté en borrador/programado de una vez. */
  async publicarTodos(): Promise<{ actualizados: number }> {
    const result = await this.repository
      .createQueryBuilder()
      .update(RepositorioItem)
      .set({ publicado: true, publicadoEn: () => 'CURRENT_TIMESTAMP' })
      .where('publicado = :falso', { falso: false })
      .execute();
    return { actualizados: result.affected ?? 0 };
  }

  /** Conteo agrupado por una columna, solo publicados. */
  private async grupoPorColumna(
    campo: string,
    orden: 'ASC' | 'DESC',
  ): Promise<Grupo[]> {
    const filas = await this.repository
      .createQueryBuilder('r')
      .select(`r.${campo}`, 'clave')
      .addSelect('COUNT(*)', 'count')
      .where('r.publicado = :pub', { pub: true })
      .andWhere(`r.${campo} IS NOT NULL`)
      .groupBy(`r.${campo}`)
      .orderBy('count', orden)
      .getRawMany<{ clave: string | number; count: string }>();

    return filas.map((fila) => ({
      clave: fila.clave,
      count: Number(fila.count),
    }));
  }

  /** Une los slugs de dimensión con sus títulos de `config_dimensiones`. */
  private async dimensionesConTitulo(conteos: Grupo[]): Promise<Grupo[]> {
    const titulos = new Map(
      (await this.dimensiones.find()).map((d) => [d.slug, d.title]),
    );
    return conteos.map((g) => ({
      clave: g.clave,
      etiqueta: g.clave !== null ? (titulos.get(String(g.clave)) ?? null) : null,
      count: g.count,
    }));
  }
}