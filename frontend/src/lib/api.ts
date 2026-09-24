export type ApiNoticia = {
  id: number;
  slug: string;
  titulo: string;
  fecha: string | Date;
  categoria: string;
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
  link: string | null;
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
  date: string;
  image: string;
  overlay?: "convoca";
  excerpt: string;
  body: string[];
};

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export function formatFecha(iso: string | Date | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

export function noticiaImage(n: {
  imagen: string | null;
  categoria?: string;
  slug?: string;
}): string {
  const img = n.imagen;
  if (img && (img.startsWith("/") || img.startsWith("http"))) return img;
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
    date: formatFecha(n.fecha),
    image: noticiaImage({ imagen: n.imagen, categoria: cat, slug: n.slug }),
    overlay: cat.toLowerCase().includes("convocat") ? "convoca" : undefined,
    excerpt: n.resumen,
    body,
  };
}

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:3000";

async function parse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`API ${res.url} respondió ${res.status}`);
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
    `/api/noticias?${p.toString()}`
  );
}

export async function fetchNoticia(slug: string) {
  return get<ApiNoticia>(`/api/noticias/${encodeURIComponent(slug)}`);
}

export async function fetchDocumentos(params?: { tipo?: string; delimitacion?: string }) {
  const p = new URLSearchParams();
  if (params?.tipo) p.set("tipo", params.tipo);
  if (params?.delimitacion) p.set("delimitacion", params.delimitacion);
  return get<{ data: ApiDocumento[] }>(`/api/documentos?${p.toString()}`);
}

export async function fetchConvocatorias() {
  return get<ApiConvocatoria[]>("/api/convocatorias");
}
