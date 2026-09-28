import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageHero } from "@/components/site-shell";
import { fetchNoticia, fetchNoticias, toNewsItem, ApiError, type NewsItem } from "@/lib/api";
import { ShareRow } from "@/components/share-row";
import { NotFoundPage } from "./NotFoundPage";

/**
 * Contenido de respaldo para cuando la API no responde. Solo se usa si el slug
 * coincide exactamente: antes, un slug inexistente caía en `DEFAULT_NEWS_ITEMS[0]`
 * y pintaba la primera noticia del listado bajo una URL equivocada.
 */
const DEFAULT_NEWS_ITEMS: NewsItem[] = [
  {
    slug: "lanzamiento-oficial-horizonte-quindio-2050",
    title: "Lanzamiento oficial del proyecto Horizonte Quindío 2050",
    category: "Noticias y Comunicados",
    date: "24 mar 2026",
    image: "/images/news-ciudad.jpg",
    excerpt:
      "Catorce entidades públicas, privadas y académicas junto a la CEPAL presentaron en la Universidad del Quindío el ejercicio de prospectiva territorial.",
    body: [
      "El 24 de marzo de 2026 se presentó oficialmente en el auditorio Euclides Jaramillo Arango de la Universidad del Quindío el ejercicio de prospectiva territorial Horizonte Quindío 2050.",
      "El convenio específico 012 de 2026 une a las catorce principales organizaciones del departamento para construir de forma participativa la hoja de ruta estratégica hacia el año 2050.",
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
    category: "Convocatoria",
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

export function NoticiasDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [item, setItem] = useState<NewsItem | null>(null);
  const [others, setOthers] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    setItem(null);

    // La noticia y el listado son dos peticiones independientes: si el listado
    // "Más noticias" falla, el artículo principal se sigue mostrando.
    fetchNoticia(slug)
      .then((data) => {
        setItem(toNewsItem(data));
        return fetchNoticias({ perPage: 20 })
          .then((list) => setOthers(list.data.map(toNewsItem).filter((n) => n.slug !== slug)))
          .catch(() => setOthers([]));
      })
      .catch((error: unknown) => {
        // 404 real: no existe una noticia con ese slug, así que 404 de la web.
        // Cualquier otro fallo (API caída, red) sí recurre a los datos de
        // respaldo, y solo con coincidencia exacta de slug.
        if (error instanceof ApiError && error.status === 404) {
          setNotFound(true);
          return;
        }
        const respaldo = DEFAULT_NEWS_ITEMS.find((n) => n.slug === slug);
        if (respaldo) {
          setItem(respaldo);
          setOthers(DEFAULT_NEWS_ITEMS.filter((n) => n.slug !== respaldo.slug));
        } else {
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-xl py-24 text-center text-muted">
        Cargando noticia…
      </div>
    );
  }

  if (notFound || !item) {
    return <NotFoundPage />;
  }

  return (
    <>
      <PageHero kicker={item.category} title={item.title} intro={item.excerpt} />
      <article className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted">
            {item.date}
            {item.author ? (
              <>
                {" · "}
                <span className="text-ink">{item.author}</span>
              </>
            ) : null}
          </p>
          <ShareRow titulo={item.title} />
        </div>
        <img src={item.image} alt="" className="mt-6 h-80 w-full rounded-2xl object-cover" />
        {item.body.map((p) => (
          <p key={p.slice(0, 40)} className="mt-5 max-w-3xl text-base leading-relaxed text-body">
            {p}
          </p>
        ))}
        {others.length > 0 ? (
          <div className="mt-12">
            <p className="font-display text-sm font-bold text-ink">Más noticias</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {others.slice(0, 6).map((n) => (
                <li key={n.slug}>
                  <Link
                    to={`/noticias/${n.slug}`}
                    className="block rounded-xl border border-stone p-4 no-underline hover:border-lime"
                  >
                    <span className="font-display text-sm font-semibold text-ink">{n.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </article>
    </>
  );
}
