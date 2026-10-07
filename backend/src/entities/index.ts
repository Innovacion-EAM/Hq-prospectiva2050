/**
 * Barril de entidades + lista canónica `ALL_ENTITIES`.
 *
 * `ALL_ENTITIES` es la única fuente de verdad de qué tablas forman el esquema.
 * La usan tanto la app (vía `autoLoadEntities` + `TypeOrmModule.forFeature`) como
 * el CLI de inicialización de base de datos (`src/cli/db-init.ts`), para que el
 * esquema que se crea en producción no pueda desviarse del que usa la app.
 */
export { Convocatoria } from './convocatoria.entity';
export { Dimension } from './dimension.entity';
export { DocCategoria } from './doc-categoria.entity';
export { Documento } from './documento.entity';
export { Media } from './media.entity';
export { Mensaje } from './mensaje.entity';
export { Noticia } from './noticia.entity';
export { PaginaProyecto } from './pagina-proyecto.entity';
export { RepositorioItem } from './repositorio-item.entity';
export { SiteConfig } from './site-config.entity';
export { Stat } from './stat.entity';
export { Taller } from './taller.entity';
export { User, type UserRole } from './user.entity';

import { Convocatoria } from './convocatoria.entity';
import { Dimension } from './dimension.entity';
import { DocCategoria } from './doc-categoria.entity';
import { Documento } from './documento.entity';
import { Media } from './media.entity';
import { Mensaje } from './mensaje.entity';
import { Noticia } from './noticia.entity';
import { PaginaProyecto } from './pagina-proyecto.entity';
import { RepositorioItem } from './repositorio-item.entity';
import { SiteConfig } from './site-config.entity';
import { Stat } from './stat.entity';
import { Taller } from './taller.entity';
import { User } from './user.entity';

export const ALL_ENTITIES = [
  SiteConfig,
  Stat,
  Taller,
  DocCategoria,
  PaginaProyecto,
  Dimension,
  Noticia,
  Documento,
  Convocatoria,
  Mensaje,
  Media,
  RepositorioItem,
  User,
];
