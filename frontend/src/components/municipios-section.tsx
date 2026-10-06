import { useSite } from "@/data/site-context";
import { cn } from "@/lib/utils";

/**
 * Los doce municipios del departamento del Quindío.
 *
 * La lista venía fija en `data/municipios.ts` y solo se usaba para el <select> de
 * inscripción, así que la cobertura territorial no se veía en ninguna página del
 * sitio — que es justo lo que el documento de arquitectura pide. Ahora la lista
 * llega de `GET /api/site` y se edita desde el panel, y esta sección la muestra.
 *
 * Se exportan dos versiones porque hacen falta dos pesos visuales:
 *  - `MunicipiosSection`: la versión con texto, para /proyecto.
 *  - `MunicipiosStrip`: la versión compacta en píldoras, para la portada, donde
 *    el espacio es de los que se pelean con el carrusel de noticias.
 */

export function MunicipiosSection({ className }: { className?: string }) {
  const { MUNICIPIOS } = useSite();

  if (MUNICIPIOS.length === 0) return null;

  return (
    <section
      id="cobertura-territorial"
      className={cn("scroll-mt-20 border-t border-stone pt-10", className)}
    >
      <p className="font-display text-xs font-semibold tracking-[0.18em] text-lime-ink uppercase">
        Cobertura territorial
      </p>
      <h2 className="mt-2 font-display text-xl font-bold text-ink sm:text-2xl">
        Los doce municipios del Quindío
      </h2>
      <p className="mt-2 max-w-3xl text-xs text-muted sm:text-sm">
        La visión del 2050 se construye para todo el departamento, no solo para
        Armenia. Estos son los doce municipios que participan, y qué aporta cada
        uno al ejercicio.
      </p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MUNICIPIOS.map((m) => (
          <li
            key={m.nombre}
            className="flex flex-col rounded-2xl border border-stone bg-paper p-4 transition-colors hover:border-lime-hot/50"
          >
            <h3 className="font-display text-sm font-bold text-ink">{m.nombre}</h3>
            {m.dato ? (
              <p className="mt-1 font-display text-xs font-semibold text-lime-ink">
                {m.dato}
              </p>
            ) : null}
            {m.descripcion ? (
              <p className="mt-2 text-xs leading-relaxed text-muted">{m.descripcion}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function MunicipiosStrip({ className }: { className?: string }) {
  const { MUNICIPIOS, PORTADA } = useSite();

  if (MUNICIPIOS.length === 0) return null;

  return (
    <section className={cn("border-y border-stone bg-fog px-4 py-8 sm:px-6", className)}>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 className="font-display text-sm font-bold text-ink">
            {PORTADA.cobertura.titulo}
          </h2>
          <p className="text-xs text-muted">{PORTADA.cobertura.texto}</p>
        </div>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {MUNICIPIOS.map((m) => (
            <li
              key={m.nombre}
              className="rounded-pill border border-mist bg-paper px-3 py-1.5 font-display text-xs font-semibold text-ink"
            >
              {m.nombre}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
