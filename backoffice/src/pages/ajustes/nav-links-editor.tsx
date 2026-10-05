import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button, Card, CardBody, Divider, Field, IconBtn, Input } from "@/components/ui";
import { ES_ENLACE_VALIDO } from "@/lib/nav-links";
import type { NavLink } from "@/lib/types";

/**
 * Rutas internas del sitio, para no tener que escribirlas a mano.
 *
 * No son un catálogo cerrado: el campo acepta cualquier `/ruta`, y estas solo
 * aparecen como sugerencias. Sirven para lo que más se equivoca, que es el
 * `href`: escribirse `/noticia` en vez de `/noticias` no da ningún error, deja
 * un enlace que no lleva a ninguna parte y solo se nota cuando alguien navega.
 */
const RUTAS_SUGERIDAS = [
  "/",
  "/proyecto",
  "/dimensiones",
  "/documentos",
  "/noticias",
  "/participa",
  "/contactos",
];

/** Mueve un elemento de la lista, sin mutar el original. */
function mover(links: NavLink[], de: number, a: number): NavLink[] {
  if (a < 0 || a >= links.length) return links;
  const copia = [...links];
  const [item] = copia.splice(de, 1);
  copia.splice(a, 0, item);
  return copia;
}

export function NavLinksEditor({
  value,
  onChange,
}: {
  value: NavLink[];
  onChange: (next: NavLink[]) => void;
}) {
  function editar(i: number, cambios: Partial<NavLink>) {
    onChange(value.map((l, j) => (j === i ? { ...l, ...cambios } : l)));
  }

  return (
    <div className="space-y-3">
      {value.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-mist bg-paper px-4 py-6 text-center text-xs text-muted">
          No hay enlaces en el menú. Mientras no haya ninguno, el sitio muestra el
          menú que viene por defecto.
        </p>
      ) : null}

      <ul className="space-y-2">
        {value.map((link, i) => {
          const malHref = link.href.trim() !== "" && !ES_ENLACE_VALIDO.test(link.href.trim());
          return (
            <li
              key={i}
              className="rounded-2xl border border-mist bg-paper p-3 shadow-xs"
            >
              <div className="flex flex-wrap items-start gap-2">
                {/* El número es el orden en pantalla, que es justo lo que se
                    está cambiando: sin él, una lista de siete textos iguales no
                    dice cuál es el primero. */}
                <span
                  className="mt-2 grid size-6 shrink-0 place-items-center rounded-full bg-ink font-display text-[0.65rem] font-bold text-paper"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>

                <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                  <Field label="Texto">
                    <Input
                      value={link.label}
                      onChange={(e) => editar(i, { label: e.target.value })}
                      placeholder="Noticias"
                    />
                  </Field>
                  <Field
                    label="Dirección"
                    hint={malHref ? 'Debe empezar por "/" o por "https://".' : undefined}
                  >
                    <Input
                      value={link.href}
                      onChange={(e) => editar(i, { href: e.target.value })}
                      placeholder="/noticias"
                      // Todas las filas apuntan al mismo `datalist`: es una única
                      // lista de sugerencias para el formulario, no una por fila.
                      list="rutas-del-sitio"
                      aria-invalid={malHref || undefined}
                    />
                  </Field>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <IconBtn
                    label="Subir en la lista"
                    disabled={i === 0}
                    onClick={() => onChange(mover(value, i, i - 1))}
                  >
                    <ArrowUp className="size-4" />
                  </IconBtn>
                  <IconBtn
                    label="Bajar en la lista"
                    disabled={i === value.length - 1}
                    onClick={() => onChange(mover(value, i, i + 1))}
                  >
                    <ArrowDown className="size-4" />
                  </IconBtn>
                  <IconBtn
                    label={`Quitar ${link.label || `el enlace ${i + 1}`}`}
                    onClick={() => onChange(value.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="size-4" />
                  </IconBtn>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* El `list` del último input toma estas rutas. Es una ayuda de escritura,
          no una validación: la lista no obliga a nada. */}
      <datalist id="rutas-del-sitio">
        {RUTAS_SUGERIDAS.map((r) => (
          <option key={r} value={r} />
        ))}
      </datalist>

      <Button
        variant="lime"
        size="md"
        onClick={() => onChange([...value, { label: "", href: "" }])}
      >
        <Plus className="size-4" /> Agregar enlace
      </Button>
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