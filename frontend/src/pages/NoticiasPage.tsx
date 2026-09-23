import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { PageHero } from "@/components/site-shell";
import { fetchNoticias, toNewsItem, type NewsItem } from "@/lib/api";
import { cn } from "@/lib/utils";

const DEFAULT_NEWS_ITEMS: NewsItem[] = [
  {
    slug: "lanzamiento-oficial-horizonte-quindio-2050",
    title: "Lanzamiento oficial del proyecto Horizonte Quindío 2050",
    category: "Noticias y Comunicados",
    date: "24 mar 2026",
    image: "/images/news-ciudad.jpg",
    excerpt:
      "Once entidades públicas, privadas y académicas junto a la CEPAL presentaron en la Universidad del Quindío el ejercicio de prospectiva territorial.",
    body: [
      "El 24 de marzo de 2026 se presentó oficialmente en el auditorio Euclides Jaramillo Arango de la Universidad del Quindío el ejercicio de prospectiva territorial Horizonte Quindío 2050.",
      "El convenio específico 012 de 2026 une a las once principales instituciones del departamento para construir de forma participativa la hoja de ruta estratégica hacia el año 2050.",
      "El evento contó con la participación de autoridades gubernamentales, rectores universitarios, líderes gremiales y representantes de la CEPAL-ILPES.",
    ],
  },
  {
    slug: "taller-gremios-y-sector-empresarial",
    title: "Taller estratégico con gremios y sector empresarial del Quindío",
    category: "Talleres y Eventos",
    date: "8 may 2026",
    image: "/images/news-eventos.jpg",
    excerpt:
      "Empresarios, emprendedores y dirigentes gremiales definieron los principales retos de competitividad e innovación para el departamento.",
    body: [
      "En la sede de la Cámara de Comercio de Armenia y del Quindío se llevó a cabo el primer taller enfocado en el desarrollo económico y la sofisticación productiva.",
      "Los participantes analizaron el impacto de la transición del modelo cafetero, el turismo sostenible, las industrias creativas y las oportunidades de exportación.",
    ],
  },
  {
    slug: "convocatoria-laboratorio-escenarios-jovenes",
    title: "Convocatoria abierta: Laboratorio de escenarios para jóvenes del Quindío",
    category: "Convocatorias Abiertas",
    date: "19 jun 2026",
    image: "/images/news-convocatoria.jpg",
    overlay: "convoca",
    excerpt:
      "Se abren inscripciones para que jóvenes líderes de los 12 municipios participen en la construcción de escenarios futuros.",
    body: [
      "Horizonte Quindío convoca a estudiantes universitarios, líderes juveniles y emprendedores a sumarse al Laboratorio de Escenarios Futuros.",
      "Las jornadas contarán con metodologías participativas y formación en herramientas de prospección territorial.",
    ],
  },
  {
    slug: "mesa-tecnica-ambiental-y-paisaje-cultural",
    title: "Mesa técnica ambiental: Agua, biodiversidad y Paisaje Cultural Cafetero",
    category: "Talleres y Eventos",
    date: "3 jul 2026",
    image: "/images/news-paisaje.jpg",
    excerpt:
      "Expertos ambientales y la CRQ instalaron la mesa de trabajo sobre seguridad hídrica y conservación de ecosistemas estratégicos.",
    body: [
      "La Corporación Autónoma Regional del Quindío lideró la sesión técnica para evaluar el estado de las cuencas hidrográficas y la preservación del suelo.",
    ],
  },
  {
    slug: "acuerdo-red-gobernanza-cepal",
    title: "El Quindío se suma a la red regional de gobernanza anticipatoria de la CEPAL",
    category: "Noticias y Comunicados",
    date: "21 ago 2026",
    image: "/images/hero-city.jpg",
    excerpt:
      "El departamento se integra a la red de territorios pioneros en planificación de largo aliento en América Latina.",
    body: [
      "Junto a experiencias en México, Argentina y Brasil, el Quindío adopta estándares internacionales para institucionalizar el seguimiento de la visión 2050.",
    ],
  },
];

const CATEGORIES = ["Todas", "Noticias y Comunicados", "Talleres y Eventos", "Convocatorias Abiertas"];

