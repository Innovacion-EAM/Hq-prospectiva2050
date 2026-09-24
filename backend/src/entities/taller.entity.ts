import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('config_talleres')
export class Taller {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  place: string;

  @Column()
  status: string;
}