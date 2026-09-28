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
};

export type Stat = {
  id: number;
  value: string;
  label: string;
  subtext: string;
  /** Fecha de baja lógica; `null` mientras el registro está vigente. */
  eliminadoAt?: string | null;
};

export type Entidad = {
  id: number;
  nombre: string;
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
  email: string;
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
};

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