export function NoticiasPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchNoticias({ perPage: 20 })
      .then((res) => {
        const items = res.data.map(toNewsItem);
        setNews(items.length > 0 ? items : DEFAULT_NEWS_ITEMS);
      })
      .catch(() => setNews(DEFAULT_NEWS_ITEMS))
      .finally(() => setLoading(false));
  }, []);

  const filteredNews = useMemo(() => {
    return news.filter((n) => {
      const matchesCat =
        activeCategory === "Todas" ||
        n.category.toLowerCase().includes(activeCategory.toLowerCase()) ||
        (activeCategory === "Convocatorias Abiertas" && n.overlay === "convoca");
      const matchesSearch =
        !searchTerm.trim() ||
        `${n.title} ${n.excerpt} ${n.category}`.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [news, activeCategory, searchTerm]);

  const featured = filteredNews[0];
  const rest = filteredNews.slice(1);

  return (
    <>
      <PageHero
        kicker="Novedades"
        title="Noticias y convocatorias"
        intro="Comunicados oficiales, talleres, eventos y convocatorias para construir el futuro del Quindío."
      />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* Filter Bar & Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "rounded-pill px-4 py-2 font-display text-xs font-semibold transition-all duration-200",
                  activeCategory === cat
                    ? "bg-lime text-lime-fg shadow-xs"
                    : "border border-stone bg-paper text-muted hover:bg-fog hover:text-ink"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar noticias..."
              className="h-10 w-full rounded-pill border border-stone bg-paper pl-10 pr-4 text-xs text-ink outline-none placeholder:text-muted focus:border-lime focus:ring-1 focus:ring-lime"
            />
          </div>
        </div>

        {/* Content View */}
        {loading ? (
          <p className="py-20 text-center text-sm text-muted">Cargando noticias y convocatorias...</p>
        ) : filteredNews.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-display text-base font-bold text-ink">No se encontraron noticias</p>
            <p className="mt-1 text-xs text-muted">
              Prueba cambiando la categoría o el término de búsqueda.
            </p>
          </div>
        ) : (
          <div className="mt-10 flex flex-col gap-10">
            {/* Featured Card */}
            {featured ? (
              <Link
                to={`/noticias/${featured.slug}`}
                className="group grid overflow-hidden rounded-2xl border border-stone bg-paper no-underline shadow-xs transition-shadow hover:shadow-md sm:grid-cols-5"
              >
                <div className="relative h-44 sm:col-span-2 sm:h-auto">
                  <img
                    src={featured.image}
                    alt={featured.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
                  />
                  <div
                    className={cn(
                      "absolute inset-0",
                      featured.overlay === "convoca"
                        ? "bg-convoca/40"
                        : "bg-gradient-to-t from-ink/60 via-transparent to-transparent"
                    )}
                  />
                </div>
                <div className="flex flex-col justify-center p-5 sm:col-span-3 sm:p-6">
                  <span className="self-start rounded-pill bg-lime/30 px-2.5 py-0.5 font-display text-[0.68rem] font-bold text-ink uppercase">
                    {featured.category} · {featured.date}
                  </span>
                  <h2 className="mt-3 font-display text-lg font-bold text-ink group-hover:text-ink-mid">
                    {featured.title}
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-muted">{featured.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-1 font-display text-xs font-bold text-lime-hot">
                    Leer artículo completo »
                  </span>
                </div>
              </Link>
            ) : null}

            {/* Grid of remaining cards */}
            {rest.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((n) => (
                  <Link
                    key={n.slug}
                    to={`/noticias/${n.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-stone bg-paper no-underline shadow-xs transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative h-48">
                      <img
                        src={n.image}
                        alt={n.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
                      />
                      <div
                        className={cn(
                          "absolute inset-0",
                          n.overlay === "convoca"
                            ? "bg-convoca/45"
                            : "bg-gradient-to-t from-ink/50 to-transparent"
                        )}
                      />
                      {n.overlay === "convoca" ? (
                        <span className="absolute left-3 top-3 rounded-pill bg-lime px-2.5 py-0.5 font-display text-[0.65rem] font-extrabold text-lime-fg uppercase">
                          Convocatoria
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="font-display text-[0.65rem] font-semibold tracking-widest text-muted uppercase">
                        {n.category} · {n.date}
                      </p>
                      <h3 className="mt-2 font-display text-base font-bold text-ink group-hover:text-ink-mid">
                        {n.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 flex-1 text-xs text-muted">{n.excerpt}</p>
                      <span className="mt-4 inline-flex items-center gap-1 font-display text-xs font-bold text-lime-hot">
                        Ver más »
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </section>
    </>
  );
}
