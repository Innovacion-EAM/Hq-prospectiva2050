import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { formatFecha, resolveUrl } from "@/lib/api";
import { toArray, toStringArray } from "@/lib/normalize";
import { MUNICIPIOS_QUINDIO } from "./municipios";
import {
  COLORES_BOTON,
  COLORES_BOTON_SOBRE_LIMA,
  DIMENSIONS as FALLBACK_DIMENSIONS,
  DOC_CATEGORIES as FALLBACK_CATEGORIES,
  FOOTER_COLS as FALLBACK_FOOTER_COLS,
  LOGO as FALLBACK_LOGO,
  NAV as FALLBACK_NAV,
  PORTADA as FALLBACK_PORTADA,
  PROJECT_PAGES as FALLBACK_PAGES,
  SITE as FALLBACK_SITE,
  STATS as FALLBACK_STATS,
  WORKSHOPS as FALLBACK_WORKSHOPS,
  type ColorBoton,
  type ColorBotonSobreLima,
  type Dimension,
  type DocCategory,
  type Portada,
  type ProjectPage,
  type SearchHit,
} from "./site";

/** Un enlace del encabezado, tal y como llega de la base. */
export type NavLink = { label: string; href: string };

/** Identidad del encabezado: la marca y los textos que van al lado. */
export type LogoShape = {
  /** Ruta de la imagen subida, ya resuelta a una URL que el navegador pueda pedir. */
  url: string;
  titulo: string;
  subtitulo: string;
};

type RawSiteConfig = {
  nombre: string;
  tagline: string;
  headline: unknown;
  email: string;
  telefono: string;
  telefonoHref: string;
  direccion: string;
  ciudad: string;
  facebook: string | null;
  instagram: string | null;
  x: string | null;
  logoUrl: string | null;
  logoTitulo?: string | null;
  logoSubtitulo?: string | null;
  navLinks?: unknown;
  home?: unknown;
};

type RawStat = { value: string; label: string; subtext: string | null };
type RawTaller = { date: string; title: string; place: string; status: string };
type RawCategoria = { slug: string; title: string; description: string; icon: string };
type RawPagina = ProjectPage;
type RawDimension = Dimension;

type RawMunicipio = { nombre: string; dato?: string | null; descripcion?: string | null };

