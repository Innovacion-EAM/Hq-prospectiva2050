import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('convocatorias')
export class Convocatoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column({ type: 'date', nullable: true })
  fecha: string | null;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ type: 'text', nullable: true })
  enlace: string | null;

  @Column({ type: 'boolean', default: true })
  activa: boolean;
}