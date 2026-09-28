import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('config_stats')
export class Stat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  value: string;

  @Column()
  label: string;

  @Column({ type: 'text', nullable: true })
  subtext: string | null;

  /** Borrado lógico: el documento pide no perder el contenido, solo esconderlo. */
  @DeleteDateColumn({ name: 'eliminado_at', type: 'timestamptz', nullable: true })
  eliminadoAt: Date | null;
}
