import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DeepPartial, ObjectLiteral, Repository } from 'typeorm';

/**
 * Claves que nunca deben venir del cliente. `id` en particular: los formularios
 * del backoffice mandan el objeto "vacío" completo (con `id: 0`) al crear, y
 * un `Object.assign(entity, body)` sin filtro dejaría que se sobrescribiera la
 * clave primaria o cualquier otra columna.
 */
const CAMPOS_PROTEGIDOS = new Set(['id', 'createdAt', 'updatedAt', 'eliminadoAt']);

export function sinCamposProtegidos<T extends object>(data: DeepPartial<T>): DeepPartial<T> {
  const limpio: Record<string, unknown> = {};
  for (const [clave, valor] of Object.entries(data as Record<string, unknown>)) {
    if (CAMPOS_PROTEGIDOS.has(clave)) continue;
    if (valor === undefined) continue;
    limpio[clave] = valor;
  }
  return limpio as DeepPartial<T>;
}

/**
 * Toda entidad administrable por el backoffice declara la columna de borrado
 * lógico, así que el servicio puede depender de ella sin repetirla en cada
 * subclase.
 */
type ConBorradoLogico = ObjectLiteral & { eliminadoAt?: Date | null };

export class CrudService<Entity extends ConBorradoLogico> {
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
    return this.repository.save(this.repository.create(sinCamposProtegidos(data)));
  }

  async update(id: number, data: DeepPartial<Entity>): Promise<Entity> {
    const entity = await this.requireOne(id);
    Object.assign(entity, sinCamposProtegidos(data));
    return this.repository.save(entity);
  }

  /**
   * Borrado lógico, con una excepción deliberada.
   *
   * Las entidades de contenido (noticias, documentos, dimensiones…) declaran
   * `@DeleteDateColumn`, así que `softRemove` marca `eliminado_at` y la fila sale
   * de las consultas normales pero se puede recuperar: el documento de
   * arquitectura pide exactamente eso.
   *
   * Las entidades sin esa columna —mensajes, media, usuarios— no tienen papelera
   * a propósito, y para ellas el borrado es en firme. La comprobación no es
   * estética: `softRemove` sobre una entidad sin `@DeleteDateColumn` lanza
   * `MissingDeleteDateColumnError`, y eso se traducía en un 500 en
   * `DELETE /api/mensajes/:id`. Es decir: desde el backoffice no se podía
   * borrar un mensaje suelto, y el error no decía por qué.
   */
  async remove(id: number): Promise<Entity> {
    const entity = await this.requireOne(id);
    if (!this.repository.metadata.deleteDateColumn) {
      return this.repository.remove(entity);
    }
    return this.repository.softRemove(entity);
  }

  /**
   * Saca de la papelera un contenido que se había dado de baja.
   *
   * No se usa `repository.restore()`: ese método arma un UPDATE que compara
   * TODAS las columnas de la entidad en el WHERE, y al reenviar las columnas
   * jsonb (contenido, etiquetas) como parámetro Postgres responde
   * "invalid input syntax for type json". Un UPDATE por clave primaria hace lo
   * mismo sin tocar el resto de columnas.
   */
  async restore(id: number): Promise<Entity> {
    const { affected } = await this.repository
      .createQueryBuilder()
      .withDeleted()
      .update()
      .set({ eliminadoAt: null } as never)
      .where('id = :id', { id })
      // Si no estaba en la papelera, `affected` es 0 y se informa con un 400
      // claro en vez de fingir que se restauró algo.
      .andWhere('eliminado_at IS NOT NULL')
      .execute();

    if (affected === 0) {
      const existe = await this.repository.findOne({ where: { id } as never });
      if (!existe) {
        throw new NotFoundException(`Recurso ${id} no encontrado en la papelera`);
      }
      throw new BadRequestException(`Recurso ${id} no está en la papelera`);
    }
    return this.requireOne(id);
  }

  /** Lo que está en la papelera, para poder recuperarlo. */
  findTrashed(): Promise<Entity[]> {
    return this.repository.find({ withDeleted: true }).then((todas) =>
      todas.filter((e) => e.eliminadoAt),
    );
  }
}
