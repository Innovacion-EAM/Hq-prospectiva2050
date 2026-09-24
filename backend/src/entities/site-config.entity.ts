import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('config_site')
export class SiteConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  tagline: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  headline: string[];

  @Column()
  email: string;

  @Column()
  telefono: string;

  @Column()
  telefonoHref: string;

  @Column()
  direccion: string;

  @Column()
  ciudad: string;

  @Column({ type: 'text', nullable: true })
  facebook: string | null;

  @Column({ type: 'text', nullable: true })
  instagram: string | null;

  @Column({ type: 'text', nullable: true })
  x: string | null;
}