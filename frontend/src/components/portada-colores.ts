import type { ColorBoton } from "@/data/site";

/**
 * Los colores de los botones de la portada, con su texto ya emparejado.
 *
 * La clave es lo que viaja por la API y lo que el backend valida (tiene que
 * coincidir con `COLORES_BOTON` de los dos lados); las clases son solo de
 * presentación. Los usa **todo** botón de la portada que tenga color editable
 * desde el panel, no solo el del hero: por eso se llama `clasesBoton` y no
 * `clasesBotonHero`.
 *
 * Cada color viene con el color de texto que **sí** contrasta con él, medido:
 *
 *   - `lima`        fondo `#c6e85c`, texto `#1c3334` → 9,60:1
 *   - `lima-oscuro` fondo `#b5dc4a`, texto `#1c3334` → 8,86:1
 *   - `verde`       fondo `#3f6b0e`, texto blanco     → 6,32:1
 *   - `tinta`       fondo `#0b3336`, texto blanco     → 15,3:1
 *   - `convoca`     fondo `#5b2d8a`, texto blanco     → 8,6:1
 *
 * Todos por encima del 4,5:1 que pide WCAG AA para texto normal. Por eso la
 * lista es corta y cerrada: con un selector libre de color se podía elegir un
 * fondo claro con la letra oscura encima y quedaría ilegible sin que nada lo
 * avisara.
 */
export const COLOR_BOTON: Record<ColorBoton, string> = {
  lima: "bg-lime text-lime-fg hover:bg-lime-deep",
  "lima-oscuro": "bg-lime-deep text-lime-fg hover:bg-lime",
  verde: "bg-lime-btn text-paper hover:bg-lime-ink",
  tinta: "bg-ink text-paper hover:bg-ink-deep",
  convoca: "bg-convoca text-paper hover:brightness-110",
};

/**
 * Las clases del botón con el color elegido.
 *
 * Si la clave no está en el mapa se cae al lima. Es la red de seguridad del
 * lado del cliente: `pickPortada` ya comprueba que la clave sea una de la
 * lista, pero si mañana se añade un color al backend y se olvida añadirlo aquí,
 * esto evita que el botón se quede sin fondo en vez de verse con el de siempre.
 */
export function clasesBoton(color: ColorBoton): string {
  return COLOR_BOTON[color] ?? COLOR_BOTON.lima;
}

/**
 * Los colores cuyo fondo es claro.
 *
 * Solo se usa para lo que va **dentro** del botón (el círculo del icono del
 * teléfono, por ejemplo). Un elemento claro dentro de un botón claro desaparece,
 * y con el color editable eso ya no depende de que nadie se acuerde: basta elegir
 * `lima` para que el icono quede lima sobre lima.
 */
const CLAROS: ReadonlySet<ColorBoton> = new Set<ColorBoton>(["lima", "lima-oscuro"]);

/**
 * Las clases del adorno que va dentro de un botón: el círculo del icono.
 *
 * Si el botón es claro, el adorno se pone oscuro (y al revés). Se decide por la
 * lista de colores claros en vez de por una regla de CSS, porque el color del
 * botón lo elige el editor y no hay forma de preguntarle a Tailwind "ponte el
 * contrario de lo que hay detrás".
 */
export function adornoBoton(color: ColorBoton): string {
  const clave = COLOR_BOTON[color] ? color : "lima";
  return CLAROS.has(clave) ? "bg-ink text-lime" : "bg-lime text-ink";
}