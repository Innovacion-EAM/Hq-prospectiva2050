import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../common/crud.service';
import { Noticia } from '../entities/noticia.entity';

export interface NoticiaListQuery {
  page?: number;
  perPage?: number;
  categoria?: string;
  q?: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; perPage: number };
}

@Injectable()
export class NoticiasService extends CrudService<Noticia> {
  constructor(
    @InjectRepository(Noticia)
    repository: Repository<Noticia>,
  ) {
    super(repository);
  }

  async list(query: NoticiaListQuery): Promise<Paginated<Noticia>> {
    const page = Math.max(1, Number(query.page) || 1);
    const perPage = Math.max(1, Number(query.perPage) || 30);
    const { categoria, q } = query;

    const qb = this.repository.createQueryBuilder('n');
    if (categoria && categoria !== 'Todas') {
      qb.andWhere('n.categoria = :categoria', { categoria });
    }
    if (q) {
      qb.andWhere('(n.titulo ILIKE :q OR n.resumen ILIKE :q OR n.slug ILIKE :q)', {
        q: `%${q}%`,
      });
    }
    qb.orderBy('n.fecha', 'DESC').addOrderBy('n.id', 'DESC');

    const [data, total] = await qb
      .skip((page - 1) * perPage)
      .take(perPage)
      .getManyAndCount();

    return { data, meta: { total, page, perPage } };
  }

  findBySlug(slug: string): Promise<Noticia | null> {
    return this.repository.findOne({ where: { slug } });
  }
}