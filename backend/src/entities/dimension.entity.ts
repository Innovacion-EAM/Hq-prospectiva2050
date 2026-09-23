import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('config_dimensiones')
export class Dimension {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  slug: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  short: string | null;

  @Column()
  icon: string;

  @Column({ type: 'text' })
  summary: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  layers: unknown[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  steps: unknown[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  charts: unknown[];
}