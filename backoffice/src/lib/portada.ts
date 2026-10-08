/**
 * Colores de los botones de la portada.
 *
 * No son solo del hero: **todos** los botones de la portada eligen de esta misma
 * lista, y por eso el selector de color (`selector-color.tsx`) es un componente
 * aparte y se reutiliza en cada bloque. Deben coincidir, clave por clave, con
 * `COLORES_BOTON` del backend (`backend/src/common/dto.ts`) y del frontend
 * (`frontend/src/data/site.ts`): la clave es lo que viaja por la API, lo que el
 * servidor valida y lo que el frontend traduce a clases. Si se añade un color en
 * un lado y no en el otro, el backend responde 400 al guardar o el botón sale
 * sin fondo.
 */
export const COLORES_BOTON = [
  "lima",
  "lima-oscuro",
  "verde",
  "tinta",
  "convoca",
] as const;

export type ColorBoton = (typeof COLORES_BOTON)[number];

/**
 * Los colores que se pueden elegir para el botón que va **encima de la caja
 * lima** del hero: el «Enviar» de «¿Tienes alguna pregunta…?».
 *
 * Una lista aparte y más corta porque la caja es lima: un botón lima encima de
 * una caja lima es el mismo color con el mismo texto encima, y el botón deja de
 * verse. Los tres que quedan son oscuros y se leen bien ahí y sobre el papel.
 *
 * Tiene que coincidir con `COLORES_BOTON_ENCIMA_LIMA` del backend (lo que valida,
 * en `backend/src/common/dto.ts`) y con `COLORES_BOTON_SOBRE_LIMA` del frontend.
 * Es una restricción del sitio, no una preferencia: por eso no se deja elegir.
 */
export const COLORES_BOTON_SOBRE_LIMA = ["verde", "tinta", "convoca"] as const;

export type ColorBotonSobreLima = (typeof COLORES_BOTON_SOBRE_LIMA)[number];

/**
 * Cómo se llama cada color en el panel, y con qué color se pinta la muestra.
 *
 * La muestra usa el **hex real**, no una clase de Tailwind suelta, para que lo
 * que se ve al elegir sea exactamente lo que va a salir en el sitio. Los valores
 * salen de `@theme` en `frontend/src/index.css`.
 */
export const COLORES_BOTON_NOMBRE: Record<ColorBoton, { texto: string; hex: string }> = {
  lima: { texto: "Lima (el de siempre)", hex: "#c6e85c" },
  "lima-oscuro": { texto: "Lima oscuro", hex: "#b5dc4a" },
  verde: { texto: "Verde oscuro", hex: "#3f6b0e" },
  tinta: { texto: "Tinta (azul oscuro)", hex: "#0b3336" },
  convoca: { texto: "Morado", hex: "#5b2d8a" },
};

/** El color del sitio cuando no hay ninguno guardado. */
export const COLOR_POR_DEFECTO: ColorBoton = "lima";

/**
 * El mismo respaldo, pero para el botón que va sobre la caja lima.
 *
 * Tiene que estar en la lista corta: si cayera a `lima` el botón se vería bien y
 * no se leería nada, que es el peor de los dos fallos posibles.
 */
export const COLOR_POR_DEFECTO_SOBRE_LIMA: ColorBotonSobreLima = "verde";

/**
 * El color de los botones del bloque de contacto.
 *
 * No es lima como el resto: el botón del teléfono y el «Enviar» del formulario
 * estaban escritos en tinta (`bg-[#0c272e]`) en el código, y el frontend sigue
 * cayendo a tinta cuando el campo no viene. Si aquí se pusiera lima, abrir el
 * bloque Contactos en una base vieja y guardar sin tocar los colores los
 * cambiaría de tinta a lima —que es exactamente el cambio que nadie pidió.
 */
export const COLOR_POR_DEFECTO_CONTACTO: ColorBoton = "tinta";

export function esColorBoton(valor: string): valor is ColorBoton {
  return (COLORES_BOTON as readonly string[]).includes(valor);
}

/** Si el color sirve para un botón que va **encima de la caja lima**. */
export function esColorBotonSobreLima(valor: string): valor is ColorBotonSobreLima {
  return (COLORES_BOTON_SOBRE_LIMA as readonly string[]).includes(valor);
}

