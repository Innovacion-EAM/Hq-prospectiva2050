import { useState } from "react";
import { DimensionDetail, DimensionGrid } from "@/components/dimension-panel";
import { PageHero } from "@/components/site-shell";
import { useSite } from "@/data/site-context";

export function DimensionesPage() {
  const { DIMENSIONS } = useSite();
  const [slug, setSlug] = useState(DIMENSIONS[0].slug);
  const dim = DIMENSIONS.find((d) => d.slug === slug) ?? DIMENSIONS[0];

  return (
    <>
      <PageHero
        kicker="Dimensiones"
        title="Dimensiones, misiones y retos"
        intro="Cuatro lecturas del territorio y cuatro instrumentos para pasar del diagnóstico a la acción."
      />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <DimensionGrid active={slug} onSelect={setSlug} />
        <DimensionDetail dim={dim} />
      </section>
    </>
  );
}
