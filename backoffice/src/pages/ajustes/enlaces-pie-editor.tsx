import { ArrowDown, ArrowUp, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmButton, IconBtn, Spinner } from "@/components/ui";
import { collections, useCollection } from "@/lib/data";
import { MAX_ENLACES_PIE } from "@/lib/portada";
import type { NavLink, PaginaProyecto } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Mueve un elemento de la lista, sin mutar el original. */
function mover(lista: NavLink[], de: number, a: number): NavLink[] {
  if (a < 0 || a >= lista.length) return lista;
  const copia = [...lista];
  const [item] = copia.splice(de, 1);
  copia.splice(a, 0, item);
  return copia;
}

/**
 * La columna de «El proyecto» del pie de página.
 *
 * A diferencia del menú del encabezado, aquí no se escribe texto libre: se elige
 * de las páginas que ya existen en Configuración → Proyecto. Un enlace escrito a
 * mano puede llevar a una página que no existe y no hay ningún error que avise
 * hasta que alguien pulsa; eligiendo de la lista, el href y el rótulo salen
 * siempre de la misma página y no pueden descuadrarse.
 *
 * La selección es una lista con orden: la columna pinta los enlaces de arriba a
 * abajo, así que marcar una página la añade al final y las flechas la mueven.
 * Sin selección, el sitio muestra las páginas que trae por defecto (lo mismo
 * que el menú con la lista vacía), y el botón de reponer es la salida para
 * cuando se desmarca todo por error.
 *
 * Las páginas llegan de la API y no de un catálogo local a propósito: si algún
 * día se agrega una página nueva, aparece aquí sola, sin tocar el panel.
 */
export function EnlacesPieEditor({
  value,
  onChange,
}: {
  value: NavLink[];
  onChange: (next: NavLink[]) => void;
}) {
  const { items: paginas, loading } = useCollection(collections.paginas());

  const hrefs = value.map((l) => l.href);

  function alternar(pagina: PaginaProyecto) {
    const href = `/proyecto/${pagina.slug}`;
    if (hrefs.includes(href)) {
      onChange(value.filter((l) => l.href !== href));
      return;
    }
    if (value.length >= MAX_ENLACES_PIE) {
      toast.error(`La columna admite máximo ${MAX_ENLACES_PIE} enlaces. Quita uno para agregar otro.`);
      return;
    }
    onChange([...value, { label: pagina.title, href }]);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted">
        <Spinner className="size-4" /> Cargando las páginas de «El proyecto»…
      </div>
    );
  }

  // Los enlaces guardados que ya no corresponden a ninguna página de la lista
  // (la página se borró después de elegirla): se muestran aparte para poder
  // quitar el fantasma, en vez de dejarlo dentro de la lista normal.
  const huerfanos = value.filter((l) => !paginas.some((p) => `/proyecto/${p.slug}` === l.href));
  const tieneHuerfanos = huerfanos.length > 0;

  return (
    <div className="space-y-3">
      {value.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-mist bg-paper px-4 py-6 text-center text-xs text-muted">
          Ningún enlace elegido. Mientras no haya ninguno, el pie muestra las
          páginas de «El proyecto» que trae el sitio, así que esto no es lo que
          ve la gente. Con <strong>Poner las del sitio</strong>, abajo, quedan
          marcadas para poder ordenarlas o quitarlas.
        </p>
      ) : null}

      <ul className="space-y-2">
        {paginas.map((pagina) => {
          const href = `/proyecto/${pagina.slug}`;
          const i = hrefs.indexOf(href);
          const elegida = i >= 0;
          return (
            <li
              key={pagina.id}
              className={cn(
                "flex items-center gap-3 rounded-2xl border bg-paper px-3 py-2.5 shadow-xs",
                elegida ? "border-lime bg-lime/15" : "border-mist",
              )}
            >
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={elegida}
                  disabled={!elegida && value.length >= MAX_ENLACES_PIE}
                  onChange={() => alternar(pagina)}
                  className="size-4 accent-[#c6e85c]"
                />
                <span className="truncate text-sm text-ink">
                  {pagina.title}
                  <span className="ml-2 font-mono text-[0.65rem] text-muted">{href}</span>
                </span>
              </label>

              {elegida ? (
                <span className="flex shrink-0 items-center gap-1">
                  <IconBtn
                    label={`Ordenar ${pagina.title} antes`}
                    disabled={i === 0}
                    onClick={() => onChange(mover(value, i, i - 1))}
                  >
                    <ArrowUp className="size-4" />
                  </IconBtn>
                  <IconBtn
                    label={`Ordenar ${pagina.title} después`}
                    disabled={i === value.length - 1}
                    onClick={() => onChange(mover(value, i, i + 1))}
                  >
                    <ArrowDown className="size-4" />
                  </IconBtn>
                  <IconBtn
                    danger
                    label={`Quitar ${pagina.title}`}
                    onClick={() => onChange(value.filter((l) => l.href !== href))}
                  >
                    <Trash2 className="size-4" />
                  </IconBtn>
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>

      {tieneHuerfanos ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-ink">
            Páginas que ya no existen en «El proyecto»
          </p>
          <ul className="space-y-2">
            {huerfanos.map((enlace) => (
              <li
                key={enlace.href}
                className="flex items-center gap-3 rounded-2xl border border-dashed border-rose-300 bg-rose-50 px-3 py-2.5"
              >
                <span className="min-w-0 flex-1 truncate text-sm text-ink">
                  {enlace.label}
                  <span className="ml-2 font-mono text-[0.65rem] text-muted">{enlace.href}</span>
                </span>
                <IconBtn
                  danger
                  label={`Quitar ${enlace.label}`}
                  onClick={() => onChange(value.filter((l) => l.href !== enlace.href))}
                >
                  <Trash2 className="size-4" />
                </IconBtn>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Siempre visible, también con la lista vacía: es la salida para cuando
          se desmarca todo por error (el sitio volvería a mostrar las por
          defecto, pero sin esto no habría forma de ordenarlas ni quitarlas). */}
      <div className="flex flex-wrap gap-2">
        <ConfirmButton
          variant="outline"
          label="Poner las del sitio"
          confirmText="¿Cambiar por las páginas que trae el sitio?"
          onConfirm={() =>
            onChange(
              paginas
                .slice(0, MAX_ENLACES_PIE)
                .map((p) => ({ label: p.title, href: `/proyecto/${p.slug}` })),
            )
          }
        >
          <RotateCcw className="size-4" /> Poner las del sitio
        </ConfirmButton>
      </div>

      <p className="text-xs text-muted">
        Hasta {MAX_ENLACES_PIE}. El orden de la lista es el del pie, de arriba a
        abajo. Las otras tres columnas del pie (mapa del sitio, dimensiones y
        aviso legal) son fijas y no se eligen aquí.
      </p>
    </div>
  );
}