type RawSite = {
  site: RawSiteConfig | null;
  stats?: RawStat[];
  municipios?: RawMunicipio[];
  talleres?: RawTaller[];
  categorias?: RawCategoria[];
  paginas?: RawPagina[];
  dimensiones?: RawDimension[];
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

/** Un municipio tal y como lo muestra el sitio. */
export type Municipio = {
  nombre: string;
  dato: string;
  descripcion: string;
};

function mapSite(raw: RawSiteConfig): SiteShape {
  // El titular del hero son varias líneas, cada una con su color (la última es
  // lima), y antes se ignoraba lo que viniera de la API a propósito: era un
  // rótulo fijo. Ahora sí se edita —en Ajustes → Home, una línea por renglón—,
  // así que se lee del dato y solo se cae al del sitio cuando no hay nada
  // guardado. El criterio es el mismo que con el resto de la portada: vacío
  // significa "usa el texto del sitio", nunca "sin titular".
  const lineas = Array.isArray(raw.headline)
    ? raw.headline.map((l) => String(l ?? "").trim()).filter(Boolean)
    : [];

  return {
    name: raw.nombre,
    tagline: raw.tagline,
    headline: lineas.length ? lineas : [...FALLBACK_SITE.headline],
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

/**
 * Enlaces del encabezado, con el orden guardado.
 *
 * Si la lista llega vacía se usan los de respaldo en vez de mostrar una barra sin
 * nada. Es a propósito: una lista vacía casi siempre es un dato que se vació por
 * error, y un sitio sin menú es mucho peor que uno con el menú de siempre. Quien
 * quiera quitar todos los enlaces puede, pero entonces conviene que lo vea
 * desde el backoffice, no descubrirlo en la portada.
 */
function pickNav(raw: RawSiteConfig): NavLink[] {
  const lista = toArray(raw.navLinks, (n) => {
    const item = (n ?? {}) as { label?: unknown; href?: unknown };
    const label = String(item.label ?? "").trim();
    const href = String(item.href ?? "").trim();
    // Un enlace sin texto o sin dirección no es un enlace: sin texto no se ve y
    // sin dirección el clic no lleva a ninguna parte.
    return href && label ? { label, href } : null;
  }).filter((n): n is NavLink => n !== null);

  return lista.length ? lista : [...FALLBACK_NAV];
}

/**
 * Las columnas del pie de página.
 *
 * Tres de las cuatro son fijas y salen del código (`FOOTER_COLS`): el menú del
 * sitio, las dimensiones y el aviso legal son el temario del sitio entero y no
 * cambian según quien administre. La segunda —las tarjetas de «El proyecto»— sí
 * se elige desde **Ajustes → Footer**, con un tope de seis, y es la única que
 * se lee del dato.
 *
 * Una lista vacía vuelve a las seis del respaldo por el mismo motivo que con el
 * menú: casi siempre es un dato que se vació por error, y un pie sin enlaces es
 * mucho peor que uno con los de siempre. Quien quiera quitar todas puede, pero
 * entonces conviene que lo vea desde el panel, no descubrirlo en la portada.
 */
function pickFooter(raw: RawSiteConfig): { title: string; links: NavLink[] }[] {
  const home = (raw.home ?? {}) as Record<string, unknown>;
  const seccion = (home.footer ?? {}) as Record<string, unknown>;
  const lista = toArray(seccion.enlaces, (e) => {
    const item = (e ?? {}) as { label?: unknown; href?: unknown };
    const label = String(item.label ?? "").trim();
    const href = String(item.href ?? "").trim();
    // Un enlace sin texto o sin dirección no es un enlace: sin texto no se ve y
    // sin dirección el clic no lleva a ninguna parte.
    return href && label ? { label, href } : null;
  }).filter((e): e is NavLink => e !== null);

  const enlaces = lista.length ? lista : FALLBACK_FOOTER_COLS[1].links;
  return FALLBACK_FOOTER_COLS.map((col, i) => (i === 1 ? { ...col, links: enlaces } : col));
}

/**
 * Logo y textos del encabezado, con el respaldo cuando no hay nada guardado.
 *
 * Un texto vacío **no** oculta el texto: cae al valor por defecto. Se dice
 * también en el formulario del backoffice, porque prometer "se puede dejar
 * vacío" y que en realidad aparezca el predeterminado sería peor que no dar la
 * opción. Para tapar el subtítulo hay que decirlo en el código, no con un dato.
 */
function pickLogo(raw: RawSiteConfig): LogoShape {
  return {
    url: resolveUrl(raw.logoUrl),
    titulo: (raw.logoTitulo ?? "").trim() || FALLBACK_LOGO.titulo,
    subtitulo: (raw.logoSubtitulo ?? "").trim() || FALLBACK_LOGO.subtitulo,
  };
}

/**
 * Un texto de la portada, con el respaldo cuando viene vacío.
 *
 * Vacío significa "usa el texto del sitio", nunca "sin texto": una sección con
 * el titular en blanco se ve rota, así que es mejor el texto de siempre que un
 * hueco. Es el mismo criterio que con los textos del logo.
 */
function textoO(valor: unknown, respaldo: string): string {
  return typeof valor === "string" && valor.trim() ? valor : respaldo;
}

/** Una imagen de la portada: se resuelve a una URL y cae al respaldo si no hay. */
function imagenO(valor: unknown, respaldo: string): string {
  const ruta = typeof valor === "string" ? valor.trim() : "";
  return resolveUrl(ruta || respaldo);
}

/**
 * Una lista guardada (las entidades aliadas), o el respaldo si no sirve.
 *
 * Se filtran las líneas vacías y, si no queda ninguna, se usa la lista del
 * sitio —una lista vacía o a medio borrar casi siempre es un error, y una
 * entidad sin nombre no es una entidad—.
 */
function listaO(valor: unknown, respaldo: string[]): string[] {
  const lista = toArray(valor, (e) => String(e ?? "").trim()).filter(Boolean);
  return lista.length ? lista : [...respaldo];
}

/**
 * Las tres etapas de la página `/proyecto`, con respaldo hueco por hueco.
 *
 * Son tres huecos fijos (el «01/02/03» lo pone el diseño), así que editar una
 * sola etapa no se lleva las otras dos por delante: cada hueco cae al texto
 * del sitio si viene vacío.
 */
function etapasO(valor: unknown): string[] {
  const propia = toArray(valor, (e) => String(e ?? "").trim());
  return FALLBACK_PORTADA.elProyecto.etapas.map((respaldo, i) => propia[i] || respaldo);
}

/**
 * Un **rótulo fijo** de la portada: siempre el del sitio, nunca el que venga
 * guardado.
 *
 * Los rótulos que encabezan cada bloque ("El proyecto", "Noticias", "Contactos",
 * "Las cuatro dimensiones"…) son parte del diseño de la portada y **no se
 * editan**: el panel no ofrece cambiar ninguno. Aquí se leen de `FALLBACK_PORTADA`
 * y se descarta lo que venga en la API, en vez de usar `textoO`, porque la
 * diferencia es justamente esa: `textoO` dejaría que un valor guardado —de una
 * versión anterior en la que sí eran editables, o de alguien que los escribió a
 * mano por la API— tapara el rótulo del sitio. Con esto, guardarlos no cambia
 * nada visible, que es lo que tiene que pasar.
 *
 * El texto que sí se edita en cada bloque (la bajada, los rótulos de botón, el de
 * la caja de preguntas) sigue resolviéndose con `textoO`, y las imágenes con
 * `imagenO`.
 */
function fijoPortada<S extends keyof Portada>(seccion: S, campo: "titulo" | "dimsTitulo"): string {
  const valor = FALLBACK_PORTADA[seccion][campo as keyof Portada[S]] as string;
  return valor;
}

/**
 * Un color de botón guardado, o el del sitio si el guardado no sirve.
 *
 * Igual que `textoO`, pero para los colores: solo se acepta una clave que esté
 * en `COLORES_BOTON`. Aunque el backend ya valida, comprobarlo aquí evita que un
 * dato viejo, o alguien que lo escriba a mano por la API, deje un botón sin
 * fondo —en Tailwind una clase que no existe no da error, simplemente no pinta
 * nada— y además centraliza el único sitio donde hay que acordarse de la lista.
 */
function colorO(valor: unknown, respaldo: ColorBoton): ColorBoton {
  return (COLORES_BOTON as readonly unknown[]).includes(valor) ? (valor as ColorBoton) : respaldo;
}

/**
 * El color del botón que va **encima de la caja lima**, validado contra su lista
 * corta.
 *
 * Además de caer al respaldo si no es un color, cae si es un color válido pero
 * **no válido aquí**: un `lima` guardado (de una versión en la que la lista era la
 * completa, o escrito a mano por la API) pondría el botón del mismo color que la
 * caja y se perdería. `colorO` no lo habría pillado, porque `lima` sí está en la
 * lista general.
 */
function colorSobreLimaO(
  valor: unknown,
  respaldo: ColorBotonSobreLima,
): ColorBotonSobreLima {
  return (COLORES_BOTON_SOBRE_LIMA as readonly unknown[]).includes(valor)
    ? (valor as ColorBotonSobreLima)
    : respaldo;
}

/**
 * El contenido de la portada, sección por sección.
 *
 * Se resuelve campo a campo en vez de reemplazar el bloque entero. Es lo que
 * hace que **vaciar un solo campo no borre la sección**: una bajada vacía cae al
 * texto del sitio y el resto de la sección sigue como estaba. Si se sustituyera
 * el bloque completo por el respaldo en cuanto uno de sus campos viniera mal, un
 * solo campo vacío se llevaría por delante los otros cinco.
 *
 * Los rótulos fijos van por `fijoPortada`, no por `textoO`: ver la nota de esa
 * función.
 *
 * El titular del hero **no** entra aquí: es `site.headline`, que ya existía
 * como columna propia. También es fijo, y se resuelve en `mapSite`.
 */
function pickPortada(home: unknown): Portada {
  const bloques = (home ?? {}) as Record<string, Record<string, unknown>>;
  const b = (seccion: string) => bloques[seccion] ?? {};

  const hero = b("hero");
  const proyecto = b("proyecto");
  const elProyecto = b("elProyecto");
  const cobertura = b("cobertura");
  const documentos = b("documentos");
  const noticias = b("noticias");
  const contacto = b("contacto");

  return {
    hero: {
      fondo: imagenO(hero.fondo, FALLBACK_PORTADA.hero.fondo),
      imagen: imagenO(hero.imagen, FALLBACK_PORTADA.hero.imagen),
      botonTexto: textoO(hero.botonTexto, FALLBACK_PORTADA.hero.botonTexto),
      botonColor: colorO(hero.botonColor, FALLBACK_PORTADA.hero.botonColor),
      cajaTitulo: textoO(hero.cajaTitulo, FALLBACK_PORTADA.hero.cajaTitulo),
      cajaBotonColor: colorSobreLimaO(
        hero.cajaBotonColor,
        FALLBACK_PORTADA.hero.cajaBotonColor,
      ),
    },
    proyecto: {
      fondo: imagenO(proyecto.fondo, FALLBACK_PORTADA.proyecto.fondo),
      titulo: fijoPortada("proyecto", "titulo"),
      texto: textoO(proyecto.texto, FALLBACK_PORTADA.proyecto.texto),
      tarjetaBoton: textoO(proyecto.tarjetaBoton, FALLBACK_PORTADA.proyecto.tarjetaBoton),
      botonColor: colorO(proyecto.botonColor, FALLBACK_PORTADA.proyecto.botonColor),
      dimsTitulo: fijoPortada("proyecto", "dimsTitulo"),
      dimsTexto: textoO(proyecto.dimsTexto, FALLBACK_PORTADA.proyecto.dimsTexto),
      accionTitulo: textoO(proyecto.accionTitulo, FALLBACK_PORTADA.proyecto.accionTitulo),
    },
    elProyecto: {
      fondo: imagenO(elProyecto.fondo, FALLBACK_PORTADA.elProyecto.fondo),
      // A diferencia de los rótulos de la portada, este título **sí** se edita
      // desde el panel: es el titular de `/proyecto`, no un rótulo del diseño.
      titulo: textoO(elProyecto.titulo, FALLBACK_PORTADA.elProyecto.titulo),
      intro: textoO(elProyecto.intro, FALLBACK_PORTADA.elProyecto.intro),
      parrafoUno: textoO(elProyecto.parrafoUno, FALLBACK_PORTADA.elProyecto.parrafoUno),
      parrafoDos: textoO(elProyecto.parrafoDos, FALLBACK_PORTADA.elProyecto.parrafoDos),
      // Las etapas son exactamente tres, con su número puesto por el diseño.
      // Se resuelven hueco por hueco para que editar una sola no se lleve las
      // otras dos por delante.
      etapas: etapasO(elProyecto.etapas),
      // La lista entera o el respaldo: a diferencia de las etapas no son huecos
      // fijos, es una lista que se ordena y una vacía o a medias cae a la del
      // sitio (mismo criterio que el menú).
      entidades: listaO(elProyecto.entidades, FALLBACK_PORTADA.elProyecto.entidades),
    },
    cobertura: {
      titulo: fijoPortada("cobertura", "titulo"),
      texto: textoO(cobertura.texto, FALLBACK_PORTADA.cobertura.texto),
    },
    documentos: {
      titulo: fijoPortada("documentos", "titulo"),
      texto: textoO(documentos.texto, FALLBACK_PORTADA.documentos.texto),
      botonColor: colorO(documentos.botonColor, FALLBACK_PORTADA.documentos.botonColor),
    },
    noticias: {
      titulo: fijoPortada("noticias", "titulo"),
      texto: textoO(noticias.texto, FALLBACK_PORTADA.noticias.texto),
      botonTexto: textoO(noticias.botonTexto, FALLBACK_PORTADA.noticias.botonTexto),
      botonColor: colorO(noticias.botonColor, FALLBACK_PORTADA.noticias.botonColor),
      tarjetaBotonColor: colorO(
        noticias.tarjetaBotonColor,
        FALLBACK_PORTADA.noticias.tarjetaBotonColor,
      ),
    },
    contacto: {
      titulo: fijoPortada("contacto", "titulo"),
      texto: textoO(contacto.texto, FALLBACK_PORTADA.contacto.texto),
      formTitulo: textoO(contacto.formTitulo, FALLBACK_PORTADA.contacto.formTitulo),
      botonColor: colorO(contacto.botonColor, FALLBACK_PORTADA.contacto.botonColor),
      enviarColor: colorO(contacto.enviarColor, FALLBACK_PORTADA.contacto.enviarColor),
    },
  };
}

function pickStats(stats: RawStat[] | undefined): Stat[] {
  return stats?.length
    ? stats.map((s) => ({ value: s.value, label: s.label, subtext: s.subtext ?? "" }))
    : (FALLBACK_STATS as unknown as Stat[]);
}

function pickWorkshops(talleres: RawTaller[] | undefined): Workshop[] {
  if (!talleres?.length) return FALLBACK_WORKSHOPS as unknown as Workshop[];
  return talleres.map((t) => ({ date: formatFecha(t.date), title: t.title, place: t.place, status: t.status }));
}

/**
 * Los doce municipios, con respaldo.
 *
 * El respaldo son solo los nombres, sin `dato` ni `descripcion`: la lista fija
 * que estaba en `municipios.ts` nunca tuvo texto de apoyo, y no hace falta
 * inventarlo para que la página se vea bien sin conexión. Con la base conectada
 * llegan los tres campos.
 */
function pickMunicipios(municipios: RawMunicipio[] | undefined): Municipio[] {
  const fallback = MUNICIPIOS_QUINDIO.map((nombre) => ({ nombre, dato: "", descripcion: "" }));
  if (!municipios?.length) return fallback;
  return municipios
    .map((m) => ({
      nombre: (m.nombre ?? "").trim(),
      dato: (m.dato ?? "").trim(),
      descripcion: (m.descripcion ?? "").trim(),
    }))
    .filter((m) => m.nombre.length > 0);
}

function pickCategorias(categorias: RawCategoria[] | undefined): DocCategory[] {
  if (!categorias?.length) return FALLBACK_CATEGORIES;
  return categorias.map((c) => ({
    slug: c.slug,
    title: c.title,
    description: c.description,
    icon: c.icon as DocCategory["icon"],
  }));
}

function pickPaginas(paginas: RawPagina[] | undefined): ProjectPage[] {
  if (!paginas?.length) return FALLBACK_PAGES;
  return paginas.map((p) => ({
    ...p,
    // `resolveUrl` convierte `/uploads/...` en una URL que el navegador pueda
    // pedir y deja intactas las que ya son completas o vienen con el sitio
    // (`/images/...`). Sin esto, una imagen subida desde Configuración → Proyecto
    // se guardaba bien pero no se veía en `/proyecto` ni en su detalle: el
    // `<img>` pedía `/uploads/...` al frontend, que no sirve archivos. Se
    // resuelve una sola vez aquí y las tres pantallas que pintan la imagen
    // (la lista, el detalle y el carrusel de la portada) quedan bien.
    image: resolveUrl(p.image) || "/images/hero-city.jpg",
    body: toStringArray(p.body),
  }));
}

function pickDimensiones(dimensiones: RawDimension[] | undefined): Dimension[] {
  if (!dimensiones?.length) return FALLBACK_DIMENSIONS;
  return dimensiones.map((d) => ({
    ...d,
    // El backend manda `tipo`; si una fila antigua no lo tiene, se asume
    // dimensión para que no desaparezca de la lista.
    tipo: d.tipo === "bloque" ? "bloque" : "dimension",
    short: d.short || d.title,
    body: toStringArray(d.body),
    layers: toStringArray(d.layers),
    steps: toArray(d.steps, (s) => {
      const step = (s ?? {}) as { n?: unknown; title?: unknown };
      return {
        n: String(step.n ?? ""),
        title: String(step.title ?? ""),
      };
    }),
    charts: toArray(d.charts, (c) => c as Dimension["charts"][number]),
  }));
}

type SiteBundle = {
  SITE: SiteShape;
  /** Marca y textos del encabezado, editables en Ajustes → Header. */
  LOGO: LogoShape;
  /** Enlaces del menú, en el orden guardado. */
  NAV: NavLink[];
  /** Las cuatro columnas del pie de página; solo la segunda es editable. */
  FOOTER: { title: string; links: NavLink[] }[];
  /** El hero y las secciones de la portada, editables desde Ajustes, bloque a bloque. */
  PORTADA: Portada;
  STATS: Stat[];
  ENTITIES: string[];
  MUNICIPIOS: Municipio[];
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
    LOGO: { ...FALLBACK_LOGO, url: "" },
    NAV: [...FALLBACK_NAV],
    FOOTER: FALLBACK_FOOTER_COLS.map((col) => ({ ...col, links: [...col.links] })),
    PORTADA: FALLBACK_PORTADA,
    STATS: FALLBACK_STATS as unknown as Stat[],
    ENTITIES: FALLBACK_PORTADA.elProyecto.entidades,
    MUNICIPIOS: MUNICIPIOS_QUINDIO.map((nombre) => ({ nombre, dato: "", descripcion: "" })),
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

  // Las entidades aliadas salen de la portada (`elProyecto.entidades`), como el
  // resto del contenido de la página `/proyecto`. Antes venían en su propia
  // tabla; desde que se editan en Ajustes → El proyecto viven en `home` y los
  // dos sitios que las muestran (`/proyecto` y `/contactos`) leen lo mismo.
  const portada = pickPortada(raw.site.home);
  const pages = pickPaginas(raw.paginas);
  const dims = pickDimensiones(raw.dimensiones);
  const cats = pickCategorias(raw.categorias);
  const workshops = pickWorkshops(raw.talleres);
  const municipios = pickMunicipios(raw.municipios);

  return {
    SITE: mapSite(raw.site),
    LOGO: pickLogo(raw.site),
    NAV: pickNav(raw.site),
    FOOTER: pickFooter(raw.site),
    PORTADA: portada,
    STATS: pickStats(raw.stats),
    ENTITIES: portada.elProyecto.entidades,
    MUNICIPIOS: municipios,
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
      for (const m of municipios) {
        if (`${m.nombre} ${m.dato} ${m.descripcion}`.toLowerCase().includes(q)) {
          hits.push({
            href: "/proyecto#cobertura-territorial",
            title: m.nombre,
            kind: "Municipio",
            excerpt: m.dato || "Municipio del Quindío",
          });
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