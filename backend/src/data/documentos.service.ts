import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CrudService } from '../common/crud.service';
import { Documento } from '../entities/documento.entity';

@Injectable()
export class DocumentosService extends CrudService<Documento> {
  constructor(
    @InjectRepository(Documento)
    repository: Repository<Documento>,
  ) {
    super(repository);
  }

  findFiltered(tipo?: string, delimitacion?: string): Promise<Documento[]> {
    const where: FindOptionsWhere<Documento> = {};
    if (tipo) where.tipo = tipo;
    if (delimitacion) where.delimitacion = delimitacion;
    return this.repository.find({ where });
  }
}