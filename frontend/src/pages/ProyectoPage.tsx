import { Link } from "react-router-dom";
import { MunicipiosSection } from "@/components/municipios-section";
import { PageHero } from "@/components/site-shell";
import { useSite } from "@/data/site-context";
import { cn } from "@/lib/utils";

/**
 * La página «El proyecto» (`/proyecto`).
 *
 * Todo lo que se ve aquí se edita desde el panel en Ajustes → El proyecto: el
 * hero (imagen de fondo, titular e intro), los dos párrafos, las tres etapas y
 * la lista de entidades aliadas, con su orden. El resto —las tarjetas de las
 * páginas de detalle y la cobertura territorial— vienen de sus propias
 * pantallas (Configuración → Proyecto y Configuración → Municipios).
 *
 * Cuando un texto viene vacío cae al del sitio, como en el resto de la portada
 * (ver `textoO` y `listaO` en `site-context.tsx`).
 */
export function ProyectoPage() {
  const { ENTITIES, PORTADA, PROJECT_PAGES } = useSite();
  const ep = PORTADA.elProyecto;
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