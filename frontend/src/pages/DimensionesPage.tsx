import { useState } from "react";
import { DimensionDetail, DimensionGrid } from "@/components/dimension-panel";
import { PageHero } from "@/components/site-shell";
import { useSite } from "@/data/site-context";

export function DimensionesPage() {
  const { DIMENSIONS } = useSite();

  // Solo las 4 dimensiones de análisis del documento. Las entradas marcadas
  // como "bloque" (misiones, retos, iniciativas, hallazgos) son contenido de
  // apoyo y no deben presentarse como dimensiones.
  const analisis = DIMENSIONS.filter((d) => d.tipo === "dimension");
  const dimensiones = analisis.length > 0 ? analisis : DIMENSIONS;
  const bloques = DIMENSIONS.filter((d) => d.tipo === "bloque");

  const [slug, setSlug] = useState(dimensiones[0].slug);
  const dim = dimensiones.find((d) => d.slug === slug) ?? dimensiones[0];

  return (
    <>
      <PageHero
        kicker="Dimensiones"
        title="Las cuatro dimensiones del territorio"
        intro="Cuatro lecturas del Quindío que articulan el diagnóstico, los escenarios y los acuerdos del Horizonte 2050."
      />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <DimensionGrid items={dimensiones} active={slug} onSelect={setSlug} />
        <DimensionDetail dim={dim} />

        {bloques.length > 0 ? (
          <div className="mt-14 border-t border-stone pt-10">
            <h2 className="font-display text-lg font-bold text-ink sm:text-xl">
              Misiones, retos y hoja de ruta
            </h2>
            <p className="mt-2 max-w-3xl text-xs text-muted sm:text-sm">
              No son dimensiones adicionales: son los instrumentos que el proyecto
              usa para pasar del diagnóstico a la acción.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {bloques.map((b) => (
                <div
                  key={b.slug}
                  className="rounded-xl border border-stone bg-fog/40 p-4"
                >
                  <h3 className="font-display text-xs font-semibold text-ink sm:text-[0.8rem]">
                    {b.title}
                  </h3>
                  {b.summary ? (
                    <p className="mt-1.5 text-xs text-muted">{b.summary}</p>
                  ) : null}
                  {b.layers.length > 0 ? (
                    <ul className="mt-2.5 space-y-1">
                      {b.layers.slice(0, 5).map((l) => (
                        <li key={l} className="flex gap-2 text-xs text-body">
                          <span className="mt-1.5 size-1 shrink-0 rounded-full bg-lime-hot" />
                          {l}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}
