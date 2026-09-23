import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('documentos')
export class Documento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column()
  autor: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column()
  tipo: string;

  @Column()
  delimitacion: string;

  @Column()
  formato: string;

  @Column({ type: 'text', nullable: true })
  link: string | null;
}