import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Ítem del repositorio de información: un documento de referencia del Quindío.
 *
 * Es un catálogo con enlaces EXTERNOS (Google Drive / web), no un almacén de
 * archivos: dejar los PDFs en Drive evita ocupar el disco de la instancia en
 * 392 documentos. `link` queda `null` cuando falta (por ejemplo, la fila 247
 * del Excel original) y se muestra como "Enlace pendiente".
 *
 * `codigo` es el número del Excel original y es LA clave natural del registro:
 * con él la reimportación actualiza en vez de duplicar. `dimension` guarda el
 * slug de `config_dimensiones` (las mismas 4 dimensiones del sitio), no texto
 * libre, para poder cruzar estadísticas entre ambos módulos.
 *
 * El esquema lo crea `db-init` (vía `ALL_ENTITIES`), nunca `synchronize` en
 * producción.
 */
@Entity('repositorio_items')
export class RepositorioItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  codigo: number;

  @Column({ type: 'text' })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  autor: string | null;

  /** Año de publicación. `null` cuando el original dice NA. */
  @Column({ type: 'int', nullable: true })
  anio: number | null;

  @Column({ type: 'text' })
  tipo: string;

  @Column({ type: 'text', nullable: true })
  delimitacion: string | null;

  @Column({ type: 'text' })
  formato: string;

  /** Slug de `config_dimensiones`. */
  @Column({ type: 'text', nullable: true })
  dimension: string | null;

  /** URL externa (Drive normalizado a descarga directa, web, etc.). */
  @Column({ type: 'text', nullable: true })
  link: string | null;

  @Column({ type: 'text', nullable: true })
  resumen: string | null;

  @Column({ default: false })
  publicado: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  publicadoEn: Date | null;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  creadoEn: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  actualizadoEn: Date;
}