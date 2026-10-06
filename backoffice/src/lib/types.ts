import type { ColorBoton, ColorBotonSobreLima } from "./portada";

export type Noticia = {
  id: number;
  slug: string;
  titulo: string;
  fecha: string;
  categoria: string;
  autor?: string | null;
  imagen: string;
  resumen: string;
  contenido: string[];
  etiquetas: string[];
  publicado: boolean;
  destacado: boolean;
  publicadoEn?: string | null;
  /** Fecha de baja lógica; `null` mientras el registro está vigente. */
  eliminadoAt?: string | null;
};

export type Documento = {
  id: number;
  titulo: string;
  autor: string;
  fecha: string;
  tipo: string;
  delimitacion: string;
  formato: string;
  link: string;
  archivo?: string | null;
  /** Fecha de baja lógica; `null` mientras el registro está vigente. */
  eliminadoAt?: string | null;
};

export type Convocatoria = {
  id: number;
  titulo: string;
  fecha: string;
  descripcion: string;
  enlace: string;
  activa: boolean;
  /** Fecha de baja lógica; `null` mientras el registro está vigente. */
  eliminadoAt?: string | null;
};

/** Un enlace del menú del encabezado. El orden del arreglo es el orden en pantalla. */
export type NavLink = {
  label: string;
  href: string;
};

export type SiteSettings = {
  nombre: string;
  tagline: string;
  headline: string[];
  email: string;
  telefono: string;
  telefonoHref: string;
  direccion: string;
  ciudad: string;
  facebook: string;
  instagram: string;
  x: string;
  /**
   * Ruta de la imagen del logo.
   *
   * `null` es lo que trae la base cuando no hay ninguna imagen, y `""` lo que
   * deja el formulario al quitar la vista previa. El tipo lo refleja: declarado
   * como `string` el compilador aceptaba `logoUrl.trim()` sobre un `null` que sí
   * llega de la API, y el guardado fallaba con
   * `Cannot read properties of null (reading 'trim')`.
   */
  logoUrl: string | null;
  logoTitulo: string;
  logoSubtitulo: string;
  navLinks: NavLink[];
  /**
   * El contenido de la portada: el hero y las secciones que van desde ahí hasta
   * antes del pie de página. Cada sección se edita en su módulo de Ajustes (Home,
   * El proyecto, Dimensiones, Documentos, Noticias, Participa, Contáctanos).
   *
   * Es un objeto y no texto suelto, así que hay que clonarlo al copiar el
   * `value` al formulario (igual que `navLinks`): sin clonar, el formulario y la
   * fila que vino de la API serían el mismo objeto y editar uno editaría el otro.
   */
  home: PortadaSettings;
};

/** Un bloque de titular y párrafo de la portada. */
export type SeccionPortada = {
  titulo: string;
  texto: string;
};

export type HeroPortada = {
  /**
   * Ruta de la imagen de fondo. `null` = la que trae el sitio.
   *
   * La API devuelve `null` (y no `""`) cuando en el panel se pulsa «Usar la del
   * sitio», porque es el valor que el backend sí escribe y el que el sitio lee
   * como respaldo. El formulario lo convierte a `""` al cargar
   * (`conImagenesEnCadena` en `AjustesPage`), de modo que aquí se declara
   * `string | null` para no mentir sobre lo que llega del servidor.
   */
  fondo: string | null;
  imagen: string | null;
  botonTexto: string;
  botonColor: ColorBoton;
  cajaTitulo: string;
  /**
   * El color del «Enviar» de esa caja.
   *
   * Es `ColorBotonSobreLima` y no `ColorBoton` porque la caja es lima: un botón
   * lima encima de una caja lima no se ve. La lista corta la fija el backend, no
   * el panel.
   */
  cajaBotonColor: ColorBotonSobreLima;
};

export type ProyectoPortada = SeccionPortada & {
  /** Como `HeroPortada.fondo`: `null` = la imagen que trae el sitio. */
  fondo: string | null;
  tarjetaBoton: string;
  /** El color del botón «Explorar más» de las tarjetas del carrusel. */
  botonColor: ColorBoton;
  dimsTitulo: string;
  dimsTexto: string;
  accionTitulo: string;
};

