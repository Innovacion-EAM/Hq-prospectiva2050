import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Año legible: `2020`, `Sin año` cuando viene null. */
export function yearLabel(anio: number | null | undefined): string {
  return anio ? String(anio) : "Sin año";
}

/** Primeras letras de un autor para el avatar de reseña. */
export function initials(nombre: string | null | undefined): string {
  const clean = (nombre ?? "").trim();
  if (!clean) return "?";
  return clean
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

/** Conteo formateado con separador de miles. */
export function nf(n: number): string {
  return new Intl.NumberFormat("es-CO").format(n);
}