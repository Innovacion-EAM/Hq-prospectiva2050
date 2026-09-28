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

export function TopPillTabs({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (slug: string) => void;
}) {
  const isPol = active === "politico-institucional";
  const isEco = active === "economica-productiva";

  return (
    // Es un patrón de pestañas: un conjunto de botones que cambian qué contenido
    // se muestra debajo. Con `role="tablist"` y `aria-selected`, un lector de
    // pantalla anuncia «pestaña 1 de 2, seleccionada». Antes eran botones sueltos
    // y la relación entre el botón y el contenido solo se entendía mirando la
    // página.
    <div
      role="tablist"
      aria-label="Dimensiones del ejercicio"
      className="flex flex-wrap items-center gap-3"
    >
      {/* Tab 1: Dimensión político-institucional */}
      <button
        type="button"
        role="tab"
        aria-selected={isPol}
        onClick={() => onSelect("politico-institucional")}
        className={cn(
          "flex items-center gap-3 rounded-pill px-4 py-2 font-display text-xs font-semibold transition-all duration-200",
          isPol
            ? "bg-[#cfd6d4] text-ink shadow-xs"
            : "border border-stone bg-paper text-muted hover:bg-fog",
        )}
      >
        <span>Dimensión político-institucional</span>
        {/* Los iconos repiten lo que ya dice el texto de al lado, así que se
            ocultan: si no, el lector de pantalla lo lee dos veces. */}
        <span
          aria-hidden="true"
          className={cn(
            "grid size-7 place-items-center rounded-full transition-colors",
            isPol ? "bg-paper text-ink" : "border border-stone bg-paper text-lime-ink",
          )}
        >
          <Target className="size-4" />
        </span>
      </button>

      {/* Tab 2: Dimensión económico-productiva */}
      <button
        type="button"
        role="tab"
        aria-selected={isEco}
        onClick={() => onSelect("economica-productiva")}
        className={cn(
          "flex items-center gap-3 rounded-pill px-4 py-2 font-display text-xs font-semibold transition-all duration-200",
          isEco
            ? "bg-[#cfd6d4] text-ink shadow-xs"
            : "border border-stone bg-paper text-lime-ink hover:bg-fog",
        )}
      >
        <span>Dimensión económico-productiva</span>
        <span
          aria-hidden="true"
          className={cn(
            "grid size-7 place-items-center rounded-full transition-colors",
            isEco ? "bg-paper text-ink" : "border border-lime-hot/40 bg-paper text-lime-ink",
          )}
        >
          <TrendingUp className="size-4" />
        </span>
      </button>
    </div>
  );
}

export function DimensionGrid({
  active,
  onSelect,
  items,
}: {
  active: string;
  onSelect: (slug: string) => void;
  items: Dimension[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const Icon = iconoDe(item.slug);
        const on = item.slug === active;
        return (
          <button
            key={item.slug}
            type="button"
            onClick={() => onSelect(item.slug)}
            className={cn(
              "flex items-center justify-between rounded-xl border p-4 text-left transition-all duration-200 min-h-[4.5rem]",
              on
                ? "border-lime bg-fog shadow-xs"
                : "border-stone/80 bg-paper text-ink hover:border-lime-hot/50 hover:bg-fog/50",
            )}
          >
            <span className="font-display text-xs font-semibold text-ink sm:text-[0.8rem]">
              {item.title}
            </span>
            <span
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
    <div className="mt-8 animate-[fade-in_400ms_var(--ease-out)] rounded-2xl border border-stone bg-fog/40 p-5 sm:p-6">
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
            <div key={s.name} className="rounded-xl border border-stone bg-paper p-3">
              <p className="mb-2 font-display text-[0.7rem] font-semibold tracking-wide text-muted uppercase">
                {s.name}
              </p>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
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
