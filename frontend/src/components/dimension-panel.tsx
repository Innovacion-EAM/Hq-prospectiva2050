import { Link } from "react-router-dom";
import {
  BookOpen,
  Lightbulb,
  Megaphone,
  Share2,
  Smartphone,
  Sprout,
  Target,
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

const GRID_ITEMS: {
  slug: string;
  title: string;
  icon: LucideIcon;
}[] = [
  {
    slug: "fisico-ambiental",
    title: "Dimensión Físico - Ambiental",
    icon: Lightbulb,
  },
  {
    slug: "socio-cultural",
    title: "Dimensión Socio - Cultural",
    icon: Share2,
  },
  {
    slug: "misiones",
    title: "Misiones del proceso",
    icon: Megaphone,
  },
  {
    slug: "retos",
    title: "Ruta del proceso",
    icon: Sprout,
  },
  {
    slug: "iniciativas",
    title: "Iniciativas y fichas por Dimensión",
    icon: BookOpen,
  },
  {
    slug: "hallazgos",
    title: "Hoja de ruta y tendencias",
    icon: Smartphone,
  },
];

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
    <div className="flex flex-wrap items-center gap-3">
      {/* Tab 1: Dimensión político Institucional */}
      <button
        type="button"
        onClick={() => onSelect("politico-institucional")}
        className={cn(
          "flex items-center gap-3 rounded-pill px-4 py-2 font-display text-xs font-semibold transition-all duration-200",
          isPol
            ? "bg-[#cfd6d4] text-ink shadow-xs"
            : "border border-stone bg-paper text-muted hover:bg-fog",
        )}
      >
        <span>Dimensión político Institucional</span>
        <span
          className={cn(
            "grid size-7 place-items-center rounded-full transition-colors",
            isPol ? "bg-paper text-ink" : "border border-stone bg-paper text-lime-hot",
          )}
        >
          <Target className="size-4" />
        </span>
      </button>

      {/* Tab 2: Dimensión económico Productiva */}
      <button
        type="button"
        onClick={() => onSelect("economica-productiva")}
        className={cn(
          "flex items-center gap-3 rounded-pill px-4 py-2 font-display text-xs font-semibold transition-all duration-200",
          isEco
            ? "bg-[#cfd6d4] text-ink shadow-xs"
            : "border border-stone bg-paper text-lime-hot hover:bg-fog",
        )}
      >
        <span>Dimensión económico Productiva</span>
        <span
          className={cn(
            "grid size-7 place-items-center rounded-full transition-colors",
            isEco ? "bg-paper text-ink" : "border border-lime-hot/40 bg-paper text-lime-hot",
          )}
        >
          <Sprout className="size-4" />
        </span>
      </button>
    </div>
  );
}

export function DimensionGrid({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (slug: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {GRID_ITEMS.map((item) => {
        const Icon = item.icon;
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
                  : "border-lime-hot/50 bg-paper text-lime-hot",
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
  return (
    <div className="mt-8 animate-[fade-in_400ms_var(--ease-out)] rounded-2xl border border-stone bg-fog/40 p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h3 className="font-display text-lg font-bold text-ink sm:text-xl">{dim.title}</h3>
        <Link
          to={`/dimensiones/${dim.slug}`}
          className="font-display text-xs font-semibold text-lime-hot no-underline hover:underline"
        >
          Ver ficha completa
        </Link>
      </div>
      <p className="mt-2 max-w-3xl text-xs text-muted sm:text-sm">{dim.summary}</p>
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
    </div>
  );
}
