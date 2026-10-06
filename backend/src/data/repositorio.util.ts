/**
 * Utilidades compartidas del repositorio.
 *
 * La semilla (`repositorio-seed.ts`) ya viene normalizada, pero el importador
 * recibe archivos CSV hechos a mano o exportados del Excel original, así que
 * esta normalización se aplica en el importador y no en los datos precocidos.
 *
 * Las funciones son puras a propósito: probables y sin estado.
 */

/** Mapeo de los textos de la columna "Dimensión" del Excel a los slugs de `config_dimensiones`. */
const DIMENSION_BY_TEXT: Record<string, string> = {
  'Dimensión físico - Ambiental': 'fisico-ambiental',
  'Dimensión Físico-ambiental': 'fisico-ambiental',
  'Dimensión económico - Productiva': 'economica-productiva',
  'Dimensión Económico-productivo': 'economica-productiva',
  'Dimensión político - Institucional': 'politico-institucional',
  'Dimensión Político-institucional': 'politico-institucional',
  'Dimensión socio - Cultural': 'socio-cultural',
  'Dimensión Socio-cultural': 'socio-cultural',
};

/** Slugs válidos de `config_dimensiones` (para validar, no adivinar). */
export const DIMENSION_SLUGS = [
  'fisico-ambiental',
  'economica-productiva',
  'politico-institucional',
  'socio-cultural',
] as const;

/** Normaliza un texto de dimensión del Excel a slug, o devuelve null. */
function toDimensionSlug(raw: string | null | undefined): string | null {
  const text = (raw ?? '').trim();
  if (!text) return null;
  return DIMENSION_BY_TEXT[text] ?? null;
}

/** Un año aislado, o null cuando el original no trae fecha. */
function toAnio(raw: string | null | undefined): number | null {
  const text = (raw ?? '').trim();
  if (!text || text.toUpperCase() === 'NA') return null;
  if (/^\d{4}$/.test(text)) return Number(text);
  const parts = text.split('/');
  if (parts.length === 3) {
    const year = Number(parts[2]);
    if (Number.isInteger(year) && year > 1000) return year;
  }
  return null;
}

/**
 * Normaliza la URL del link.
 *
 * Los enlaces de Google Drive (`drive.google.com/file/d/<ID>/view…`) se
 * convierten a la URL de descarga directa, para que el botón "Descargar"
 * descargue el archivo en vez de abrir la vista previa de Drive. Los de
 * docs.google.com (presentaciones, hojas de cálculo) y las webs externas se
 * dejan tal cual.
 *
 * Un texto que no parezca URL (la fila 247 del Excel traía el nombre de un
 * archivo) devuelve null: se marca como "Enlace pendiente" en la UI.
 */
function toLink(raw: string | null | undefined): string | null {
  const url = (raw ?? '').trim();
  if (!url || !/^https?:\/\//.test(url)) return null;
  const fileId = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
  if (fileId?.[1]) {
    return `https://drive.google.com/uc?export=download&id=${fileId[1]}`;
  }
  return url;
}

/**
 * Normaliza una fila cruda de CSV a los campos del ítem.
 *
 * Devuelve null con el motivo cuando la fila no es importable (falta el título,
 * por ejemplo) para que el importador lo reporte con `{ fila, motivo }`.
 */
export function normalizarFilaRepositorio(
  raw: Record<string, string>,
  fila: number,
): { item: ImportableRepositorioItem } | { error: string } {
  const titulo = (raw.titulo ?? '').trim();
  if (!titulo) {
    return { error: 'falta el título del documento' };
  }

  const dimension = toDimensionSlug(raw.dimension);

  return {
    item: {
      codigo: raw.codigo ? Number(raw.codigo) : undefined,
      titulo,
      autor: (raw.autor ?? '').trim() || null,
      anio: toAnio(raw.anio),
      tipo: (raw.tipo ?? '').trim() || 'General',
      delimitacion: (raw.delimitacion ?? '').trim() || null,
      formato: (raw.formato ?? '').trim() || 'Otro',
      dimension,
      link: toLink(raw.link),
    },
  };
}

export interface ImportableRepositorioItem {
  codigo?: number;
  titulo: string;
  autor: string | null;
  anio: number | null;
  tipo: string;
  delimitacion: string | null;
  formato: string;
  dimension: string | null;
  link: string | null;
}

/** Normaliza y valida un slug de dimensión conocido, o null. */
export function validarDimension(raw: string | null | undefined): string | null {
  return toDimensionSlug(raw);
}