export type ApiNoticia = {
  id: number;
  slug: string;
  titulo: string;
  fecha: string | Date;
  categoria: string;
  autor?: string | null;
  imagen: string | null;
  resumen: string;
  contenido: string[] | string;
  etiquetas?: string[];
  publicado?: boolean;
  destacado?: boolean;
};

export type ApiDocumento = {
  id: number;
  titulo: string;
  autor: string;
  fecha: string | Date;
  tipo: string;
  delimitacion: string;
  formato: string;
  /** URL externa. */
  link: string | null;
  /** URL del archivo subido a la galería; tiene prioridad sobre `link`. */
  archivo: string | null;
};

export type ApiConvocatoria = {
  id: number;
  titulo: string;
  fecha: string | Date | null;
  descripcion: string | null;
  enlace: string | null;
  activa?: boolean;
};

export type NewsItem = {
  slug: string;
  title: string;
  category: string;
  author?: string;
  date: string;
  image: string;
  overlay?: "convoca";
  excerpt: string;
  body: string[];
};

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/**
 * Formatea una fecha de la base para mostrarla en el sitio.
 *
 * Lo que importa es cómo se arma el `Date`. Una cadena de solo día
 * (`"2026-09-29"`, que es lo que devuelve una columna `date`) la interpreta
 * `new Date()` como **medianoche UTC**, y al leerla con `getDate()` en la zona
 * del navegador —en Colombia, UTC-5— esa medianoche ya es el día anterior: todo
 * el contenido salía fechado un día antes del que le tocaba. La columna es un
 * día del calendario, no un instante, así que se arma en hora local.
 *
 * Las cadenas con hora (ISO completo) se dejan como están: ahí sí importa el
 * instante.
 */
