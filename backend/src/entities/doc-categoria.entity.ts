import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}