import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../common/crud.service';
import type { MensajePatchDto } from '../common/dto';
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

  /**
   * Actualiza lo que el backoffice cambia de un mensaje. Antes el `PATCH` solo
   * aceptaba `leido`; ahora también mueve el estado y guarda la nota de
   * seguimiento, que es lo que permite filtrar la bandeja por lo pendiente.
   *
   * Solo se copia lo que llegó: mandar `undefined` en un campo no debe dejar
   * el mensaje sin estado a medio guardar.
   */
  async patch(id: number, cambios: MensajePatchDto): Promise<Mensaje> {
    const update: Partial<Mensaje> = {};
    if (cambios.leido !== undefined) update.leido = cambios.leido;
    if (cambios.estado !== undefined) update.estado = cambios.estado;
    if (cambios.seguimiento !== undefined) update.seguimiento = cambios.seguimiento;
    return this.update(id, update as never);
  }
}