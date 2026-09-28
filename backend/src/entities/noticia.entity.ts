import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('noticias')
export class Noticia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column()
  titulo: string;

  @Column()
  categoria: string;

  /** El documento de contenido pide registrar quién firma cada noticia. */
  @Column({ type: 'varchar', nullable: true })
  autor: string | null;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'varchar', nullable: true })
  imagen: string | null;

  @Column({ type: 'text' })
  resumen: string;

  @Column({ type: 'jsonb' })
  contenido: string[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  etiquetas: string[];

  @Column({ type: 'boolean', default: true })
  publicado: boolean;

  @Column({ type: 'boolean', default: false })
  destacado: boolean;

  @Column({ type: 'timestamp', nullable: true })
  publicadoEn: Date | null;

  /** Borrado lógico: el documento pide no perder el contenido, solo esconderlo. */
  @DeleteDateColumn({ name: 'eliminado_at', type: 'timestamptz', nullable: true })
  eliminadoAt: Date | null;
}
