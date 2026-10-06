import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, DeepPartial, EntityTarget, Repository } from 'typeorm';
import { Dimension } from '../entities/dimension.entity';
import { DocCategoria } from '../entities/doc-categoria.entity';
import { Municipio } from '../entities/municipio.entity';
import { PaginaProyecto } from '../entities/pagina-proyecto.entity';
import { SiteConfig, type Portada } from '../entities/site-config.entity';
import { Stat } from '../entities/stat.entity';
import { Taller } from '../entities/taller.entity';
import { sinCamposProtegidos } from '../common/crud.service';

const COLLECTIONS: Record<string, EntityTarget<object>> = {
  stats: Stat,
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
    const limpio = sinCamposProtegidos(data as DeepPartial<SiteConfig>);

    // Cuando la fila ya existe, `row` **es** `existing`: no son dos objetos, es
    // uno solo. Por eso la portada guardada se copia **como un clon profundo**
    // antes del `Object.assign`: si copiáramos la referencia, `Object.assign`
    // sustituiría `row.home` por el objeto parcial y ese mismo objeto parcial
    // pasaría a ser `guardada`, con lo que la fusión no tendría los valores
    // antiguos y se llevaría por delante todo lo que no venía en el PUT.
    const guardada: Portada = JSON.parse(JSON.stringify(row.home ?? {}));

    Object.assign(row, limpio);

    if ('home' in limpio) {
      // `home` se fusiona sección por sección y campo por campo en vez de
      // quedar sustituido por el objeto que llega.
      //
      // Sin esto, `PUT { home: { noticias: { titulo: 'x' } } }` —todo legal, y
      // además la forma más normal de escribir a mano o desde un script— se
      // comía las otras cinco secciones de la portada. El panel no lo nota
      // porque siempre manda el bloque entero, así que el síntoma no lo vería
      // nadie hasta que a alguien se le borrara el titular del hero sin
      // haberlo tocado.
      const entrante = (limpio.home ?? {}) as Record<string, unknown>;
      // El tipo dice `undefined` porque es verdad: `home` es un `jsonb` libre y
      // puede tener cualquier conjunto de secciones, así que una que no está
      // guardada **es** `undefined` al indexarla, aunque el tipo de `Portada` las
      // dé por obligatorias.
      const fusionada: Record<string, Record<string, unknown> | undefined> = JSON.parse(
        JSON.stringify(guardada),
      );
      for (const [seccion, campos] of Object.entries(entrante)) {
        // `class-transformer` crea una instancia de las **seis** secciones
        // siempre que viene `home`, y las que no se mandaron quedan como
        // `undefined`. Sin esta comprobación, `Object.entries(undefined)` lanza
        // `TypeError` y la petición moría con un `500` —que es lo que pasaba
        // con cualquier guardado parcial de la portada, como
        // `PUT { home: { noticias: {...} } }`—.
        if (!campos || typeof campos !== 'object') continue;

        // Se copia la sección guardada para no mutarla mientras se fusiona, y se
        // copia **sin** `?? {}` porque el spread de `undefined` ya da `{}`: es el
        // mismo resultado para una sección que todavía no existe en el `jsonb` —
        //mandarla por primera vez no tiene por qué mezclarse con nada— y sin esa
        // línea, que el linter marca como reserva inútil en un spread.
        const actuales: Record<string, unknown> = { ...fusionada[seccion] };
        for (const [k, v] of Object.entries(campos as Record<string, unknown>)) {
          // Un campo enviado **explícitamente** se escribe, aunque sea `""` o
          // `null` (que es como el panel dice "usa la del sitio"). Solo se
          // ignora si no viene: dentro de una sección mandada, los campos que
          // no se tocaron llegan como `undefined` —el DTO los declara todos— y
          // escribirlos vaciaría el resto de la sección sin que nadie lo
          // pidiera.
          if (v === undefined) continue;
          actuales[k] = v;
        }
        fusionada[seccion] = actuales;
      }
      row.home = fusionada as Portada;
    }

    return repo.save(row);
  }
}
