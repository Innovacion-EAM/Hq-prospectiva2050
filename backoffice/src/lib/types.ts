export type Noticia = {
  id: number;
  slug: string;
  titulo: string;
  fecha: string;
  categoria: string;
  imagen: string;
  resumen: string;
  contenido: string[];
  etiquetas: string[];
  publicado: boolean;
  destacado: boolean;
  publicadoEn?: string | null;
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
};

export type Convocatoria = {
  id: number;
  titulo: string;
  fecha: string;
  descripcion: string;
  enlace: string;
  activa: boolean;
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
};

export type Entidad = {
  id: number;
  nombre: string;
};

export type Taller = {
  id: number;
  date: string;
  title: string;
  place: string;
  status: string;
};

export type DocCategoria = {
  id: number;
  slug: string;
  title: string;
  description: string;
  icon: string;
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
  icon: string;
  summary: string;
  body: string[];
  layers: string[];
  steps: { n: string; title: string }[];
  charts: ChartSeries[];
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

export const TIPOS_MENSAJE = ["contacto", "inscripciones"] as const;

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

// ── Repositorio de información ──────────────────────────────────────────────
// La cuarta app (/repo) cataloga los 297 documentos de referencia. Esta tabla es
// independiente de `Documento` (las piezas del sitio principal): otra colección,
// otra semilla, otros colores. La dimensión guarda el slug de `config_dimensiones`
// y `codigo` es el "No." original del Excel, único.

export type RepositorioItem = {
  id: number;
  codigo: number;
  titulo: string;
  autor: string | null;
  anio: number | null;
  tipo: string;
  delimitacion: string | null;
  formato: string;
  dimension: string | null;
  link: string | null;
  resumen: string | null;
  publicado: boolean;
  publicadoEn: string | null;
  creadoEn: string | null;
  actualizadoEn: string | null;
};

export type RepositorioGrupo = {
  clave: string | number | null;
  etiqueta?: string | null;
  count: number;
};

export type RepositorioStats = {
  total: number;
  conEnlace: number;
  sinEnlace: number;
  porDimension: RepositorioGrupo[];
  porTipo: RepositorioGrupo[];
  porDelimitacion: RepositorioGrupo[];
  porFormato: RepositorioGrupo[];
  porAnio: RepositorioGrupo[];
  topAutores: RepositorioGrupo[];
};

export type RepositorioFacetas = {
  dimensiones: RepositorioGrupo[];
  tipos: RepositorioGrupo[];
  delimitaciones: RepositorioGrupo[];
  formatos: RepositorioGrupo[];
  anios: RepositorioGrupo[];
};

export type ImportarResultado = {
  creados: number;
  actualizados: number;
  errores: { fila: number; motivo: string }[];
};

/** Las 4 dimensiones del proceso con su color del dashboard de /repo. */
export const DIMENSIONES_REPO = [
  { slug: "fisico-ambiental", title: "Físico-ambiental", color: "#34d399" },
  { slug: "economica-productiva", title: "Económico-productivo", color: "#fbbf24" },
  { slug: "politico-institucional", title: "Político-institucional", color: "#60a5fa" },
  { slug: "socio-cultural", title: "Socio-cultural", color: "#f472b6" },
] as const;

export function dimRepoColor(slug: string | null): string | null {
  if (!slug) return null;
  return DIMENSIONES_REPO.find((d) => d.slug === slug)?.color ?? null;
}

/** Los 17 tipos del inventario original (columna "Tipo de documento"). */
export const TIPOS_REPO = [
  "Informe General o de Gestión",
  "Artículo Científico o Revista",
  "Investigación Académica / Tesis",
  "Plan de Desarrollo o Plan Estratégico",
  "Acuerdo",
  "Política Pública",
  "Base de Datos",
  "Guía Metodológica o Técnica",
  "Consultoría",
  "Plan Maestro",
  "Cartografía SIG",
  "Plan de Gestión",
  "Decreto",
  "Normatividad Técnica",
  "Ley Nacional",
  "Resolución",
  "Libro",
] as const;

export const FORMATOS_REPO = ["PDF", "Excel", "Dirección web", "Power Point"] as const;