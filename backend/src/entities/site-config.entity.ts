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

  /**
   * Encabezado del sitio (módulo "Header" de los ajustes).
   *
   * `logoUrl` es la imagen que reemplaza la marca propia del sitio: guarda la
   * ruta que devuelve la biblioteca (`/uploads/...`), no una URL absoluta, para
   * que cambiar de dominio no obligue a reescribir la fila. `null` significa
   * "usa la marca dibujada en el código", que es lo que había antes de que este
   * módulo existiera.
   *
   * `navLinks` es una lista ordenada: el orden del arreglo es el orden en que se
   * ven los enlaces, y eso es justo lo que se reordena desde el backoffice. Se
   * guarda como jsonb y no como tabla aparte porque esta fila se siembra siempre:
   * aunque se vacíe todo el contenido, el encabezado del sitio tiene que seguir
   * ahí.
   */
  @Column({ type: 'text', nullable: true })
  logoUrl: string | null;

  @Column({ type: 'varchar', length: 200, default: '' })
  logoTitulo: string;

  @Column({ type: 'varchar', length: 300, default: '' })
  logoSubtitulo: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  navLinks: NavLink[];
}

/** Un enlace del menú de navegación del encabezado. */
export type NavLink = {
  label: string;
  href: string;
};