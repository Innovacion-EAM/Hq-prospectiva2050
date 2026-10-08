import { useState } from "react";
import { Link } from "react-router-dom";
import { MunicipiosSection } from "@/components/municipios-section";
import { PageHero } from "@/components/site-shell";
import { useSite } from "@/data/site-context";
import { cn } from "@/lib/utils";

/** Cuántas tarjetas de proyecto se muestran por cada sección del paginador. */
const PROYECTOS_POR_PAGINA = 6;

/**
 * La página «El proyecto» (`/proyecto`).
 *
 * El texto (fondo, titular, intro, los dos párrafos y las tres etapas) se edita
 * en Ajustes → El proyecto. Las tarjetas salen del CRUD de la barra lateral
 * («El proyecto»), en orden de creación, y se paginan de a seis para que la
 * página no se haga interminable cuando haya muchas. La cobertura territorial y
 * las entidades aliadas son fijas del diseño.
 *
 * Cuando un texto viene vacío cae al del sitio, como en el resto de la portada
 * (ver `textoO` y `listaO` en `site-context.tsx`).
 */
export function ProyectoPage() {
  const { ENTITIES, PORTADA, PROJECT_PAGES } = useSite();
  const ep = PORTADA.elProyecto;

  const totalPaginas = Math.max(1, Math.ceil(PROJECT_PAGES.length / PROYECTOS_POR_PAGINA));
  const [pagina, setPagina] = useState(1);

  // Si se eliminan páginas, la sección guardada puede quedar fuera de rango: se
  // recorta al vuelo para no mostrar una grilla vacía.
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * PROYECTOS_POR_PAGINA;
  const visibles = PROJECT_PAGES.slice(inicio, inicio + PROYECTOS_POR_PAGINA);

  function irA(n: number) {
    setPagina(n);
    document
      .getElementById("tarjetas-proyecto")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <PageHero
        kicker="El proyecto"
        title={ep.titulo}
        intro={ep.intro}
        fondo={ep.fondo}
      />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-lg leading-relaxed text-body">{ep.parrafoUno}</p>
            <p className="mt-4 leading-relaxed text-muted">{ep.parrafoDos}</p>
          </div>
          <aside className="rounded-2xl bg-fog p-6">
            <p className="font-display text-sm font-bold text-ink">Tres etapas</p>
            <ol className="mt-4 flex flex-col gap-3 text-sm">
              {ep.etapas.map((etapa, i) => (
                <li key={i}>
                  {/* El número es parte del diseño: va fijo aunque el texto de
                      la etapa se edite desde el panel. */}
                  <span className="font-display font-semibold text-lime-ink">
                    {String(i + 1).padStart(2, "0")}
                  </span>{" "}
                  {etapa}
                </li>
              ))}
            </ol>
          </aside>
        </div>
        <div
          id="tarjetas-proyecto"
          className="mt-14 grid scroll-mt-20 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visibles.map((p) => (
            <Link
              key={p.slug}
              to={`/proyecto/${p.slug}`}
              className="group overflow-hidden rounded-2xl border border-stone bg-paper no-underline shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
            >
              <img src={p.image} alt="" className="h-40 w-full object-cover" />
              <div className="p-5">
                <p className="font-display text-[0.65rem] font-semibold tracking-widest text-muted uppercase">
                  {p.kicker}
                </p>
                <h2 className="mt-1 font-display text-lg font-bold text-ink group-hover:text-ink-mid">
                  {p.title}
                </h2>
                <p className="mt-2 text-sm text-muted">{p.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>

        {totalPaginas > 1 ? (
          <nav
            aria-label="Paginación de las páginas del proyecto"
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
          >
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => irA(n)}
                aria-current={n === paginaActual ? "page" : undefined}
                aria-label={`Ir a la página ${n}`}
                className={cn(
                  "grid size-10 place-items-center rounded-xl border font-display text-sm font-semibold transition-colors",
                  n === paginaActual
                    ? "border-lime bg-lime text-lime-fg"
                    : "border-stone bg-paper text-ink hover:border-lime-hot",
                )}
              >
                {n}
              </button>
            ))}
          </nav>
        ) : null}

        {/* La cobertura territorial va antes que las aliadas: el territorio es
            quién participa, las entidades son quién organiza. Y con la lista de
            municipios ya a la vista, la de las catorce aliadas se lee como lo que
            es —el andamiaje del ejercicio— y no como su sujeto. */}
        <MunicipiosSection />
        <div className="mt-16">
          <h2 className="font-display text-xl font-bold text-ink">Entidades aliadas</h2>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ENTITIES.map((e, i) => (
              <li
                key={`${e}-${i}`}
                className={cn(
                  "rounded-xl border border-stone bg-fog px-4 py-3 text-sm text-ink",
                  // CEPAL —la que trae el acompañamiento técnico— es la única que
                  // va con su caja lima, identificada por el nombre y no por un
                  // puesto en la lista: así se puede reordenar sin perder el
                  // estilo (ver `ENTITIES` en `site.ts`).
                  e.toUpperCase().includes("CEPAL") &&
                    "border-lime bg-lime/40 font-semibold",
                )}
              >
                {e}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}