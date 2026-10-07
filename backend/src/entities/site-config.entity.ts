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

  /**
   * Contenido editable de la portada (módulo "Home" de los ajustes): el hero y
   * las secciones que van desde ahí hasta antes del pie de página.
   *
   * Va en **una sola columna jsonb** y no en seis columnas (o en una tabla con
   * seis filas) por dos razones. Una: las secciones son objetos, no valores
   * sueltos —cada una tiene sus textos y a veces sus imágenes—, y aplanarlas
   * en columnas saldría con unaigua tabla ilegible o con nombres de columnas
   * del tipo `proyectoFondoImagen`. Dos: el panel guarda **todo el sitio con un
   * solo botón**, así que partirlo en seis filas solo añadiría la posibilidad de
   * que dos eindritten al mismo tiempo y se pisaran.
   *
   * El respaldo cuando falta un texto vive en el frontend (`PORTADA`), igual que
   * pasa con `navLinks` y `NAV`: vacío significa "usa el texto del sitio", nunca
   * "sin texto", porque una sección con el titular en blanco se ve rota.
   */
  @Column({ type: 'jsonb', default: () => "'{}'" })
  home: Portada;

  /**
   * Datos legales editables (módulo "Legal" de los ajustes): el responsable del
   * tratamiento de datos, su NIT y dirección, el canal para ejercer los derechos
   * ARCO, el plazo de conservación y quiénes acceden a los datos.
   *
   * Va aparte de `home` porque no es contenido de una página del sitio: lo usan
   * el aviso de privacidad y los términos de uso, que son páginas legales. El
   * texto de fondo de esas páginas queda en el código (es redacción jurídica
   * estandarizada); aquí solo viven los **datos que cambian** con la
   * organización. Un campo vacío significa "todavía sin definir": la página
   * muestra entonces un marcador visible para que nadie publique el aviso a
   * medias creyendo que ya está completo.
   */
  @Column({ type: 'jsonb', default: () => "'{}'" })
  legal: LegalConfig;
}

/**
 * Los datos legales que la organización sí conoce y puede cambiar sin tocar
 * código. Todos son cadenas vacías por defecto: la página los sustituye por un
 * marcador entre corchetes mientras sigan sin llenarse.
 */
export type LegalConfig = {
  /** Nombre o razón social del responsable del tratamiento. */
  responsable: string;
  /** NIT del responsable. */
  nit: string;
  /** Dirección del responsable. */
  direccion: string;
  /** Ciudad del responsable. */
  ciudad: string;
  /** Correo para ejercer los derechos ARCO (acceso, rectificación, cancelación, oposición). */
  correoArco: string;
  /** Cuánto tiempo se conservan los mensajes y las inscripciones. */
  plazoConservacion: string;
  /** Quiénes (puestos o entidades) acceden a los datos y con qué acuerdo. */
  quienesAcceden: string;
  /** Fecha de la última actualización de las políticas. */
  actualizado: string;
};

/** Un enlace del menú de navegación del encabezado. */
export type NavLink = {
  label: string;
  href: string;
};

/**
 * Colores que puede tener un botón de la portada.
 *
 * La misma lista para **todos** los botones, no solo el del hero: cada sección
 * tiene el suyo, y que compartan lista es lo que hace que el sitio se vea
 * coherente. Tiene que coincidir con `COLORES_BOTON` en `common/dto.ts` (lo que
 * valida) y en `frontend/src/data/site.ts` (lo que se pinta).
 */
export type ColorBoton = 'lima' | 'lima-oscuro' | 'verde' | 'tinta' | 'convoca';

/**
 * Los colores válidos para el botón que va **encima de la caja lima** del hero.
 *
 * Sin `lima` ni `lima-oscuro`: se fundiría con la caja y el botón quedaría
 * ilegible. El backend lo rechaza (`COLORES_BOTON_ENCIMA_LIMA` en `common/dto.ts`).
 */
export type ColorBotonSobreLima = 'verde' | 'tinta' | 'convoca';

/**
 * El hero de la portada: titular, imágenes y botón.
 *
 * `titular` no está aquí: es la columna `headline` de la fila, que ya existía de
 * antes de este módulo. Duplicarla dentro de `hero` habría dejado dos sitios
 * editando el mismo titular, y el que no se guardara sería el que se vería.
 */
export type HeroPortada = {
  /**
   * Ruta de la imagen de fondo. `null` = la que trae el sitio.
   *
   * Se guarda `null` y no `""` a propósito: el botón «Usar la del sitio» del
   * panel manda la cadena vacía, y en la fusión un campo vacío llegaría como
   * ausente y no se escribiría —el mismo motivo por el que `logoUrl` usa
   * `null`—. El frontend lo resuelve al respaldo (`imagenO`).
   */
  fondo: string | null;
  /** Ruta de la foto de las personas. `null` = la que trae el sitio. */
  imagen: string | null;
  botonTexto: string;
  botonColor: ColorBoton;
  /** El rótulo de la caja «pregunta o recomendación». */
  cajaTitulo: string;
  /**
   * El color del «Enviar» de esa caja.
   *
   * Es el único botón de la portada que **no** puede ser lima: la caja es lima.
   *
   * Opcional, como los demás colores: una fila guardada antes de que existiera
   * el campo no lo tiene, y el backend no puede exigirlo sin romper los
   * guardados parciales.
   */
  cajaBotonColor?: ColorBotonSobreLima;
};