/**
 * La página «El proyecto» (`/proyecto`): el hero, los dos párrafos, las tres
 * etapas y las entidades aliadas.
 *
 * Vive en `home` como una sección más porque ahí viven las secciones editables
 * del sitio; el módulo «El proyecto» del panel la edita con el mismo guardado
 * que el resto. `titulo` aquí **sí** se edita, a diferencia de los rótulos de
 * la portada: es el titular de la página, no parte del diseño fijo.
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
 * El bloque de documentos, con el color de su botón «Ver más».
 *
 * Antes era un `SeccionPortada` pelado. Al darle color necesita tipo propio: si
 * se dejara como `SeccionPortada`, el campo del color no estaría declarado y el
 * formulario lo perdería al guardar.
 */
export type DocumentosPortada = SeccionPortada & {
  botonColor: ColorBoton;
};

export type NoticiasPortada = SeccionPortada & {
  botonTexto: string;
  /** El color del botón «Ver todas». */
  botonColor: ColorBoton;
  /**
   * El color del «Ver más» de cada tarjeta.
   *
   * Va aparte del de «Ver todas» porque los dos botones no se parecen: el
   * primero es un botón de la página y el segundo va **encima** de la foto de la
   * noticia. Con uno solo habría que elegir cuál de los dos se entera del color.
   */
  tarjetaBotonColor: ColorBoton;
};

export type ContactoPortada = SeccionPortada & {
  formTitulo: string;
  /** El color del botón del teléfono, que es un enlace `tel:` y no un "enviar". */
  botonColor: ColorBoton;
  /** El color del botón «Enviar» del formulario. */
  enviarColor: ColorBoton;
};

/**
 * El pie de página: la única columna de enlaces que se elige desde el panel.
 *
 * La lista es de máximo seis porque así es como pinta el pie la columna de las
 * tarjetas de «El proyecto», y se elige de las páginas que ya existen en
 * Configuración → Proyecto, no escribiéndola a mano: un href mal escrito no da
 * ningún error hasta que alguien pulsa y no llega a ninguna parte.
 */
export type FooterPortada = {
  enlaces: NavLink[];
};

export type PortadaSettings = {
  hero: HeroPortada;
  proyecto: ProyectoPortada;
  elProyecto: ElProyectoPortada;
  cobertura: SeccionPortada;
  documentos: DocumentosPortada;
  noticias: NoticiasPortada;
  contacto: ContactoPortada;
  footer: FooterPortada;
};

export type Stat = {
  id: number;
  value: string;
  label: string;
  subtext: string;
  /** Fecha de baja lógica; `null` mientras el registro está vigente. */
  eliminadoAt?: string | null;
};

/**
 * Uno de los doce municipios del departamento. `dato` es la línea corta y
 * `descripcion` el párrafo; los dos son opcionales, y solo `nombre` es
 * obligatorio. La lista completa la da `GET /api/site`.
 */
export type Municipio = {
  id: number;
  nombre: string;
  dato?: string | null;
  descripcion?: string | null;
  eliminadoAt?: string | null;
};

export type Taller = {
  id: number;
  date: string;
  title: string;
  place: string;
  status: string;
  /** Fecha de baja lógica; `null` mientras el registro está vigente. */
  eliminadoAt?: string | null;
};

export type DocCategoria = {
  id: number;
  slug: string;
  title: string;
  description: string;
  icon: string;
  /** Fecha de baja lógica; `null` mientras el registro está vigente. */
  eliminadoAt?: string | null;
};

export type PaginaProyecto = {
  id: number;
  slug: string;
  title: string;
  kicker: string;
  image: string;
  excerpt: string;
  lead: string;
  body: string[];
  /** Fecha de baja lógica; `null` mientras el registro está vigente. */
  eliminadoAt?: string | null;
};

export type ChartSeries = {
  name: string;
  color: string;
  data: { year: string; value: number }[];
};

export type Dimension = {
  id: number;
  slug: string;
  title: string;
  short: string;
  /** 'dimension' = una de las 4 dimensiones oficiales. 'bloque' = apoyo. */
  tipo: "dimension" | "bloque";
  icon: string;
  summary: string;
  body: string[];
  layers: string[];
  steps: { n: string; title: string }[];
  charts: ChartSeries[];
  /** Fecha de baja lógica; `null` mientras el registro está vigente. */
  eliminadoAt?: string | null;
};

/** Origen del mensaje. Los cuatro públicos los produce el backend en /api/forms. */
export const TIPOS_MENSAJE = ["contacto", "inscripciones", "boletin", "sugerencias"] as const;

export type TipoMensaje = (typeof TIPOS_MENSAJE)[number];

