import { useState } from "react";
import { DimensionDetail, DimensionGrid } from "@/components/dimension-panel";
import { PageHero } from "@/components/site-shell";
import { useSite } from "@/data/site-context";

export function DimensionesPage() {
  const { DIMENSIONS, PORTADA } = useSite();
  const hero = PORTADA.elDimensiones;

  // Solo las 4 dimensiones de análisis del documento. Las entradas marcadas
  // como "bloque" (misiones, retos, iniciativas, hallazgos) son contenido de
  // apoyo y no deben presentarse como dimensiones.
  const analisis = DIMENSIONS.filter((d) => d.tipo === "dimension");
  const dimensiones = analisis.length > 0 ? analisis : DIMENSIONS;
  const bloques = DIMENSIONS.filter((d) => d.tipo === "bloque");

  const [slug, setSlug] = useState(dimensiones[0].slug);
  const dim = dimensiones.find((d) => d.slug === slug) ?? dimensiones[0];

  // Los bloques de apoyo se presentan igual que las dimensiones: una grilla con
  // su icono y un panel con el resumen y las estadísticas, más el enlace a su
  // ficha completa (donde viven el análisis, las listas y las series).
  const [bloqueSlug, setBloqueSlug] = useState(bloques[0]?.slug ?? "");
  const bloque = bloques.find((b) => b.slug === bloqueSlug) ?? bloques[0];

  return (
    <>
      <PageHero kicker="Dimensiones" title={hero.titulo} intro={hero.intro} />
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
              usa para pasar del diagnóstico a la acción. Toca uno para ver su
              resumen y sus estadísticas, o abre su ficha completa.
            </p>
            <div className="mt-6">
              <DimensionGrid
                items={bloques}
                active={bloqueSlug}
                onSelect={setBloqueSlug}
              />
            </div>
            {bloque ? <DimensionDetail dim={bloque} /> : null}
          </div>
        ) : null}
      </section>
    </>
  );
}
