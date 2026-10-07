/**
 * Cliente del repositorio: tipos, paleta por dimensión y llamadas a la API.
 *
 * Todo pasa por /api/repositorio (público): el listado filtrar lo sirve el
 * backend, así que el catálogo no descarga los 392 ítems de una vez.
 */

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
};

/** Un grupo de una agregación (filtro o gráfica). */
export type Grupo = {
  clave: string | number | null;
  etiqueta?: string | null;
  count: number;
};

export type Estadisticas = {
  total: number;
  conEnlace: number;
  sinEnlace: number;
  porDimension: Grupo[];
  porTipo: Grupo[];
  porDelimitacion: Grupo[];
  porFormato: Grupo[];
  porAnio: Grupo[];
  topAutores: Grupo[];
};

export type Facetas = {
  dimensiones: Grupo[];
  tipos: Grupo[];
  delimitaciones: Grupo[];
  formatos: Grupo[];
  anios: Grupo[];
};

export type Paginated<T> = {
  data: T[];
  meta: { total: number; page: number; perPage: number };
};

export type Orden = "codigo" | "recientes" | "antiguos" | "titulo";

export type RepositorioParams = {
  page?: number;
  perPage?: number;
  dimension?: string;
  tipo?: string;
  delimitacion?: string;
  formato?: string;
  anio?: string;
  desde?: string;
  hasta?: string;
  q?: string;
  orden?: Orden;
};

/**
 * Las 4 dimensiones del proceso (slug → título, color neón). Es la única
 * paleta de color del repositorio: los gráficos del dashboard, los puntos del
 * catálogo y la ficha usan estos mismos colores.
 */
export const DIMENSIONES: { slug: string; title: string; short: string; color: string }[] = [
  { slug: "fisico-ambiental", title: "Dimensión Físico-ambiental", short: "Físico-ambiental", color: "#34d399" },
  { slug: "economica-productiva", title: "Dimensión Económico-productivo", short: "Económico-productivo", color: "#fbbf24" },
  { slug: "politico-institucional", title: "Dimensión Político-institucional", short: "Político-institucional", color: "#60a5fa" },
  { slug: "socio-cultural", title: "Dimensión Socio-cultural", short: "Socio-cultural", color: "#f472b6" },
];

const DIM_MAP = new Map(DIMENSIONES.map((d) => [d.slug, d]));

export function dimColor(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return DIM_MAP.get(slug)?.color ?? null;
}

export function dimTitle(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return DIM_MAP.get(slug)?.short ?? null;
}

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:3000";

async function get<T>(path: string): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error(`API respondió ${res.status}`);
    return res.json() as Promise<T>;
  } catch {
    // El fetch puede fallar por red, no solo por HTTP. Ambos caen aquí para
    // que las páginas puedan mostrar su estado de error sin duplicar lógica.
    throw new Error("No se pudo conectar con el repositorio");
  }
}

export async function fetchRepositorio(params: RepositorioParams = {}) {
  const p = new URLSearchParams();
  p.set("page", String(params.page ?? 1));
  p.set("perPage", String(params.perPage ?? 30));
  if (params.dimension) p.set("dimension", params.dimension);
  if (params.tipo) p.set("tipo", params.tipo);
  if (params.delimitacion) p.set("delimitacion", params.delimitacion);
  if (params.formato) p.set("formato", params.formato);
  if (params.anio) p.set("anio", params.anio);
  if (params.desde) p.set("desde", params.desde);
  if (params.hasta) p.set("hasta", params.hasta);
  if (params.q) p.set("q", params.q);
  if (params.orden) p.set("orden", params.orden);
  return get<Paginated<RepositorioItem>>(`/api/repositorio?${p.toString()}`);
}

export async function fetchRepositorioItem(id: number | string) {
  return get<RepositorioItem>(`/api/repositorio/${id}`);
}

export async function fetchRepositorioEstadisticas() {
  return get<Estadisticas>("/api/repositorio/estadisticas");
}

export async function fetchRepositorioFacetas() {
  return get<Facetas>("/api/repositorio/facetas");
}