import { Link, useParams } from "react-router-dom";
import { DimensionStats } from "@/components/dimension-panel";
import { PageHero } from "@/components/site-shell";
import { useSite } from "@/data/site-context";
import { NotFoundPage } from "./NotFoundPage";

/**
 * Ficha completa de una dimensión (`/dimensiones/:slug`).
 *
 * Orden del contenido: Descripción (bajada del hero) → Análisis → Retos
 * principales → Líneas de trabajo → Estadísticas. Antes la página pintaba
 * `body` y después `<DimensionDetail>`, que en modo "sin gráficas" volvía a
 * pintar el `body` y las capas: el texto salía duplicado.
 */
export function DimensionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { DIMENSIONS, getDimension } = useSite();
  const dim = getDimension(slug ?? "");

  if (!dim) {
    return <NotFoundPage />;
  }

  const esBloque = dim.tipo === "bloque";
  // Para una dimensión, enlaza las otras tres dimensiones; para un bloque, los
  // otros bloques. Así no se mezclan dimensiones de análisis con apoyo.
  const otras = DIMENSIONS.filter((d) => d.slug !== dim.slug && d.tipo === dim.tipo);

  return (
    <>
      <PageHero
        kicker={esBloque ? "Misiones, retos y hoja de ruta" : "Dimensiones"}
        title={dim.title}
        intro={dim.summary}
      />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {dim.body.length > 0 ? (
          <div className="max-w-3xl space-y-3">
            {dim.body.map((p) => (
              <p key={p.slice(0, 32)} className="leading-relaxed text-body">
                {p}
              </p>
            ))}
          </div>
        ) : null}

        {dim.steps.length > 0 || dim.layers.length > 0 ? (
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {dim.steps.length > 0 ? (
              <div>
                <h2 className="font-display text-xs font-semibold tracking-wide text-muted uppercase">
                  {dim.stepsLabel}
                </h2>
                <ul className="mt-3 space-y-2">
                  {dim.steps.map((s) => (
                    <li key={s.n + s.title} className="flex gap-2 text-sm text-body">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-lime-hot" />
                      {s.title}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {dim.layers.length > 0 ? (
              <div>
                <h2 className="font-display text-xs font-semibold tracking-wide text-muted uppercase">
                  {dim.layersLabel}
                </h2>
                <ul className="mt-3 space-y-2">
                  {dim.layers.map((l) => (
                    <li key={l} className="flex gap-2 text-sm text-body">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-lime-hot" />
                      {l}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-10">
          <h2 className="font-display text-xs font-semibold tracking-wide text-muted uppercase">
            Estadísticas
          </h2>
          <DimensionStats dim={dim} />
        </div>

        {otras.length > 0 ? (
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {otras.map((d) => (
              <Link
                key={d.slug}
                to={`/dimensiones/${d.slug}`}
                className="rounded-xl border border-stone p-4 no-underline hover:border-lime"
              >
                <span className="font-display text-sm font-semibold text-ink">{d.short}</span>
              </Link>
            ))}
          </div>
        ) : null}
      </section>
    </>
  );
}