/** La sección oscura de «El proyecto», con el carrusel y las dimensiones. */
export type ProyectoPortada = {
  /** Como `HeroPortada.fondo`: `null` = la imagen que trae el sitio. */
  fondo: string | null;
  titulo: string;
  texto: string;
  tarjetaBoton: string;
  /**
   * El color del botón «Explorar más» de las tarjetas del carrusel.
   *
   * Opcional, y no por descuido: una fila guardada antes de que existiera el
   * campo no lo tiene. Quien lo pinte lo resuelve (el frontend y el panel lo
   * hacen los dos), pero el backend no puede exigirlo —sin `@IsOptional()`
   * cualquier guardado parcial de la portada respondería `400`.
   */
  botonColor?: ColorBoton;
  dimsTitulo: string;
  dimsTexto: string;
  accionTitulo: string;
};

/** Un bloque de dos textos: titular y párrafo. */
export type SeccionPortada = {
  titulo: string;
  texto: string;
};

/**
 * La página «El proyecto» (`/proyecto`).
 *
 * Vive en `home` como una sección más porque ahí viven las secciones editables
 * del sitio; el módulo «El proyecto» del panel la edita con el mismo guardado.
 * `titulo` aquí **sí** se edita, a diferencia de los rótulos de la portada:
 * es el titular de la página.
 */
export type ElProyectoPortada = {
  /** Como `HeroPortada.fondo`: `null` = la imagen que trae el sitio. */
  fondo: string | null;
  titulo: string;
  intro: string;
  parrafoUno: string;
  parrafoDos: string;
  /** Las tres etapas, en orden; el «01/02/03» lo pone el diseño. */
  etapas: string[];
  /** Las entidades aliadas, en el orden en que se ven. */
  entidades: string[];
};

/**
 * El bloque de documentos, que además lleva el botón «Ver más» de cada
 * categoría.
 *
 * Antes era un `SeccionPortada` pelado, y por eso su botón iba con el color fijo
 * del código. Al darle color pasa a tener tipo propio: si se dejara como
 * `SeccionPortada`, el campo del color no estaría en el tipo y se perdería al
 * guardar.
 */
export type DocumentosPortada = SeccionPortada & {
  /** Opcional por lo mismo que `ProyectoPortada.botonColor`. */
  botonColor?: ColorBoton;
};

/** La tira de noticias, con dos botones y por tanto dos colores. */
export type NoticiasPortada = SeccionPortada & {
  botonTexto: string;
  /** El color del botón «Ver todas». Opcional, como `ProyectoPortada.botonColor`. */
  botonColor?: ColorBoton;
  /**
   * El color del «Ver más» de cada tarjeta.
   *
   * Va aparte del de «Ver todas» porque los dos botones no se parecen: el
   * primero es un botón de la página y el segundo va **encima** de la foto de la
   * noticia. Con uno solo habría que elegir cuál de los dos se entera del color.
   */
  tarjetaBotonColor?: ColorBoton;
};

/** La sección de contacto, con el botón del teléfono y el del formulario. */
export type ContactoPortada = SeccionPortada & {
  formTitulo: string;
  /**
   * El color del botón del teléfono, que es un enlace `tel:` y no un "enviar".
   *
   * Los dos colores de esta sección son opcionales y además los únicos cuyo
   * respaldo **no** es el lima del sitio: el botón del teléfono y el «Enviar»
   * estaban escritos en tinta (`bg-[#0c272e]`). Por eso el frontend y el panel
   * caen a `tinta` y no a `lima` cuando no hay color guardado — si cayesen a
   * lima, abrir el panel en una base vieja y guardar sin tocar nada los
   * cambiaría de tinta a lima.
   */
  botonColor?: ColorBoton;
  /** El color del botón «Enviar» del formulario. */
  enviarColor?: ColorBoton;
};

/**
 * El pie de página: la única columna de enlaces que se elige desde el panel.
 *
 * Las otras dos columnas son fijas y salen del código (`FOOTER_COLS`). Esta es
 * la de las tarjetas de «El proyecto», y eligir cuáles se ven evita que el pie
 * muestre siempre las mismas seis.
 */
export type FooterPortada = {
  /**
   * Hasta seis enlaces, en el orden en que se ven.
   *
   * Opcional y con respaldo en el frontend, igual que `navLinks`: una lista
   * vacía o ausente hace que el pie muestre las seis que trae el sitio, nunca
   * un pie sin nada.
   */
  enlaces?: NavLink[];
};

/** Todo lo editable de la portada, agrupado por sección. */
export type Portada = {
  hero: HeroPortada;
  proyecto: ProyectoPortada;
  /** El contenido de la página `/proyecto`: alojado aquí por compartir `home`. */
  elProyecto: ElProyectoPortada;
  /** La tira de municipios: «Todo el departamento participa». */
  cobertura: SeccionPortada;
  documentos: DocumentosPortada;
  noticias: NoticiasPortada;
  contacto: ContactoPortada;
  /** El pie de página: solo la columna que se puede elegir. */
  footer?: FooterPortada;
};