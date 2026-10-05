import type { NavLink } from "./types";

/** Una dirección de enlace válida: una ruta interna o una dirección completa. */
export const ES_ENLACE_VALIDO = /^(\/|https?:\/\/)/;

/**
 * El menú que trae el sitio: los siete enlaces de siempre, en su orden.
 *
 * Es una de las tres copias de esta lista que hay en el repositorio, y no es
 * casual: el frontend necesita la suya para poder verse completo sin conexión
 * (`NAV` en `frontend/src/data/site.ts`), el backend necesita la suya para sembrar
 * una instalación nueva (`SEED_SITE` en `backend/src/seed-data.ts`), y esta es la
 * que deja que el panel **devuelva** el menú. Sin ella, borrar los siete enlaces y
 * guardar era un camino sin vuelta atrás desde el panel: el sitio seguía viendo el
 * menú de respaldo y el editor se quedaba vacío, sin forma de reponer nada sin
 * escribirlos a mano uno por uno. Si se cambia en un lado, hay que cambiarla en los tres.
 */
export const MENU_DEL_SITIO: NavLink[] = [
  { label: "Inicio", href: "/" },
  { label: "El proyecto", href: "/proyecto" },
  { label: "Dimensiones", href: "/dimensiones" },
  { label: "Documentos", href: "/documentos" },
  { label: "Noticias", href: "/noticias" },
  { label: "Participa", href: "/participa" },
  { label: "Contáctanos", href: "/contactos" },
];

/**
 * Comprueba la lista de enlaces del encabezado y devuelve el primer problema
 * encontrado, o `null` si todo está bien.
 *
 * Se valida aquí y no solo en el backend porque el backend responde `400`
 * diciendo qué campo falla, sin decir **cuál de los siete** de la lista: sin esto
 * habría que contar filas a mano para encontrar la culpable. El backend sigue
 * validando igual —esto es por la experiencia de quien edita, no en vez de ella—.
 */
export function problemaDeNav(links: NavLink[]): string | null {
  for (let i = 0; i < links.length; i++) {
    const l = links[i];
    const n = i + 1;
    if (!l.label.trim()) return `Falta el texto del enlace ${n}.`;
    if (!l.href.trim()) return `Falta la dirección del enlace ${n} ("${l.label}").`;
    if (!ES_ENLACE_VALIDO.test(l.href.trim())) {
      return `La dirección del enlace ${n} ("${l.label}") debe empezar por "/" o por "https://".`;
    }
  }
  return null;
}

/**
 * Si la lista de la pantalla es exactamente el menú del sitio.
 *
 * Para una sola cosa: no ofrecer "poner el menú del sitio" cuando ya es el que hay,
 * porque ese botón no repondría nada y solo haría ruido.
 */
export function esElMenuDelSitio(links: NavLink[]): boolean {
  if (links.length !== MENU_DEL_SITIO.length) return false;
  return links.every(
    (l, i) => l.label === MENU_DEL_SITIO[i].label && l.href === MENU_DEL_SITIO[i].href,
  );
}
