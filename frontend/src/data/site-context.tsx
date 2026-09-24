import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { formatFecha } from "@/lib/api";
import {
  DIMENSIONS as FALLBACK_DIMENSIONS,
  DOC_CATEGORIES as FALLBACK_CATEGORIES,
  ENTITIES as FALLBACK_ENTITIES,
  PROJECT_PAGES as FALLBACK_PAGES,
  SITE as FALLBACK_SITE,
  STATS as FALLBACK_STATS,
  WORKSHOPS as FALLBACK_WORKSHOPS,
  type Dimension,
  type DocCategory,
  type ProjectPage,
  type SearchHit,
} from "./site";

type RawSiteConfig = {
  nombre: string;
  tagline: string;
  headline: string[];
  email: string;
  telefono: string;
  telefonoHref: string;
  direccion: string;
  ciudad: string;
  facebook: string | null;
  instagram: string | null;
  x: string | null;
};

type RawStat = { value: string; label: string; subtext: string | null };
type RawTaller = { date: string; title: string; place: string; status: string };
type RawCategoria = { slug: string; title: string; description: string; icon: string };
type RawPagina = ProjectPage;
type RawDimension = Dimension;

type RawSite = {
  site: RawSiteConfig | null;
  stats: RawStat[];
  entidades: { nombre: string }[];
  talleres: RawTaller[];
  categorias: RawCategoria[];
  paginas: RawPagina[];
  dimensiones: RawDimension[];
};

type SiteShape = {
  name: string;
  tagline: string;
  headline: string[];
  email: string;
  phone: string;
  phoneHref: string;
  address: string;
  city: string;
  social: { facebook: string; instagram: string; x: string };
};

type Stat = { value: string; label: string; subtext: string };
type Workshop = { date: string; title: string; place: string; status: string };

function mapSite(raw: RawSiteConfig): SiteShape {
  return {
    name: raw.nombre,
    tagline: raw.tagline,
    headline: Array.isArray(raw.headline) && raw.headline.length ? raw.headline : FALLBACK_SITE.headline,
    email: raw.email,
    phone: raw.telefono,
    phoneHref: raw.telefonoHref,
    address: raw.direccion,
    city: raw.ciudad,
    social: {
      facebook: raw.facebook || FALLBACK_SITE.social.facebook,
      instagram: raw.instagram || FALLBACK_SITE.social.instagram,
      x: raw.x || FALLBACK_SITE.social.x,
    },
  };
}

function pickStats(stats: RawStat[]): Stat[] {
  return stats.length
    ? stats.map((s) => ({ value: s.value, label: s.label, subtext: s.subtext ?? "" }))
    : (FALLBACK_STATS as unknown as Stat[]);
}

function pickWorkshops(talleres: RawTaller[]): Workshop[] {
  if (!talleres.length) return FALLBACK_WORKSHOPS as unknown as Workshop[];
  return talleres.map((t) => ({ date: formatFecha(t.date), title: t.title, place: t.place, status: t.status }));
}

function pickCategorias(categorias: RawCategoria[]): DocCategory[] {
  if (!categorias.length) return FALLBACK_CATEGORIES;
  return categorias.map((c) => ({
    slug: c.slug,
    title: c.title,
    description: c.description,
    icon: c.icon as DocCategory["icon"],
  }));
}

function pickPaginas(paginas: RawPagina[]): ProjectPage[] {
  if (!paginas.length) return FALLBACK_PAGES;
  return paginas.map((p) => ({ ...p, image: p.image || "/images/hero-city.jpg" }));
}

function pickDimensiones(dimensiones: RawDimension[]): Dimension[] {
  if (!dimensiones.length) return FALLBACK_DIMENSIONS;
  return dimensiones.map((d) => ({ ...d, short: d.short || d.title }));
}

