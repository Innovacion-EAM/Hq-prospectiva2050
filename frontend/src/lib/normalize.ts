/**
 * Normalización defensiva de los campos que el backend devuelve como listas.
 *
 * Las columnas `jsonb` de TypeORM llegan como array, pero un dato guardado
 * antes de una corrección de esquema (o un payload de una versión anterior)
 * puede haber quedado guardado como literal de array de PostgreSQL
 * (`{"a","b"}`) o como JSON en texto. Cualquiera de las tres formas debe
 * terminar normalizada a `string[]` para que los componentes puedan hacer
 * `.map()` sin romperse.
 */

/** Convierte cualquier forma de "lista de cadenas" a `string[]`. */
export function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => (typeof v === "string" ? v : v == null ? "" : String(v)));
  }
  if (typeof value === "string") {
    const raw = value.trim();
    if (!raw) return [];
    // JSON: ["a","b"]  ·  literal de array de PostgreSQL: {"a","b"}
    if (raw.startsWith("[") || raw.startsWith("{")) {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map((v) => (typeof v === "string" ? v : v == null ? "" : String(v)));
        }
      } catch {
        // No es JSON válido: cae al parseo del literal de array de Postgres.
      }
      if (raw.startsWith("{")) {
        return splitPostgresArrayLiteral(raw);
      }
    }
    // Texto plano con saltos de línea: un párrafo por línea.
    return raw.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

/** Divide `{"a","b\\"c"}` respetando comillas y escapes de PostgreSQL. */
function splitPostgresArrayLiteral(raw: string): string[] {
  const inner = raw.slice(1, raw.endsWith("}") ? -1 : undefined);
  const out: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < inner.length; i += 1) {
    const ch = inner[i];
    if (inQuotes) {
      if (ch === "\\") {
        current += inner[i + 1] ?? "";
        i += 1;
        continue;
      }
      if (ch === '"') {
        inQuotes = false;
        continue;
      }
      current += ch;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      out.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) out.push(current);
  return out.map((s) => s.trim()).filter(Boolean);
}

/** Igual que {@link toStringArray} pero conserva la forma de los elementos. */
export function toArray<T>(value: unknown, map: (item: unknown) => T): T[] {
  if (Array.isArray(value)) return value.map(map);
  if (typeof value === "string") {
    const raw = value.trim();
    if (!raw) return [];
    if (raw.startsWith("[") || raw.startsWith("{")) {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(map);
      } catch {
        if (raw.startsWith("{")) return splitPostgresArrayLiteral(raw).map(map);
      }
    }
    return [map(raw)];
  }
  return [];
}
