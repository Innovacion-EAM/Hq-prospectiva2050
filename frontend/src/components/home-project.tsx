import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useSite } from "@/data/site-context";
import { cn } from "@/lib/utils";
import { DimensionDetail, DimensionGrid } from "./dimension-panel";
import { LimeCta } from "./site-shell";

export function HomeProject() {
  const { DIMENSIONS, PORTADA, PROJECT_PAGES } = useSite();
  const [slide, setSlide] = useState(0);
  // El documento de arquitectura define 4 dimensiones de análisis; el resto de
  // entradas son bloques de apoyo (misiones, retos, iniciativas, hallazgos).
  const analisis = DIMENSIONS.filter((d) => d.tipo === "dimension");
  const bloques = DIMENSIONS.filter((d) => d.tipo === "bloque");
  const visibles = analisis.length > 0 ? analisis : DIMENSIONS;
  // Arranca en `null` y no en la primera dimensión: al cargar, la sección se ve
  // cerrada y con «Dimensión político-institucional» ya resaltada aunque no había
  // nada debajo. Con `null` ninguna tarjeta parece seleccionada hasta que se toca
  // una, que es lo que la gente espera de un desplegable.
  const [dim, setDim] = useState<string | null>(null);
  const active = visibles.find((d) => d.slug === dim) ?? visibles[0];
  // Los bloques de apoyo (misiones, retos, iniciativas, hallazgos) se despliegan
  // igual que las dimensiones: una grilla con su icono y, al tocar, el resumen,
  // las estadísticas y el enlace a su ficha completa. Antes solo se veían el
  // título y el `short`, así que lo demás parecía no guardarse.
  const [bloque, setBloque] = useState<string | null>(null);
  const bloqueActivo = bloques.find((b) => b.slug === bloque) ?? bloques[0];
  /*
   * Las tarjetas del carrusel son las páginas del proyecto, no una lista aparte.
   *
   * Antes había un arreglo propio (`CAROUSEL_CARDS`) con los mismos cinco
   * títulos, imágenes y resúmenes que las páginas de `/proyecto`, y ya se habían
   * separado: la tarjeta «Gobernanza» decía «Catorce entidades» mientras la
   * página decía «Once». Dos copias del mismo dato divergen solas; aquí solo hay
   * una, la de Configuración → Proyecto, que es donde ya se editaban las
   * páginas. Añadir o quitar una página ahí ahora también la añade o la quita del
   * carrusel, sin tocar código.
   *
   * La lista nunca llega vacía: `pickPaginas` devuelve las páginas de respaldo
   * cuando la base no trae ninguna. Eso es lo que permite dividir por `max` sin
   * miedo a un NaN en el módulo.
   */
  const tarjetas = PROJECT_PAGES;
  const max = tarjetas.length;

  const visible = useMemo(() => {
    return [0, 1, 2].map((i) => tarjetas[(slide + i) % max]);
  }, [slide, max, tarjetas]);

  return (
    <section className="relative bg-ink">
      {/* Fondo de la sección. Editable en Ajustes → Home; el `grayscale` y el 60%
          de opacidad son los que permiten que la tarjeta blanca de dentro se lea
          encima sin quedar suelta. */}
      <img
        src={PORTADA.proyecto.fondo}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-60 grayscale"
      />
      <div className="absolute inset-0 bg-ink/30" />

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Floating Main Card Shell */}
        <div className="relative rounded-3xl bg-paper px-6 py-10 shadow-[var(--shadow-float)] sm:px-12 sm:pt-14 sm:pb-16">
          {/* SECTION 1: EL PROYECTO */}
          <div id="proyecto">
            <h2 className="text-center font-display text-section font-bold text-ink">
              {PORTADA.proyecto.titulo}
            </h2>

            <p className="mx-auto mt-3 max-w-4xl text-center text-xs text-muted sm:text-sm font-medium truncate">
              {PORTADA.proyecto.texto}
            </p>

            {/* Carousel Container */}
            <div className="relative mt-10">
              <button
                type="button"
                aria-label="Anterior"
                onClick={() => setSlide((s) => (s - 1 + max) % max)}
                className="absolute top-1/2 -left-4 z-20 hidden size-9 -translate-y-1/2 place-items-center rounded-full border border-stone bg-paper text-muted shadow-sm hover:bg-fog hover:text-ink md:grid lg:-left-6"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                aria-label="Siguiente"
                onClick={() => setSlide((s) => (s + 1) % max)}
                className="absolute top-1/2 -right-4 z-20 hidden size-9 -translate-y-1/2 place-items-center rounded-full border border-stone bg-paper text-muted shadow-sm hover:bg-fog hover:text-ink md:grid lg:-right-6"
              >
                <ChevronRight className="size-5" />
              </button>

              <div className="grid gap-5 md:grid-cols-3">
                {visible.map((card) => (
                  <article
                    key={card.slug}
                    className="flex flex-col overflow-hidden rounded-2xl border border-stone bg-paper p-3 shadow-xs transition-shadow hover:shadow-md"
                  >
                    <img
                      src={card.image}
                      alt={card.title}
                      className="h-36 w-full rounded-xl object-cover sm:h-40"
                    />
                    <div className="flex flex-1 flex-col pt-3 pb-1">
                      <h3 className="font-display text-sm font-bold text-ink">
                        {card.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
                        {card.excerpt}
                      </p>
                      {/* El color lo elige el panel (Ajustes → Home). Sin
                          `clasesBoton` el `bg-lime` fijo de `LimeCta` le ganaría
                          siempre: en Tailwind manda el orden del CSS generado,
                          no el del atributo. */}
                      <LimeCta
                        to={`/proyecto/${card.slug}`}
                        className="mt-4 self-start"
                        color={PORTADA.proyecto.botonColor}
                      >
                        {PORTADA.proyecto.tarjetaBoton}
                      </LimeCta>
                    </div>
                  </article>
                ))}
              </div>

              {/* Mobile Carousel Controls */}
              <div className="mt-4 flex justify-center gap-2 md:hidden">
                <button
                  type="button"
                  onClick={() => setSlide((s) => (s - 1 + max) % max)}
                  className="grid size-9 place-items-center rounded-full border border-stone bg-paper text-ink"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSlide((s) => (s + 1) % max)}
                  className="grid size-9 place-items-center rounded-full border border-stone bg-paper text-ink"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>

              {/* Pagination Dots */}
              <div className="mt-6 flex justify-center gap-1.5">
                {tarjetas.map((p, i) => (
                  <button
                    key={p.slug}
                    type="button"
                    aria-label={`Ir a ${p.title}`}
                    onClick={() => setSlide(i)}
                    className={cn(
                      "size-2 rounded-full transition-all duration-200",
                      i === slide ? "bg-ink w-3" : "bg-mist",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2: DIMENSIONES, MISIONES, RETOS */}
          <div id="dimensiones" className="mt-14 border-t border-stone/60 pt-10">
            <div>
              <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">
                {PORTADA.proyecto.dimsTitulo}
              </h2>
              <p className="mt-2 text-xs text-muted sm:text-sm">
                {PORTADA.proyecto.dimsTexto}
              </p>
            </div>

            <div className="mt-6">
              {/* Los cuatro botones de abajo son los únicos que hay: antes había
                  además un `TopPillTabs` con dos de ellos repetido, lo que dejaba
                  fuera a las otras dos dimensiones. */}
              <DimensionGrid
                items={visibles}
                active={dim}
                expanded={dim !== null}
                onSelect={(slug) =>
                  // Tocar la misma tarjeta otra vez la repliega. `dim === null`
                  // significa «cerrado», así que no hace falta un segundo estado.
                  setDim((actual) => (actual === slug ? null : slug))
                }
              />
              {dim !== null ? <DimensionDetail dim={active} /> : null}

              {bloques.length > 0 ? (
                <div className="mt-8 rounded-2xl border border-stone/70 bg-fog/30 p-5 sm:p-6">
                  <p className="font-display text-[0.7rem] font-semibold tracking-wide text-muted uppercase">
                    {PORTADA.proyecto.accionTitulo}
                  </p>
                  <div className="mt-4">
                    <DimensionGrid
                      items={bloques}
                      active={bloque}
                      expanded={bloque !== null}
                      onSelect={(slug) =>
                        setBloque((actual) => (actual === slug ? null : slug))
                      }
                    />
                    {bloque !== null ? (
                      <DimensionDetail dim={bloqueActivo} />
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
