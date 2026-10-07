import { Field, Select } from "@/components/ui";
import {
  COLORES_BOTON,
  COLORES_BOTON_NOMBRE,
  COLOR_POR_DEFECTO,
  type ColorBoton,
} from "@/lib/portada";

/**
 * El selector de color de un botón de la portada.
 *
 * Es un componente aparte porque **todos** los botones de la portada lo usan: el
 * del hero, el «Enviar» de la caja de sugerencias, el de cada tarjeta del
 * proyecto, el de cada categoría de documentos, el «Ver todas», el de cada
 * tarjeta de noticias, el del teléfono y el del formulario de contacto. Con el
 * `Select` escrito dentro de cada tarjeta, el cuarto botón acababa con una
 * variante del cuarto, y al cambiar la lista de colores había que acordarse de
 * los ocho sitios.
 *
 * No es un selector de color libre sino una lista cerrada, y la muestra usa el
 * **hex real** (`COLORES_BOTON_NOMBRE`), no una clase suelta de Tailwind: lo que
 * se ve al elegir tiene que ser lo que va a salir en el sitio. La razón de que la
 * lista sea corta está en el backend y en `portada-colores.ts`: cada color
 * viene con el texto que sí contrasta con él, y con un selector libre se podía
 * elegir un fondo claro con la letra oscura encima y quedaría ilegible sin que
 * nada lo avisara.
 *
 * `lista` existe para el botón que va **encima de la caja lima** del hero: ahí no
 * se ofrecen los dos lima porque se fundirían con la caja, y el backend lo
 * rechaza. Al no venir `lista`, el selector usa la completa.
 */
export function SelectorColor({
  valor,
  onChange,
  etiqueta,
  hint,
  lista,
  respaldo,
}: {
  /** Lo que hay guardado. Si no es un color de la lista, se ve el de siempre. */
  valor: string;
  onChange: (color: ColorBoton) => void;
  /** Qué botón se está pintando: "Color del botón", "Color del botón del…". */
  etiqueta: string;
  hint?: string;
  /**
   * Los colores que se ofrecen. Por defecto, la lista completa de la portada.
   * Pásala solo cuando el botón va sobre un fondo del mismo color (la caja lima).
   */
  lista?: readonly ColorBoton[];
  /** A qué color cae si lo guardado no está en `lista`. */
  respaldo?: ColorBoton;
}) {
  const colores = lista ?? COLORES_BOTON;
  const porDefecto = respaldo ?? COLOR_POR_DEFECTO;
  // Un color que es válido en general pero **no** en esta lista también tiene que
  // caer al respaldo: si el selector lo dejara puesto y mandara `lima` sobre la
  // caja lima, el backend lo rechazaría y el editor no sabría por qué.
  const elegido = colores.includes(valor as ColorBoton)
    ? (valor as ColorBoton)
    : colores.includes(porDefecto)
      ? porDefecto
      : colores[0];

  return (
    <Field label={etiqueta} hint={hint}>
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="size-6 shrink-0 rounded-full ring-1 ring-ink/15"
          style={{ backgroundColor: COLORES_BOTON_NOMBRE[elegido].hex }}
        />
        <Select value={elegido} onChange={(e) => onChange(e.target.value as ColorBoton)}>
          {colores.map((c) => (
            <option key={c} value={c}>
              {COLORES_BOTON_NOMBRE[c].texto}
            </option>
          ))}
        </Select>
      </div>
    </Field>
  );
}
