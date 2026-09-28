import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Los doce municipios del departamento del Quindío.
 *
 * La lista estaba fija en el código del frontend, en un archivo aparte, y solo se
 * usaba para el <select> del formulario de inscripción. Eso dejaba la cobertura
 * territorial fuera de la vista del sitio —que es justo lo que el documento de
 * arquitectura pide mostrar— y obligaba a un rebuild para corregir un nombre.
 *
 * Aquí pasa a ser contenido editable como el resto: el sitio la lee de
 * `GET /api/site` y el panel la administra. `frontend/src/data/municipios.ts`
 * queda como respaldo cuando el API no responde, igual que el resto del sitio.
 */
@Entity('config_municipios')
export class Municipio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  /** Frase corta que resume la participación del municipio, opcional. */
  @Column({ type: 'varchar', length: 120, nullable: true })
  dato: string | null;

  /** Párrafo breve con el contexto del municipio, opcional. */
  @Column({ type: 'varchar', length: 500, nullable: true })
  descripcion: string | null;

  /** Borrado lógico: el documento pide no perder el contenido, solo esconderlo. */
  @DeleteDateColumn({ name: 'eliminado_at', type: 'timestamptz', nullable: true })
  eliminadoAt: Date | null;
}
