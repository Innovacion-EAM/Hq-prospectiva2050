import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ChartSeries } from "@/lib/types";

/**
 * Editor de las series de un gráfico.
 *
 * El formato es texto porque el dato es libre y cambiante: una serie se escribe
 * como `Nombre | color-hex` en la primera línea y un punto `año:valor` por
 * línea. Vive en su propio archivo —y no dentro de una pantalla— porque lo usan
 * la página de Estadísticas; antes estaba incrustado en el CRUD de Dimensiones.
 */
function serializeCharts(charts: ChartSeries[]): string[] {
  return charts.map((c) => `${c.name} | ${c.color}\n${c.data.map((d) => `${d.year}:${d.value}`).join("\n")}`);
}

function parseCharts(lines: string[]): ChartSeries[] {
  const defaultPalette = ["#0b3336", "#8fcb32", "#5c7072", "#5b2d8a", "#16484c", "#b5dc4a"];
  return lines
    .map((block, bi) => {
      const [header, ...points] = block.split("\n").filter((l) => l.trim().length > 0);
      const [name = "", color = defaultPalette[bi % defaultPalette.length]] = header.split("|").map((s) => s.trim());
      const data = points
        .map((p) => {
          const [year, valueRaw] = p.split(":").map((s) => s.trim());
          const value = Number(valueRaw);
          return year && !Number.isNaN(value) ? { year, value } : null;
        })
        .filter((d): d is { year: string; value: number } => d !== null);
      return name || data.length ? { name: name || "Serie", color: color || defaultPalette[bi % defaultPalette.length], data } : null;
    })
    .filter((c): c is ChartSeries => c !== null);
}

export function ChartsEditor({
  value,
  onChange,
}: {
  value: ChartSeries[];
  onChange: (next: ChartSeries[]) => void;
}) {
  const [drafts, setDrafts] = useState<string[]>(serializeCharts(value));

  function updateDrafts(next: string[]) {
    setDrafts(next);
    onChange(parseCharts(next));
  }

  function add() {
    updateDrafts([...drafts, `Nueva serie | #0b3336\n2026:50`]);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between">
        <span className="font-display text-xs font-semibold text-ink">Series de datos (gráficos)</span>
        <Button variant="lime" size="sm" onClick={add}>
          <Plus className="size-3.5" /> Serie
        </Button>
      </div>
      <p className="text-[0.7rem] text-muted">
        Formato: <code>Nombre | color-hex</code> en la primera línea y un punto por línea con{" "}
        <code>año:valor</code>.
      </p>
      {drafts.length === 0 ? (
        <p className="rounded-lg border border-dashed border-mist px-3 py-4 text-center text-xs text-muted">
          Sin series. Agrega la primera para graficar en el sitio.
        </p>
      ) : (
        <ul className="space-y-2">
          {drafts.map((block, i) => (
            <li key={i} className="group relative">
              <button
                type="button"
                onClick={() => updateDrafts(drafts.filter((_, j) => j !== i))}
                aria-label="Eliminar serie"
                className="absolute right-2 top-2 z-10 grid size-6 place-items-center rounded-md bg-ink/80 text-paper opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="size-3" />
              </button>
              <textarea
                aria-label={`Definición de la serie ${i + 1} de ${drafts.length}, en JSON`}
                rows={7}
                value={block}
                onChange={(e) => updateDrafts(drafts.map((b, j) => (j === i ? e.target.value : b)))}
                className={cn(
                  "w-full resize-y rounded-lg border border-mist bg-paper px-3 py-2 pr-8 font-mono text-xs text-ink outline-none focus:border-lime-hot focus:ring-2 focus:ring-lime/40",
                  "group-hover:border-ink/30",
                )}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}