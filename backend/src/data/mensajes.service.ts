import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../common/crud.service';
import { Mensaje } from '../entities/mensaje.entity';

@Injectable()
export class MensajesService extends CrudService<Mensaje> {
  constructor(
    @InjectRepository(Mensaje)
    repository: Repository<Mensaje>,
  ) {
    super(repository);
  }

  listNewestFirst(): Promise<Mensaje[]> {
    return this.repository.find({ order: { id: 'DESC' } });
  }

  async setLeido(id: number, leido: boolean): Promise<Mensaje> {
    return this.update(id, { leido } as never);
  }
}