/**
 * La forma de `home` con todos los campos vacíos.
 *
 * Se usa cuando la API devuelve la portada sin contenido —una base hecha antes de
 * que existiera esta columna— para que el formulario muestre los campos
 * vacíos en vez de romperse con `undefined`. **Todos vacíos a propósito**: vacío
 * significa "usa el texto del sitio", así que el resultado es el mismo que el
 * respaldo, y quien abra el módulo ve de verdad lo que hay guardado en vez de
 * un texto inventado que él no reconoce.
 */
export const PORTADA_VACIA = {
  hero: {
    fondo: "",
    imagen: "",
    botonTexto: "",
    botonColor: COLOR_POR_DEFECTO,
    cajaTitulo: "",
    cajaBotonColor: COLOR_POR_DEFECTO_SOBRE_LIMA,
  },
  proyecto: {
    fondo: "",
    titulo: "",
    texto: "",
    tarjetaBoton: "",
    botonColor: COLOR_POR_DEFECTO,
    dimsTitulo: "",
    dimsTexto: "",
    accionTitulo: "",
  },
  elProyecto: {
    fondo: "",
    titulo: "",
    intro: "",
    parrafoUno: "",
    parrafoDos: "",
    // Tres huecos: las etapas de la página son exactamente tres, y el campo se
    // muestra como tres recuadros. Quien no toca ninguna guarda "", que el
    // sitio resuelve al texto propio hueco por hueco (ver `etapasO`).
    etapas: ["", "", ""],
    // Vacía a propósito, como el resto: una lista vacía significa "usa la del
    // sitio" (`listaO` en el frontend), y el botón de reponer la rellena.
    entidades: [],
  },
  elDimensiones: {
    titulo: "",
    intro: "",
  },
  cobertura: { titulo: "", texto: "" },
  documentos: { titulo: "", texto: "", botonColor: COLOR_POR_DEFECTO },
  repositorio: {
    titulo: "",
    texto: "",
    dashboardBoton: "",
    dashboardColor: COLOR_POR_DEFECTO,
    catalogoBoton: "",
  },
  noticias: {
    titulo: "",
    texto: "",
    botonTexto: "",
    botonColor: COLOR_POR_DEFECTO,
    tarjetaBotonColor: COLOR_POR_DEFECTO,
  },
  contacto: {
    titulo: "",
    texto: "",
    formTitulo: "",
    botonColor: COLOR_POR_DEFECTO_CONTACTO,
    enviarColor: COLOR_POR_DEFECTO_CONTACTO,
  },
  footer: {
    // Vacía a propósito: una lista vacía significa "usa las que trae el sitio"
    // (ver `pickFooter` en el frontend), igual que el menú del encabezado.
    enlaces: [],
    // Vacío a propósito, por el mismo motivo: el sitio cae al texto que trae.
    copyright: "",
  },
} as const;

/**
 * Tope de enlaces del pie. Tiene que coincidir con `@ArrayMaxSize(6)` en
 * `FooterPortadaDto`: sin él, el panel dejaría añadir el séptimo y el guardado
 * moriría con un 400 que no dice cuál fila sobra.
 */
export const MAX_ENLACES_PIE = 6;

/**
 * Tope de entidades aliadas. Tiene que coincidir con `@ArrayMaxSize(30)` en
 * `ElProyectoPortadaDto`: sin él, el panel dejaría añadir la 31 y el guardado
 * moriría con un 400 que no dice cuál fila sobra.
 */
export const MAX_ENTIDADES = 30;

/**
 * La lista de aliadas que trae el sitio, en su orden, **incluida CEPAL**.
 *
 * Es el mismo arreglo que `PORTADA.elProyecto.entidades` del frontend y
 * `SEED_HOME.elProyecto.entidades` del backend. Vive aquí porque el botón
 * «Poner las del sitio» del panel no puede importar de esos paquetes, y porque
 * el formulario vacío (`entidades: []`) significa "usa la del sitio": hace
 * falta un sitio desde el que reponerla sin escribirla a mano.
 *
 * **Si se cambia en uno, hay que cambiarlo en los tres.**
 */
export const ENTIDADES_DEL_SITIO = [
  "Gobernación del Quindío",
  "Alcaldía de Armenia",
  "Universidad del Quindío",
  "Universidad La Gran Colombia",
  "Cámara de Comercio de Armenia y del Quindío",
  "Comité de Cafeteros del Quindío",
  "Comité Intergremial del Quindío",
  "Corporación Autónoma Regional del Quindío",
  "ProQuindío",
  "Comfenalco Quindío",
  "Facilísimo",
  "Empresa de Energía del Quindío",
  "CEPAL — ILPES (acompañamiento técnico)",
] as const;