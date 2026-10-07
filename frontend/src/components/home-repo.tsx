import { useEffect, useState } from "react";
import { ArrowRight, Database, FileDown, Link2Off } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  fetchRepositorioEstadisticas,
  type ApiRepositorioGrupo,
  type ApiRepositorioStats,
} from "@/lib/api";

/**
 * Paleta por dimensión del repositorio. Es la MISMÍSIMA que usa el dashboard de
 * /repo: físico-ambiental esmeralda, económico-productivo ámbar, político-
 * institucional azul y socio-cultural magenta. Se repite aquí (en vez de
 * importarla de /repo) porque /repo es una app independiente que no se puede
 * importar desde el sitio principal.
 */
const DIM_REPO: Record<string, { short: string; color: string }> = {
  "fisico-ambiental": { short: "Físico-ambiental", color: "#34d399" },
  "economica-productiva": { short: "Económico-productivo", color: "#fbbf24" },
  "politico-institucional": { short: "Político-institucional", color: "#60a5fa" },
  "socio-cultural": { short: "Socio-cultural", color: "#f472b6" },
};

const DIM_ORDER = Object.keys(DIM_REPO);

function dimCount(grupos: ApiRepositorioGrupo[], slug: string): number {
  return grupos.find((g) => g.clave === slug)?.count ?? 0;
}

export function HomeRepo() {
  const [stats, setStats] = useState<ApiRepositorioStats | null>(null);

  useEffect(() => {
    fetchRepositorioEstadisticas()
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  const donut = (stats?.porDimension ?? [])
    .map((g) => {
      const meta = DIM_REPO[String(g.clave)];
      return {
        name: meta?.short ?? String(g.clave),
        value: g.count,
        color: meta?.color ?? "#6f8f8b",
      };
    })
    .filter((d) => d.value > 0);

  return (
    <section className="relative overflow-hidden bg-[#0a1f1e] px-4 py-14 text-paper sm:px-6 sm:py-20">
      {/* Aros decorativos sutiles, como en el resto de la portada */}
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full bg-lime/5 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-display text-[0.7rem] font-bold tracking-[0.2em] text-lime uppercase">
              Repositorio de información
            </p>
            <h2 className="mt-3 font-display text-section font-bold text-paper">
              El inventario documental del territorio
            </h2>
            <p className="mt-4 max-w-xl text-xs leading-relaxed text-mist sm:text-sm">
              Más de {stats ? stats.total : 290} documentos de referencia sobre el Quindío:
              planes, informes, acuerdos, boletines y piezas de socialización, agrupados
              en las cuatro dimensiones del proceso.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <a
              href="/repo"
              className="inline-flex items-center gap-2 rounded-pill bg-lime px-5 py-2.5 font-display text-sm font-semibold text-lime-fg no-underline hover:bg-lime-deep"
            >
              <Database className="size-4" />
              Dashboard del repositorio
            </a>
            <a
              href="/repo/catalogo"
              className="inline-flex items-center gap-2 rounded-pill border border-paper/20 bg-paper/5 px-5 py-2.5 font-display text-sm font-semibold text-paper no-underline hover:bg-paper/10"
            >
              Explorar al catálogo
              <ArrowRight className="size-4" />
            </a>
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          {/* Donut por dimensión */}
          <div className="flex flex-col justify-between gap-6 rounded-3xl border border-paper/10 bg-paper/5 p-6 sm:flex-row sm:items-center">
            <div className="relative h-52 w-52 shrink-0">
              {donut.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donut}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={88}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {donut.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [value, "documentos"]}
                      contentStyle={{
                        background: "#0a1f1e",
                        border: "1px solid #1d3b38",
                        borderRadius: 12,
                        color: "#e9f4f1",
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="grid h-full w-full place-items-center rounded-full border-4 border-dashed border-paper/10 text-4xl">
                  🗂️
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-3xl font-extrabold text-paper">
                  {stats?.total ?? "…"}
                </span>
                <span className="text-[0.62rem] uppercase tracking-widest text-mist">documentos</span>
              </div>
            </div>
            <ul className="w-full space-y-2.5">
              {DIM_ORDER.map((slug) => {
                const meta = DIM_REPO[slug];
                const count = stats ? dimCount(stats.porDimension, slug) : 0;
                return (
                  <li key={slug}>
                    <a
                      href={`/repo?dimension=${slug}`}
                      className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 no-underline transition-colors hover:bg-paper/5"
                    >
                      <span className="flex items-center gap-2.5 text-sm text-paper">
                        <span
                          className="size-2.5 rounded-sm"
                          style={{ background: meta.color, boxShadow: `0 0 8px ${meta.color}66` }}
                        />
                        {meta.short}
                      </span>
                      <span className="font-display text-lg font-extrabold" style={{ color: meta.color }}>
                        {stats ? count : "…"}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Enlace + años recientes */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col justify-between rounded-3xl border border-paper/10 bg-paper/5 p-6">
              <FileDown className="size-5 text-emerald-300" />
              <div className="mt-8">
                <p className="font-display text-4xl font-extrabold text-emerald-300">
                  {stats ? stats.conEnlace : "…"}
                </p>
                <p className="mt-1.5 text-xs text-mist">con enlace de descarga listo</p>
                <p className="mt-1 text-[0.68rem] text-mist/70">
                  Los archivos viven en Google Drive y se abren con un clic.
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-between rounded-3xl border border-paper/10 bg-paper/5 p-6">
              <Link2Off className="size-5 text-rose-300" />
              <div className="mt-8">
                <p className="font-display text-4xl font-extrabold text-rose-300">
                  {stats ? stats.sinEnlace : "…"}
                </p>
                <p className="mt-1.5 text-xs text-mist">con enlace pendiente</p>
                <p className="mt-1 text-[0.68rem] text-mist/70">
                  Se publican a medida que el equipo los dispone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}