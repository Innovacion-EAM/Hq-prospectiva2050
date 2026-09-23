import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('mensajes')
export class Mensaje {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  email: string;

  @Column()
  asunto: string;

  @Column({ type: 'text', nullable: true })
  mensaje: string | null;

  @Column()
  tipo: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'boolean', default: false })
  leido: boolean;
}