type SiteBundle = {
  SITE: SiteShape;
  STATS: Stat[];
  ENTITIES: string[];
  PROJECT_PAGES: ProjectPage[];
  DIMENSIONS: Dimension[];
  DOC_CATEGORIES: DocCategory[];
  WORKSHOPS: Workshop[];
  getProject: (slug: string) => ProjectPage | undefined;
  getDimension: (slug: string) => Dimension | undefined;
  searchSite: (query: string) => SearchHit[];
};

function fallbackBundle(): SiteBundle {
  return {
    SITE: FALLBACK_SITE,
    STATS: FALLBACK_STATS as unknown as Stat[],
    ENTITIES: FALLBACK_ENTITIES,
    PROJECT_PAGES: FALLBACK_PAGES,
    DIMENSIONS: FALLBACK_DIMENSIONS,
    DOC_CATEGORIES: FALLBACK_CATEGORIES,
    WORKSHOPS: FALLBACK_WORKSHOPS as unknown as Workshop[],
    getProject: (slug) => FALLBACK_PAGES.find((p) => p.slug === slug),
    getDimension: (slug) => FALLBACK_DIMENSIONS.find((d) => d.slug === slug),
    searchSite: () => [],
  };
}

function buildBundle(raw: RawSite | null): SiteBundle {
  if (!raw || !raw.site) return fallbackBundle();

  const entities = raw.entidades.length ? raw.entidades.map((e) => e.nombre) : FALLBACK_ENTITIES;
  const pages = pickPaginas(raw.paginas);
  const dims = pickDimensiones(raw.dimensiones);
  const cats = pickCategorias(raw.categorias);
  const workshops = pickWorkshops(raw.talleres);

  return {
    SITE: mapSite(raw.site),
    STATS: pickStats(raw.stats),
    ENTITIES: entities,
    PROJECT_PAGES: pages,
    DIMENSIONS: dims,
    DOC_CATEGORIES: cats,
    WORKSHOPS: workshops,
    getProject: (slug) => pages.find((p) => p.slug === slug),
    getDimension: (slug) => dims.find((d) => d.slug === slug),
    searchSite: (query) => {
      const q = query.trim().toLowerCase();
      if (q.length < 2) return [];
      const hits: SearchHit[] = [];
      for (const p of pages) {
        if (`${p.title} ${p.excerpt} ${p.lead}`.toLowerCase().includes(q)) {
          hits.push({ href: `/proyecto/${p.slug}`, title: p.title, kind: "Proyecto", excerpt: p.excerpt });
        }
      }
      for (const d of dims) {
        if (`${d.title} ${d.summary}`.toLowerCase().includes(q)) {
          hits.push({ href: `/dimensiones/${d.slug}`, title: d.title, kind: "Dimensión", excerpt: d.summary });
        }
      }
      for (const cat of cats) {
        if (`${cat.title} ${cat.description}`.toLowerCase().includes(q)) {
          hits.push({ href: `/documentos/${cat.slug}`, title: cat.title, kind: "Documentos", excerpt: cat.description });
        }
      }
      for (const w of workshops) {
        if (`${w.title} ${w.place}`.toLowerCase().includes(q)) {
          hits.push({ href: "/participa", title: w.title, kind: "Taller", excerpt: `${w.date} · ${w.place}` });
        }
      }
      return hits.slice(0, 12);
    },
  };
}

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:3000";
const initial = fallbackBundle();
const SiteContext = createContext<SiteBundle>(initial);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [bundle, setBundle] = useState<SiteBundle>(initial);

  useEffect(() => {
    let alive = true;
    fetch(`${API_BASE}/api/site`, { headers: { accept: "application/json" } })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((raw) => {
        if (alive) setBundle(buildBundle(raw as RawSite));
      })
      .catch(() => {
        if (alive) setBundle(fallbackBundle());
      });
    return () => {
      alive = false;
    };
  }, []);

  return <SiteContext.Provider value={bundle}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteBundle {
  return useContext(SiteContext);
}