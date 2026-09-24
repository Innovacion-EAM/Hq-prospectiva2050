import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useSite } from "@/data/site-context";
import { cn } from "@/lib/utils";
import { DimensionDetail, DimensionGrid, TopPillTabs } from "./dimension-panel";
import { LimeCta } from "./site-shell";

const CAROUSEL_CARDS = [
  {
    slug: "que-es",
    title: "¿Qué es Horizonte Quindío 2050?",
    image: "/images/card-que-es.jpg",
    excerpt:
      "Un ejercicio colectivo de prospectiva territorial para trazar la visión compartida del departamento.",
  },
  {
    slug: "contexto",
    title: "Contexto y justificación",
    image: "/images/card-contexto.jpg",
    excerpt:
      "Tras más de veinte años sin un ejercicio de futuro, el departamento retoma la prospectiva como herramienta de gobierno.",
  },
  {
    slug: "objetivo",
    title: "Objetivo",
    image: "/images/card-objetivo.jpg",
    excerpt:
      "Construir una visión compartida al 2050 e institucionalizar la prospectiva en la toma de decisiones públicas.",
  },
  {
    slug: "gobernanza",
    title: "Gobernanza",
    image: "/images/hero-city.jpg",
    excerpt:
      "Once entidades y la CEPAL conforman el arreglo institucional que sostiene el ejercicio.",
  },
  {
    slug: "principios",
    title: "Principios y valores",
    image: "/images/cocora.jpg",
    excerpt:
      "Intergeneracionalidad, inclusión, evidencia y sentido de pertenencia territorial.",
  },
];

export function HomeProject() {
  const { DIMENSIONS } = useSite();
  const [slide, setSlide] = useState(0);
  const [dim, setDim] = useState(DIMENSIONS[0].slug);
  const [expanded, setExpanded] = useState(false);
  const active = DIMENSIONS.find((d) => d.slug === dim) ?? DIMENSIONS[0];
  const max = CAROUSEL_CARDS.length;

  const visible = useMemo(() => {
    return [0, 1, 2].map((i) => CAROUSEL_CARDS[(slide + i) % max]);
  }, [slide, max]);

  return (
    <section className="relative bg-ink">
      {/* Background aerial cityscape photo with dark overlay */}
      <img
        src="/images/city-aerial.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-60 grayscale"
      />
      <div className="absolute inset-0 bg-ink/30" />

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Floating Main Card Shell */}
        <div className="relative rounded-3xl bg-paper px-6 py-10 shadow-[var(--shadow-float)] sm:px-12 sm:pt-14 sm:pb-16">
          {/* SECTION 1: EL PROYECTO */}
          <div id="proyecto">
            <h2 className="text-center font-display text-section font-bold text-ink">
              El proyecto
            </h2>
            
            <p className="mx-auto mt-3 max-w-4xl text-center text-xs text-muted sm:text-sm font-medium truncate">
              Un ejercicio participativo con once entidades y la CEPAL para construir la visión de largo plazo del departamento.
            </p>

            {/* Carousel Container */}
            <div className="relative mt-10">
              <button
                type="button"
                aria-label="Anterior"
                onClick={() => setSlide((s) => (s - 1 + max) % max)}
                className="absolute top-1/2 -left-4 z-20 hidden size-9 -translate-y-1/2 place-items-center rounded-full border border-stone bg-paper text-muted shadow-sm hover:bg-fog hover:text-ink md:grid lg:-left-6"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                aria-label="Siguiente"
                onClick={() => setSlide((s) => (s + 1) % max)}
                className="absolute top-1/2 -right-4 z-20 hidden size-9 -translate-y-1/2 place-items-center rounded-full border border-stone bg-paper text-muted shadow-sm hover:bg-fog hover:text-ink md:grid lg:-right-6"
              >
                <ChevronRight className="size-5" />
              </button>

              <div className="grid gap-5 md:grid-cols-3">
                {visible.map((card) => (
                  <article
                    key={card.slug}
                    className="flex flex-col overflow-hidden rounded-2xl border border-stone bg-paper p-3 shadow-xs transition-shadow hover:shadow-md"
                  >
                    <img
                      src={card.image}
                      alt={card.title}
                      className="h-36 w-full rounded-xl object-cover sm:h-40"
                    />
                    <div className="flex flex-1 flex-col pt-3 pb-1">
                      <h3 className="font-display text-sm font-bold text-ink">
                        {card.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
                        {card.excerpt}
                      </p>
                      <LimeCta to={`/proyecto/${card.slug}`} className="mt-4 self-start">
                        Explorar más {">"}{">"}
                      </LimeCta>
                    </div>
                  </article>
                ))}
              </div>

              {/* Mobile Carousel Controls */}
              <div className="mt-4 flex justify-center gap-2 md:hidden">
                <button
                  type="button"
                  onClick={() => setSlide((s) => (s - 1 + max) % max)}
                  className="grid size-9 place-items-center rounded-full border border-stone bg-paper text-ink"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSlide((s) => (s + 1) % max)}
                  className="grid size-9 place-items-center rounded-full border border-stone bg-paper text-ink"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>

              {/* Pagination Dots */}
              <div className="mt-6 flex justify-center gap-1.5">
                {CAROUSEL_CARDS.map((p, i) => (
                  <button
                    key={p.slug}
                    type="button"
                    aria-label={`Ir a ${p.title}`}
                    onClick={() => setSlide(i)}
                    className={cn(
                      "size-2 rounded-full transition-all duration-200",
                      i === slide ? "bg-ink w-3" : "bg-mist",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2: DIMENSIONES, MISIONES, RETOS */}
          <div id="dimensiones" className="mt-14 border-t border-stone/60 pt-10">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
              <div>
                <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">
                  Dimensiones, Misiones, Retos
                </h2>
                <p className="mt-2 text-xs text-muted sm:text-sm">
                  Explora las dimensiones que estructuran la lectura del territorio y sus misiones.
                </p>
              </div>

              <TopPillTabs active={dim} onSelect={(slug) => setDim(slug)} />
            </div>

            <div className="mt-8">
              <DimensionGrid
                active={dim}
                onSelect={(slug) => {
                  setDim(slug);
                  setExpanded((v) => (dim === slug ? !v : true));
                }}
              />
              {expanded ? <DimensionDetail dim={active} /> : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProjectStrip() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {CAROUSEL_CARDS.slice(0, 3).map((card) => (
        <Link
          key={card.slug}
          to={`/proyecto/${card.slug}`}
          className="overflow-hidden rounded-2xl border border-stone bg-paper no-underline shadow-xs transition-transform duration-200 hover:-translate-y-0.5"
        >
          <img src={card.image} alt="" className="h-40 w-full object-cover" />
          <div className="p-4">
            <h3 className="font-display font-bold text-ink">{card.title}</h3>
            <p className="mt-2 text-sm text-muted">{card.excerpt}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
