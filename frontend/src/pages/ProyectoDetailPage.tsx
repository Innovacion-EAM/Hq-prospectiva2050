import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { PageHero } from "@/components/site-shell";
import { useSite } from "@/data/site-context";
import { NotFoundPage } from "./NotFoundPage";

/** Baraja una copia de la lista (Fisher–Yates) sin tocar el original. */
function barajar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export function ProyectoDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { PROJECT_PAGES, getProject } = useSite();
  const page = getProject(slug ?? "");

  // Tres recomendadas al azar para que no sean siempre las mismas: se barajan
  // una vez por ficha (cuando cambia el slug), no en cada render.
  const others = useMemo(
    () => barajar(PROJECT_PAGES.filter((p) => p.slug !== (page?.slug ?? ""))).slice(0, 3),
    [PROJECT_PAGES, page],
  );

  if (!page) {
    return <NotFoundPage />;
  }

  return (
    <>
      <PageHero kicker={page.kicker} title={page.title} intro={page.lead} />
      <article className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <img
              src={page.image}
              alt=""
              className="mb-8 h-72 w-full rounded-2xl object-cover"
            />
            {page.body.map((para, i) => (
              <p key={i} className="mt-4 text-base leading-relaxed text-body">
                {para}
              </p>
            ))}
          </div>
          <aside>
            <p className="font-display text-sm font-bold text-ink">También en el proyecto</p>
            <ul className="mt-4 flex flex-col gap-3">
              {others.map((p) => (
                <li key={p.slug}>
                  <Link
                    to={`/proyecto/${p.slug}`}
                    className="block rounded-xl border border-stone p-4 no-underline hover:border-lime"
                  >
                    <span className="font-display text-sm font-semibold text-ink">{p.title}</span>
                    <span className="mt-1 block text-xs text-muted">{p.excerpt}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </article>
    </>
  );
}
