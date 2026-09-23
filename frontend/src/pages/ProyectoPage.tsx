import { Link } from "react-router-dom";
import { PageHero } from "@/components/site-shell";
import { ENTITIES, PROJECT_PAGES } from "@/data/site";

export function ProyectoPage() {
  return (
    <>
      <PageHero
        kicker="El proyecto"
        title="Una visión compartida para el Quindío"
        intro="Once entidades del departamento y la CEPAL construyen, entre 2026 y 2027, la hoja de ruta al 2050."
      />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-lg leading-relaxed text-body">
              Horizonte Quindío es un ejercicio de prospectiva territorial. No predice el
              futuro: lo acuerda. Parte del diagnóstico de capacidades, construye
              escenarios con la gente del departamento e institucionaliza un observatorio
              para que la visión sobreviva a los ciclos políticos.
            </p>
            <p className="mt-4 leading-relaxed text-muted">
              El 24 de marzo de 2026 se presentó en la Universidad del Quindío, con el
              acompañamiento del ILPES-CEPAL. Es el primer ejercicio de este tipo en el
              departamento en más de veinte años.
            </p>
          </div>
          <aside className="rounded-2xl bg-fog p-6">
            <p className="font-display text-sm font-bold text-ink">Tres etapas</p>
            <ol className="mt-4 flex flex-col gap-3 text-sm">
              <li>
                <span className="font-display font-semibold text-lime-hot">01</span>{" "}
                Diagnóstico y diseño metodológico
              </li>
              <li>
                <span className="font-display font-semibold text-lime-hot">02</span>{" "}
                Escenarios y visión compartida
              </li>
              <li>
                <span className="font-display font-semibold text-lime-hot">03</span>{" "}
                Institucionalización y observatorio
              </li>
            </ol>
          </aside>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECT_PAGES.map((p) => (
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
        <div className="mt-16">
          <h2 className="font-display text-xl font-bold text-ink">Entidades aliadas</h2>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ENTITIES.map((e) => (
              <li
                key={e}
                className="rounded-xl border border-stone bg-fog px-4 py-3 text-sm text-ink"
              >
                {e}
              </li>
            ))}
            <li className="rounded-xl border border-lime bg-lime/40 px-4 py-3 text-sm font-semibold text-ink">
              CEPAL — ILPES (acompañamiento técnico)
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
