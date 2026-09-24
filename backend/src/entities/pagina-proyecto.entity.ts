import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('config_proyecto_paginas')
export class PaginaProyecto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  slug: string;

  @Column()
  title: string;

  @Column()
  kicker: string;

  @Column({ type: 'varchar', nullable: true })
  image: string | null;

  @Column({ type: 'text' })
  excerpt: string;

  @Column({ type: 'text', nullable: true })
  lead: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  body: string[];
}