export const ETIQUETAS_TIPO: Record<TipoMensaje | "todos", string> = {
  todos: "Todos",
  contacto: "Contacto",
  inscripciones: "Inscripciones",
  boletin: "Boletín",
  sugerencias: "Sugerencias",
};

export type Mensaje = {
  id: number;
  nombre: string;
  /**
   * Canal para devolver una respuesta. Es `null` cuando la persona no lo dejó:
   * la caja del hero es anónima, así que es lo más común en las sugerencias.
   * Antes venía siempre relleno con `anonimo@prospectiva.local`, una dirección
   * inventada que se veía en la bandeja como si fuera real.
   */
  email: string | null;
  asunto: string;
  mensaje: string;
  tipo: string;
  fecha: string;
  leido: boolean;
  /**
   * El titular marcó la casilla de autorización del Aviso de Privacidad.
   * `false` en los mensajes anteriores a la migración 0006: se recogieron
   * cuando todavía no existía el aviso, y no hay que fingir una autorización.
   */
  consentimiento?: boolean;
  /** En qué punto del ciclo de atención está. Ver `ESTADO_MENSAJE`. */
  estado?: EstadoMensaje;
  /** Anotación interna de qué se hizo con el mensaje. No es una respuesta enviada. */
  seguimiento?: string | null;
};

/**
 * Ciclo de atención de un mensaje, en el orden en que se avanza. Es el mismo
 * listado que valida el backend (`ESTADO_MENSAJE` en `backend/src/common/dto.ts`):
 * si se agrega un valor aquí, hay que agregarlo allá también.
 */
export const ESTADO_MENSAJE = ["nuevo", "en_revision", "respondido", "archivado"] as const;

export type EstadoMensaje = (typeof ESTADO_MENSAJE)[number];

export const ETIQUETAS_ESTADO: Record<EstadoMensaje, string> = {
  nuevo: "Nuevo",
  en_revision: "En revisión",
  respondido: "Respondido",
  archivado: "Archivado",
};

/** Filtros de la barra de estados. `sin_responder` agrupa lo que sigue abierto. */
export const FILTROS_ESTADO = [
  { value: "todos", label: "Todos" },
  { value: "sin_responder", label: "Sin responder" },
  { value: "nuevo", label: "Nuevos" },
  { value: "en_revision", label: "En revisión" },
  { value: "respondido", label: "Respondidos" },
  { value: "archivado", label: "Archivados" },
] as const;

export type FiltroEstado = (typeof FILTROS_ESTADO)[number]["value"];

/**
 * `sin_responder` no es un estado guardado sino una consulta: es todo lo que
 * todavía no está en `respondido` ni en `archivado`, o sea lo que sigue abierto.
 */
export function pasaFiltroEstado(estado: EstadoMensaje, filtro: FiltroEstado): boolean {
  if (filtro === "todos") return true;
  if (filtro === "sin_responder") return estado !== "respondido" && estado !== "archivado";
  return estado === filtro;
}

export const TIPOS_DOCUMENTO = [
  "proyecto",
  "informes",
  "memorias",
  "boletines",
  "presentaciones",
  "publicaciones",
] as const;

export const CATEGORIAS_NOTICIA = [
  "Noticias y Comunicados",
  "Talleres y Eventos",
  "Convocatorias Abiertas",
  // Categorías que usa el Excel oficial de noticias (docs/doc/2-NOTICIAS).
  "Institucional",
  "Diagnóstico",
  "Socialización",
  "Avances",
  "Misión CEPAL",
  "Participación",
  "Participación Ciudadana",
  "Municipios",
  "Consulta Ciudadana",
] as const;

export const ICONOS_DIMENSION = [
  "target",
  "chart",
  "leaf",
  "users",
  "trophy",
  "alert",
  "folder",
  "file",
] as const;

export const ICONOS_CATEGORIA = [
  "file",
  "chart",
  "scroll",
  "news",
  "presentation",
  "book",
] as const;

export const FORMATOS = ["PDF", "DOCX", "XLSX", "PPTX", "Enlace"] as const;

export const STATUS_TALLER = ["Realizado", "Abierto", "Próximo", "Suspendido"] as const;

export type Role = "admin" | "editor";

export type User = {
  id: number;
  email: string;
  role: Role;
  createdAt: string;
};

export type Media = {
  id: number;
  filename: string;
  url: string;
  mime: string;
  size: number;
  createdAt: string;
};