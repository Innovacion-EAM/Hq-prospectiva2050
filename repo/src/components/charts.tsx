import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Grupo } from "@/lib/api";
import { dimColor, dimTitle } from "@/lib/api";

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid #1d3b38",
  background: "#0a1f1e",
  color: "#e9f4f1",
  fontSize: 12,
};

/** Valor que recharts entrega al Tooltip: número, texto o array de ambos. */
type TooltipValue = string | number | Array<string | number>;

function tooltipFormatter(value: TooltipValue) {
  return [value, "documentos"];
}

/** Donut de las 4 dimensiones con su color neón. */
export function DimensionDonut({ data }: { data: Grupo[] }) {
  const rows = data.map((g) => ({
    name: dimTitle(String(g.clave)) ?? "Sin clasificar",
    value: g.count,
    color: dimColor(String(g.clave)) ?? "#6f8f8b",
  }));

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <div className="relative h-52 w-52 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rows}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={3}
              stroke="none"
            >
              {rows.map((r) => (
                <Cell key={r.name} fill={r.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={tooltipFormatter} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-extrabold text-paper">
            {rows.reduce((acc, r) => acc + r.value, 0)}
          </span>
          <span className="text-[0.62rem] uppercase tracking-widest text-muted">documentos</span>
        </div>
      </div>
      <ul className="w-full max-w-xs space-y-2">
        {rows.map((r) => (
          <li key={r.name} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-2 text-mist">
              <span className="size-2.5 rounded-sm" style={{ background: r.color, boxShadow: `0 0 8px ${r.color}66` }} />
              {r.name}
            </span>
            <span className="font-display font-bold text-paper">{r.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Barras horizontales (tipos, delimitaciones, formatos, autores). */
export function HBarList({
  data,
  color,
  max,
}: {
  data: Grupo[];
  color?: string;
  max?: number;
}) {
  const top = max ?? Math.max(1, ...data.map((g) => g.count));
  return (
    <ul className="space-y-3">
      {data.map((g) => {
        const label = g.etiqueta ?? String(g.clave);
        const pct = Math.round((g.count / top) * 100);
        return (
          <li key={label}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
              <span className="truncate text-mist">{label}</span>
              <span className="font-display font-bold text-paper">{g.count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-petro-mid">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(pct, 3)}%`,
                  background: color ?? "var(--color-neon)",
                  boxShadow: `0 0 10px ${color ?? "var(--color-neon)"}55`,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Serie de documentos por año (barra con una línea encima). */
export function YearChart({ data }: { data: Grupo[] }) {
  const rows = data
    .filter((g) => g.clave !== null)
    .sort((a, b) => Number(a.clave) - Number(b.clave))
    .map((g) => ({ anio: String(g.clave), docs: g.count }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
          <CartesianGrid stroke="#1d3b38" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="anio"
            tick={{ fontSize: 10, fill: "#6f8f8b" }}
            axisLine={false}
            tickLine={false}
            interval={rows.length > 24 ? 2 : 0}
          />
          <YAxis tick={{ fontSize: 10, fill: "#6f8f8b" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={tooltipFormatter} cursor={{ fill: "#102b29" }} />
          <Bar dataKey="docs" fill="#34d399" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Últimos años con una línea de tendencia (área). */
export function YearArea({ data, color = "#fbbf24" }: { data: Grupo[]; color?: string }) {
  const rows = data
    .filter((g) => g.clave !== null)
    .sort((a, b) => Number(a.clave) - Number(b.clave))
    .slice(-15)
    .map((g) => ({ anio: String(g.clave), docs: g.count }));

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
          <defs>
            <linearGradient id="repArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1d3b38" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="anio" tick={{ fontSize: 10, fill: "#6f8f8b" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#6f8f8b" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={tooltipFormatter} />
          <Area type="monotone" dataKey="docs" stroke={color} strokeWidth={2.4} fill="url(#repArea)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}