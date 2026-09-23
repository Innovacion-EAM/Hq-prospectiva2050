import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}