import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../common/crud.service';
import { Convocatoria } from '../entities/convocatoria.entity';

@Injectable()
export class ConvocatoriasService extends CrudService<Convocatoria> {
  constructor(
    @InjectRepository(Convocatoria)
    repository: Repository<Convocatoria>,
  ) {
    super(repository);
  }

  listActiveFirst(): Promise<Convocatoria[]> {
    return this.repository.find({
      order: { activa: 'DESC', id: 'DESC' },
    });
  }
}