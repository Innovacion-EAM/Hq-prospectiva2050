import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button, ConfirmButton, IconBtn, Input } from "@/components/ui";
import { ENTIDADES_DEL_SITIO, MAX_ENTIDADES } from "@/lib/portada";
import { cn } from "@/lib/utils";

/** Mueve un elemento de la lista, sin mutar el original. */
function mover(lista: string[], de: number, a: number): string[] {
  if (a < 0 || a >= lista.length) return lista;
  const copia = [...lista];
  const [item] = copia.splice(de, 1);
  copia.splice(a, 0, item);
  return copia;
}

function esLaListaDelSitio(lista: string[]): boolean {
  return (
    lista.length === ENTIDADES_DEL_SITIO.length &&
    lista.every((nombre, i) => nombre === ENTIDADES_DEL_SITIO[i])
  );
}

/**
 * Las entidades aliadas de `/proyecto` (y de la red institucional de
 * `/contactos`), en el orden en que se ven.
 *
 * A diferencia del menú, aquí sí se agrega, se quita y se edita: las aliadas
 * cambian y el panel es el sitio para hacerlo. El «01/02/03» de las etapas no
 * aplica: el orden de esta lista **es** el dato.
 *
 * Una lista vacía significa "usa la del sitio" (ver `listaO` en el frontend),
 * así que el botón de reponer es la salida cuando se borra todo por error,
 * igual que en el menú.
 */
export function EntidadesEditor({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  // Guard: si value no es un array válido, inicializar vacío
  if (!Array.isArray(value)) {
    onChange?.([]);
    return null;
  }
  const realValue = value;
  const puedeReponer = !esLaListaDelSitio(realValue);
  const puedeAgregar = realValue.length < MAX_ENTIDADES;

  return (
    <div className="space-y-3">
      {realValue.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-mist bg-paper px-4 py-6 text-center text-xs text-muted">
          No hay entidades en la lista. Mientras no haya ninguna, el sitio
          muestra las que trae por defecto, así que esto no es lo que ve la
          gente. Con <strong>Poner las del sitio</strong>, abajo, aparecen
          para poder ordenarlas, cambiarlas o quitarlas.
        </p>
      ) : null}

      <ul className="space-y-2">
        {realValue.map((nombre, i) => {
          const esCepal = nombre.toUpperCase().includes("CEPAL");
          return (
            <li
              key={i}
              className={cn(
                "flex items-center gap-3 rounded-2xl border bg-paper px-3 py-2.5 shadow-xs",
                esCepal ? "border-lime bg-lime/20" : "border-mist",
              )}
            >
              <span
                className="grid size-7 shrink-0 place-items-center rounded-full bg-ink font-display text-xs font-bold text-paper"
                aria-hidden="true"
              >
                {i + 1}
              </span>

              <Input
                value={nombre}
                maxLength={160}
                onChange={(e) => {
                  const copia = [...realValue];
                  copia[i] = e.target.value;
                  onChange(copia);
                }}
                placeholder="Nombre de la entidad"
                aria-label={`Entidad ${i + 1}`}
                className="flex-1"
              />

              <span className="flex shrink-0 items-center gap-1">
                <IconBtn
                  label={`Subir ${nombre || `la entidad ${i + 1}`}`}
                  disabled={i === 0}
                  onClick={() => onChange(mover(realValue, i, i - 1))}
                >
                  <ArrowUp className="size-4" />
                </IconBtn>
                <IconBtn
                  label={`Bajar ${nombre || `la entidad ${i + 1}`}`}
                  disabled={i === realValue.length - 1}
                  onClick={() => onChange(mover(realValue, i, i + 1))}
                >
                  <ArrowDown className="size-4" />
                </IconBtn>
                <IconBtn
                  danger
                  label={`Quitar ${nombre || `la entidad ${i + 1}`}`}
                  onClick={() => onChange(realValue.filter((_, j) => j !== i))}
                >
                  <Trash2 className="size-4" />
                </IconBtn>
              </span>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!puedeAgregar}
          onClick={() => onChange([...realValue, ""])}
        >
          <Plus className="size-4" /> Agregar entidad
        </Button>

        {puedeReponer ? (
          <ConfirmButton
            variant="outline"
            label="Poner las entidades del sitio"
            confirmText="¿Cambiar por las entidades del sitio?"
            onConfirm={() => onChange([...ENTIDADES_DEL_SITIO])}
          >
            <RotateCcw className="size-4" /> Poner las del sitio
          </ConfirmButton>
        ) : null}
      </div>

      <p className="text-xs text-muted">
        Hasta {MAX_ENTIDADES}. El orden de esta lista es el de la página. Si el
        nombre incluye «CEPAL», en `/proyecto` se pinta con la caja lima, da
        igual el puesto.
      </p>
    </div>
  );
}