export function formatFecha(iso: string | Date | null): string {
  if (!iso) return "";
  const soloDia = typeof iso === "string" && /^\d{4}-\d{2}-\d{2}$/.test(iso);
  const d = soloDia ? new Date(`${iso}T00:00:00`) : new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

export function noticiaImage(n: {
  imagen: string | null;
  categoria?: string;
  slug?: string;
}): string {
  const img = n.imagen;
  // Solo hay imagen real si viene una ruta; si no, se reparte una de las cuatro
  // fotos genéricas según la categoría. `resolveUrl` convierte la ruta relativa
  // que guarda la base en algo que el navegador pueda pedir.
  if (img && (img.startsWith("/") || img.startsWith("http"))) return resolveUrl(img);
  const cat = (n.categoria ?? "").toLowerCase();
  const slug = (n.slug ?? "").toLowerCase();
  if (cat.includes("convocat") || slug.includes("convocat")) {
    return "/images/news-convocatoria.jpg";
  }
  if (cat.includes("taller") || cat.includes("evento") || cat.includes("participa")) {
    return "/images/news-eventos.jpg";
  }
  if (cat.includes("municip") || cat.includes("ambient") || cat.includes("paisaje")) {
    return "/images/news-paisaje.jpg";
  }
  return "/images/news-ciudad.jpg";
}

export function toNewsItem(n: ApiNoticia): NewsItem {
  const cat = n.categoria ?? "";
  const body = Array.isArray(n.contenido)
    ? n.contenido
    : n.contenido
      ? String(n.contenido).split(/\n+/)
      : [];
  return {
    slug: n.slug,
    title: n.titulo,
    category: cat,
    author: n.autor || undefined,
    date: formatFecha(n.fecha),
    image: noticiaImage({ imagen: n.imagen, categoria: cat, slug: n.slug }),
    overlay: cat.toLowerCase().includes("convocat") ? "convoca" : undefined,
    excerpt: n.resumen,
    body,
  };
}

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:3000";

/**
 * Convierte la ruta que guarda la base de datos en una URL que el navegador
 * pueda pedir.
 *
 * Desde la migración 0006, `media.url` y `noticia.imagen` guardan `/uploads/<archivo>`
 * en vez de `http://host/api/uploads/<archivo>`. La razón: la URL absoluta ataba
 * cada imagen al host por el que se había subido, así que cambiar de dominio o
 * de protocolo obligaba a reescribir las filas una por una.
 *
 * Hay tres casos, y los tres hacen falta:
 *  - `http(s)://…` → es una URL externa o una fila vieja: se deja tal cual.
 *  - `/uploads/…`  → se le añade el `/api` del servidor, porque `API_BASE` es la
 *                    raíz del backend y los archivos se sirven en
 *                    `/api/uploads`. Desde fuera siempre se ve un único `/api`
 *                    (Traefik hace passthrough), así que la URL resuelta es
 *                    `${API_BASE}/api/uploads/…`.
 *  - cualquier otra ruta (`/images/hero.jpg`) → es un asset del propio sitio y se
 *    sirve desde el dominio del frontend, sin tocar.
 */
export function resolveUrl(path: string | null | undefined): string {
  const p = (path ?? "").trim();
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  if (p.startsWith("/uploads/") || p.startsWith("/api/uploads/")) {
    const relativa = p.startsWith("/api/") ? p.slice(4) : p;
    return `${API_BASE}/api${relativa}`;
  }
  return p;
}

export class ApiError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(status: number, url: string) {
    super(`API ${url} respondió ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
  }
}

async function parse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new ApiError(res.status, res.url);
  }
  return res.json() as Promise<T>;
}

async function get<T>(path: string): Promise<T> {
  return parse<T>(
    await fetch(`${API_BASE}${path}`, { headers: { accept: "application/json" } })
  );
}

export async function fetchNoticias(params?: {
  categoria?: string;
  q?: string;
  page?: number;
  perPage?: number;
}) {
  const p = new URLSearchParams();
  if (params?.categoria) p.set("categoria", params.categoria);
  if (params?.q) p.set("q", params.q);
  p.set("page", String(params?.page ?? 1));
  p.set("perPage", String(params?.perPage ?? 20));
  return get<{ data: ApiNoticia[]; meta: { total: number; page: number; perPage: number } }>(
    `/noticias?${p.toString()}`
  );
}

export async function fetchNoticia(slug: string) {
  return get<ApiNoticia>(`/noticias/${encodeURIComponent(slug)}`);
}

export async function fetchDocumentos(params?: { tipo?: string; delimitacion?: string }) {
  const p = new URLSearchParams();
  if (params?.tipo) p.set("tipo", params.tipo);
  if (params?.delimitacion) p.set("delimitacion", params.delimitacion);
  return get<{ data: ApiDocumento[] }>(`/documentos?${p.toString()}`);
}

export async function fetchConvocatorias() {
  return get<ApiConvocatoria[]>(`/convocatorias`);
}

/**
 * Un documento puede estar publicado de dos formas: subido a la galería
 * (`archivo`) o enlazado a una URL externa (`link`). Antes la vista solo miraba
 * `link`, así que todo lo subido a la galería salía como "no publicado".
 */
export function documentoUrl(doc: Pick<ApiDocumento, "link" | "archivo">): string | null {
  // `archivo` viene de la galería y es una ruta relativa; `link` es una URL
  // externa. `resolveUrl` solo toca la primera y deja la segunda intacta.
  return resolveUrl(doc.archivo) || doc.link?.trim() || null;
}

// ── Repositorio de información ──────────────────────────────────────────────
// La portada consume un solo endpoint público del repositorio
// (`/api/repositorio/estadisticas`): así las mini-gráficas de las 4 dimensiones
// dicen exactamente lo mismo que el dashboard de /repo, con la misma fuente.

export type ApiRepositorioGrupo = {
  clave: string | number | null;
  etiqueta?: string | null;
  count: number;
};

export type ApiRepositorioStats = {
  total: number;
  conEnlace: number;
  sinEnlace: number;
  porDimension: ApiRepositorioGrupo[];
  porTipo: ApiRepositorioGrupo[];
  porDelimitacion: ApiRepositorioGrupo[];
  porFormato: ApiRepositorioGrupo[];
  porAnio: ApiRepositorioGrupo[];
  topAutores: ApiRepositorioGrupo[];
};

export async function fetchRepositorioEstadisticas() {
  return get<ApiRepositorioStats>("/api/repositorio/estadisticas");
}
