import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('config_dimensiones')
export class Dimension {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  slug: string;

  @Column()
  title: string;

  /**
   * Distingue las 4 dimensiones de análisis del documento de arquitectura de
   * los bloques de apoyo (misiones, retos, iniciativas, hallazgos). Antes estas
   * filas se mostraban todas igual y el visitante no podía saber cuáles eran
   * las dimensiones reales.
   */
  @Column({ type: 'text', default: 'dimension' })
  tipo: 'dimension' | 'bloque';

  @Column({ type: 'text', nullable: true })
  short: string | null;

  @Column()
  icon: string;

  @Column({ type: 'text' })
  summary: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  body: string[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  layers: unknown[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  steps: unknown[];

  /**
   * Rótulo que encabeza la lista `steps`. Por defecto «Retos principales», pero
   * cada fila nombra la suya: en «Misiones del proceso» los pasos son las
   * misiones, no retos. Se edita en la barra lateral → Dimensiones.
   */
  @Column({ name: 'steps_label', type: 'text', nullable: true })
  stepsLabel: string | null;

  /** Rótulo que encabeza la lista `layers`. Por defecto «Líneas de trabajo». */
  @Column({ name: 'layers_label', type: 'text', nullable: true })
  layersLabel: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  charts: unknown[];

  /** Borrado lógico: el documento pide no perder el contenido, solo esconderlo. */
  @DeleteDateColumn({ name: 'eliminado_at', type: 'timestamptz', nullable: true })
  eliminadoAt: Date | null;
}
