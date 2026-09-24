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