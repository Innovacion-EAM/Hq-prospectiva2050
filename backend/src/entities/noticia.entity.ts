import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}