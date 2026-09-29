import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea una fecha de la base como fecha local.
 *
 * Lo que importa aquí es cómo se arma el `Date`. Una cadena de solo día
 * (`"2026-09-29"`, que es lo que devuelve una columna `date`) la interpreta
 * `new Date()` como **medianoche UTC**, y al imprimirla con
 * `toLocaleDateString`, que usa la zona del navegador, en Colombia (UTC-5) esa
 * medianoche ya es el día anterior: lo escrito hoy se veía como ayer, y el
 * mensaje recién enviado parecía venir de un día que no había llegado. Por eso
 * se le pega la hora local antes de construir la fecha: la columna es un día
 * del calendario, no un instante, y hay que leerla como tal.
 *
 * Las cadenas con hora (ISO completo) se dejan como están: ahí sí importa el
 * instante.
 */
export function formatFechaLocal(iso: string): string {
  if (!iso) return "—";
  const soloDia = /^\d{4}-\d{2}-\d{2}$/.test(iso);
  const d = soloDia ? new Date(`${iso}T00:00:00`) : new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}