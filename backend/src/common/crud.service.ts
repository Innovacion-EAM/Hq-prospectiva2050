import { NotFoundException } from '@nestjs/common';
import { DeepPartial, Repository } from 'typeorm';

export class CrudService<Entity extends object> {
  constructor(protected readonly repository: Repository<Entity>) {}

  findAll(): Promise<Entity[]> {
    return this.repository.find();
  }

  async findOne(id: number): Promise<Entity | null> {
    return this.repository.findOne({ where: { id } as never });
  }

  async requireOne(id: number): Promise<Entity> {
    const entity = await this.findOne(id);
    if (!entity) {
      throw new NotFoundException(`Recurso ${id} no encontrado`);
    }
    return entity;
  }

  create(data: DeepPartial<Entity>): Promise<Entity> {
    return this.repository.save(this.repository.create(data));
  }

  async update(id: number, data: DeepPartial<Entity>): Promise<Entity> {
    const entity = await this.requireOne(id);
    Object.assign(entity, data);
    return this.repository.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.requireOne(id);
    await this.repository.remove(entity);
  }
}