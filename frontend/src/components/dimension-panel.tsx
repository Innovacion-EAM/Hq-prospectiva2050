import { Link } from "react-router-dom";
import {
  BookOpen,
  Lightbulb,
  Megaphone,
  Share2,
  Smartphone,
  Sprout,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart as RLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Dimension } from "@/data/site";
import { cn } from "@/lib/utils";

/**
 * Icono por slug. Antes la lista de tarjetas estaba fija en el código (con los
 * 8 títulos viejos); ahora se arma desde los datos del backend, así que si se
 * agrega o renombra una dimensión no hay que tocar dos archivos.
 */
const ICONOS: Record<string, LucideIcon> = {
  "politico-institucional": Target,
  "economica-productiva": TrendingUp,
  "fisico-ambiental": Lightbulb,
  "socio-cultural": Share2,
  misiones: Megaphone,
  retos: Sprout,
  iniciativas: BookOpen,
  hallazgos: Smartphone,
};

const ICONO_POR_DEFECTO = Target;

export function iconoDe(slug: string): LucideIcon {
  return ICONOS[slug] ?? ICONO_POR_DEFECTO;
}

export function DimensionGrid({
  active,
  onSelect,
  items,
  expanded = false,
}: {
  active: string | null;
  onSelect: (slug: string) => void;
  items: Dimension[];
  expanded?: boolean;
}) {
  return (
    // 2x2 fijo. Antes era `sm:grid-cols-2 lg:grid-cols-3`: con cuatro
    // dimensiones la última se quedaba sola en una fila de tres, y encima había
    // otros dos botones arriba que solo cubrían dos de las cuatro. Ahora la
    // grilla cuadra con el número de dimensiones y es la única que hay.
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const Icon = iconoDe(item.slug);
        const on = item.slug === active;
        return (
          <button
            key={item.slug}
            type="button"
            onClick={() => onSelect(item.slug)}
            // Semántica según de dónde se use la grilla: en el home el botón
            // despliega y repliega la ficha (`expanded`), así que se anuncia
            // como disparador de contenido. En /dimensiones la ficha está siempre
            // abierta y el botón solo cambia cuál es, así que se anuncia como
            // selección. Antes esto era un `tablist` de dos elementos que no
            // cubría las cuatro dimensiones; ya no hay pestañas que exponer.
            aria-pressed={expanded === undefined ? on : undefined}
            aria-expanded={expanded === undefined ? undefined : on && expanded}
            className={cn(
              "flex items-center justify-between gap-3 rounded-xl border p-4 text-left transition-all duration-200 min-h-[4.5rem]",
              on
                ? "border-lime bg-fog shadow-xs"
                : "border-stone/80 bg-paper text-ink hover:border-lime-hot/50 hover:bg-fog/50",
            )}
          >
            <span className="font-display text-xs font-semibold text-ink sm:text-[0.8rem]">
              {item.title}
            </span>
            <span
              aria-hidden="true"
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-full border transition-colors",
                on
                  ? "border-lime-hot bg-lime text-ink"
                  : "border-lime-hot/50 bg-paper text-lime-ink",
              )}
            >
              <Icon className="size-4" strokeWidth={1.8} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

function yearsOf(dim: Dimension) {
  return dim.charts[0]?.data.map((d) => d.year) ?? [];
}

function chartRows(dim: Dimension) {
  return yearsOf(dim).map((year) => {
    const row: Record<string, string | number> = { year };
    for (const s of dim.charts) {
      const point = s.data.find((d) => d.year === year);
      row[s.name] = point?.value ?? 0;
    }
    return row;
  });
}

export function DimensionDetail({ dim }: { dim: Dimension }) {
  const rows = chartRows(dim);
  const tieneGraficas = dim.charts.length > 0;
  return (
    // La `key` remonta toda la ficha al cambiar de dimensión: sin ella, recharts
    // conserva el `ResponsiveContainer` del anterior y la gráfica de la nueva no
    // se dibuja hasta el primer re-render (pasar el mouse por encima).
    <div
      key={dim.slug}
      className="mt-8 animate-[fade-in_400ms_var(--ease-out)] rounded-2xl border border-stone bg-fog/40 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h3 className="font-display text-lg font-bold text-ink sm:text-xl">{dim.title}</h3>
        <Link
          to={`/dimensiones/${dim.slug}`}
          className="font-display text-xs font-semibold text-lime-ink no-underline hover:underline"
        >
          Ver ficha completa
        </Link>
      </div>
      <p className="mt-2 max-w-3xl text-xs text-muted sm:text-sm">{dim.summary}</p>

      {tieneGraficas ? (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {dim.charts.map((s) => (
            <div key={s.name} className="min-w-0 rounded-xl border border-stone bg-paper p-3">
              <p className="mb-2 font-display text-[0.7rem] font-semibold tracking-wide text-muted uppercase">
                {s.name}
              </p>
              <div className="h-32">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  // Sin esto, la gráfica nace con ancho 0 hasta que recharts mide
                  // el contenedor (o el usuario mueve el mouse). Con una medida
                  // inicial pinta desde el primer frame y luego se ajusta.
                  initialDimension={{ width: 480, height: 128 }}
                >
                  <RLine data={rows} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke="#cfd6d4" strokeDasharray="3 3" />
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#5c7072" }} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#5c7072" }} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #e6eae8",
                        fontSize: 12,
                      }}
                    />
                    {dim.charts.map((series) => (
                      <Line
                        key={series.name}
                        type="monotone"
                        dataKey={series.name}
                        stroke={series.color}
                        strokeWidth={series.name === s.name ? 2.4 : 1.2}
                        dot={{ r: 3, strokeWidth: 0, fill: series.color }}
                        opacity={series.name === s.name ? 1 : 0.35}
                      />
                    ))}
                  </RLine>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // El documento de arquitectura no aporta series numéricas para estas
        // dimensiones, así que no hay gráfica que dibujar. Antes se dibujaba una
        // con datos inventados; ahora se muestra el contenido textual real.
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {dim.body.length > 0 ? (
            <div className="space-y-3">
              {dim.body.map((p) => (
                <p key={p.slice(0, 32)} className="text-sm leading-relaxed text-body">
                  {p}
                </p>
              ))}
            </div>
          ) : null}
          {dim.layers.length > 0 ? (
            <div>
              <p className="font-display text-[0.7rem] font-semibold tracking-wide text-muted uppercase">
                {dim.tipo === "bloque" ? "Contenido" : "Líneas de trabajo"}
              </p>
              <ul className="mt-2 space-y-1.5">
                {dim.layers.map((l) => (
                  <li key={l} className="flex gap-2 text-sm text-body">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-lime-hot" />
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
