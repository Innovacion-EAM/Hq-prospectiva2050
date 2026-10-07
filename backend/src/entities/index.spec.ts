import * as fs from 'node:fs';
import * as path from 'node:path';
import { getMetadataArgsStorage } from 'typeorm';
import { ALL_ENTITIES } from './index';

/**
 * `ALL_ENTITIES` es la única fuente de verdad del esquema en producción: la usa
 * `db-init` (con `synchronize`) para crear las tablas antes de arrancar el
 * backend. Si una entidad existe en disco pero no está en la lista, la tabla
 * NO se crea en producción y la API falla con `42P01 relation does not exist`.
 *
 * En local el fallo no se detecta porque `DB_SYNCHRONIZE=true` arranca con
 * `autoLoadEntities`, que registra las entidades por su cuenta.
 *
 * Esta prueba compara las entidades reales de la carpeta con la lista
 * canónica, para que esa desincronización no pueda volver a colarse.
 */
describe('ALL_ENTITIES', () => {
  it('incluye todas las entidades de la carpeta (una tabla por entidad)', () => {
    const dir = __dirname;

    // Tablas reales: se descubren leyendo los archivos de entidad.
    const tablasEnDisco = new Set<string>();
    for (const archivo of fs.readdirSync(dir)) {
      if (!archivo.endsWith('.entity.ts')) continue;
      const contenido = fs.readFileSync(path.join(dir, archivo), 'utf8');
      for (const coincidencia of contenido.matchAll(/@Entity\(\s*['"]([^'"]+)['"]/g)) {
        tablasEnDisco.add(coincidencia[1]);
      }
    }

    // Tablas que `db-init` sí crearía: solo las entidades de `ALL_ENTITIES`.
    const objetivos = new Set<Function>(ALL_ENTITIES);
    const tablasEnLista = new Set<string>(
      getMetadataArgsStorage()
        .tables.filter((tabla) => objetivos.has(tabla.target as Function))
        .map((tabla) => tabla.name as string),
    );

    expect(tablasEnLista).toEqual(tablasEnDisco);
  });
});