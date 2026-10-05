import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, RotateCcw } from "lucide-react";
import { Card, CardBody, ConfirmButton, Divider, IconBtn } from "@/components/ui";
import { MENU_DEL_SITIO, esElMenuDelSitio } from "@/lib/nav-links";
import type { NavLink } from "@/lib/types";

/** Mueve un elemento de la lista, sin mutar el original. */
function mover(links: NavLink[], de: number, a: number): NavLink[] {
  if (a < 0 || a >= links.length) return links;
  const copia = [...links];
  const [item] = copia.splice(de, 1);
  copia.splice(a, 0, item);
  return copia;
}

/**
 * Los enlaces del menú, en el orden en que se ven.
 *
 * Es solo una lista para **cambiar el orden**: no se agrega, no se quita y no se
 * edita. Los enlaces del menú son las páginas del sitio, y esa lista ya vive en
 * un solo sitio (`MENU_DEL_SITIO`); abrirla para escribirla a mano era la forma
 * más fácil de dejar un enlace con la ruta mal escrita, que no da ningún error
 * hasta que alguien navega y no llega a ninguna parte.
 *
 * Lo único editable es el orden, que es lo que el sitio necesita y lo que aquí
 * tiene sentido cambiar. Si alguna vez hace falta una entrada más —otra página
 * del sitio, o un enlace externo— se agrega a `MENU_DEL_SITIO` y la fila sale
 * sola.
 */
export function NavLinksEditor({
  value,
  onChange,
}: {
  value: NavLink[];
  onChange: (next: NavLink[]) => void;
}) {
  // Se esconde el botón de reponer cuando la lista ya *es* el menú del sitio:
  // ahí no repone nada. Con una lista vacía, o con una distinta, es la salida.
  const puedeReponer = !esElMenuDelSitio(value);

  return (
    <div className="space-y-3">
      {value.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-mist bg-paper px-4 py-6 text-center text-xs text-muted">
          No hay enlaces en el menú. Mientras no haya ninguno, el sitio muestra el
          menú que viene por defecto, así que esta lista no es lo que ve la gente.
          Con <strong>Poner el menú del sitio</strong>, abajo, aparecen los siete
          para poder ordenarlos.
        </p>
      ) : null}

      <ul className="space-y-2">
        {value.map((link, i) => (
          <li
            key={i}
            className="flex items-center gap-3 rounded-2xl border border-mist bg-paper px-3 py-2.5 shadow-xs"
          >
            {/* El número es el orden en pantalla, que es justo lo que se está
                cambiando: sin él, una lista de siete textos parecidos no dice
                cuál es el primero. */}
            <span
              className="grid size-7 shrink-0 place-items-center rounded-full bg-ink font-display text-xs font-bold text-paper"
              aria-hidden="true"
            >
              {i + 1}
            </span>

            <span className="min-w-0 flex-1">
              {/* Una fila sin texto o sin dirección se puede haber guardado antes
                  de que existiera esta pantalla. Se dice en rojo en vez de
                  dejar un hueco en blanco, que es lo que se ve si solo se pone
                  el texto. */}
              <span className="block truncate text-sm font-medium text-ink">
                {link.label || <span className="text-rose-600">Sin texto</span>}
              </span>
              <span className="block truncate font-mono text-[0.7rem] text-muted">
                {link.href || <span className="text-rose-600">Sin dirección</span>}
              </span>
            </span>

            <span className="flex shrink-0 items-center gap-1">
              <IconBtn
                label={`Subir ${link.label || `el enlace ${i + 1}`}`}
                disabled={i === 0}
                onClick={() => onChange(mover(value, i, i - 1))}
              >
                <ArrowUp className="size-4" />
              </IconBtn>
              <IconBtn
                label={`Bajar ${link.label || `el enlace ${i + 1}`}`}
                disabled={i === value.length - 1}
                onClick={() => onChange(mover(value, i, i + 1))}
              >
                <ArrowDown className="size-4" />
              </IconBtn>
            </span>
          </li>
        ))}
      </ul>

      {/* Repone los siete enlaces del sitio en su orden. Pide dos clics porque
          descarta lo que haya en la lista: es un "volver atrás" para cuando la
          lista se vació o quedó a medias, no un atajo. No guarda —eso lo hace
          el botón de guardar los ajustes, como todo lo demás—, así que se puede
          reponer y luego ordenar. */}
      {puedeReponer ? (
        <ConfirmButton
          variant="outline"
          label="Poner el menú del sitio"
          confirmText="¿Cambiar por el menú del sitio?"
          onConfirm={() => onChange(MENU_DEL_SITIO.map((l) => ({ ...l })))}
        >
          <RotateCcw className="size-4" /> Poner el menú del sitio
        </ConfirmButton>
      ) : null}
    </div>
  );
}

/** Tarjeta de un módulo de ajustes, para que todos se vean iguales. */
export function ModuloCard({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion?: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardBody className="space-y-6">
        <Divider label={titulo} />
        {descripcion ? <p className="-mt-2 text-xs text-muted">{descripcion}</p> : null}
        {children}
      </CardBody>
    </Card>
  );
}