import { Link, useParams } from "react-router-dom";
import { DimensionDetail } from "@/components/dimension-panel";
import { PageHero } from "@/components/site-shell";
import { DIMENSIONS, getDimension } from "@/data/site";
import { NotFoundPage } from "./NotFoundPage";

export function DimensionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const dim = getDimension(slug ?? "");

  if (!dim) {
    return <NotFoundPage />;
  }

  return (
    <>
      <PageHero kicker="Dimensiones" title={dim.title} intro={dim.summary} />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {dim.body.map((p) => (
          <p key={p.slice(0, 32)} className="mt-3 max-w-3xl leading-relaxed text-body">
            {p}
          </p>
        ))}
        <DimensionDetail dim={dim} />
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DIMENSIONS.filter((d) => d.slug !== dim.slug).map((d) => (
            <Link
              key={d.slug}
              to={`/dimensiones/${d.slug}`}
              className="rounded-xl border border-stone p-4 no-underline hover:border-lime"
            >
              <span className="font-display text-sm font-semibold text-ink">{d.short}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
