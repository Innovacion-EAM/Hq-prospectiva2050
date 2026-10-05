import type { NavLink } from "./types";

/** Una dirección de enlace válida: una ruta interna o una dirección completa. */
export const ES_ENLACE_VALIDO = /^(\/|https?:\/\/)/;

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
