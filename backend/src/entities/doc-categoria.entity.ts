import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('config_doc_categorias')
export class DocCategoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  slug: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  icon: string;

  /** Borrado lógico: el documento pide no perder el contenido, solo esconderlo. */
  @DeleteDateColumn({ name: 'eliminado_at', type: 'timestamptz', nullable: true })
  eliminadoAt: Date | null;
}
