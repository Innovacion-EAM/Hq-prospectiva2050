import { useEffect, useState } from "react";
import { ArrowRight, Database, FileText } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { fetchRepositorioEstadisticas, type ApiRepositorioGrupo, type ApiRepositorioStats } from "@/lib/api";
import { clasesBoton } from "@/components/portada-colores";
import { useSite } from "@/data/site-context";

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
  const { PORTADA } = useSite();
  const repo = PORTADA.repositorio;
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

  // Los tipos que se enseñan en la portada. Se cortan a seis para que la lista
  // no desborde la tarjeta; el catálogo de /repo los tiene todos.
  const porTipo = (stats?.porTipo ?? []).slice(0, 6).map((g) => ({
    clave: String(g.clave ?? ""),
    etiqueta: String(g.etiqueta ?? g.clave ?? ""),
    count: g.count,
  }));
  const maxTipo = Math.max(1, ...porTipo.map((t) => t.count));

  // `{total}` en el párrafo editable se cambia por la cifra real, para que el
  // número que se anuncia no se quede congelado en el que había al escribir el
  // texto. Mientras las estadísticas no llegan, un puntos suspensivos.
  const texto = repo.texto.replace(/\{total\}/g, stats ? String(stats.total) : "…");

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
            <h2 className="mt-3 font-display text-section font-bold text-paper">{repo.titulo}</h2>
            <p className="mt-4 max-w-xl text-xs leading-relaxed text-mist sm:text-sm">{texto}</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <a
              href="/repo"
              className={`inline-flex items-center gap-2 rounded-pill px-5 py-2.5 font-display text-sm font-semibold no-underline ${clasesBoton(
                repo.dashboardColor,
              )}`}
            >
              <Database className="size-4" />
              {repo.dashboardBoton}
            </a>
            <a
              href="/repo/catalogo"
              className="inline-flex items-center gap-2 rounded-pill border border-paper/20 bg-paper/5 px-5 py-2.5 font-display text-sm font-semibold text-paper no-underline hover:bg-paper/10"
            >
              {repo.catalogoBoton}
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
                      href={`/repo/catalogo?dimension=${slug}`}
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

          {/* Tipo de documento: le dice al visitante QUÉ hay, no cuántos faltan.
              Antes aquí iban dos tarjetas con el conteo de enlaces listos y
              pendientes; ese dato solo le importa a quien administra el
              repositorio y vive en el backoffice. */}
          <div className="rounded-3xl border border-paper/10 bg-paper/5 p-6">
            <p className="flex items-center gap-2 font-display text-sm font-bold text-paper">
              <FileText className="size-4 text-lime" />
              Explora por tipo de documento
            </p>
            <p className="mt-1.5 text-xs text-mist">
              Informes, planes, acuerdos, boletines y más. Toca uno para verlo en el catálogo.
            </p>
            <ul className="mt-4 space-y-3">
              {porTipo.length > 0 ? (
                porTipo.map((t) => (
                  <li key={t.clave}>
                    <a
                      href={`/repo/catalogo?tipo=${encodeURIComponent(t.clave)}`}
                      className="group block no-underline"
                    >
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="truncate text-paper transition-colors group-hover:text-lime sm:text-sm">
                          {t.etiqueta}
                        </span>
                        <span className="font-display text-sm font-bold text-lime">{t.count}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper/10">
                        <div
                          className="h-full rounded-full bg-lime/60 transition-all group-hover:bg-lime"
                          style={{ width: `${(t.count / maxTipo) * 100}%` }}
                        />
                      </div>
                    </a>
                  </li>
                ))
              ) : (
                <li className="text-xs text-mist">Cargando el inventario…</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}