import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, Globe, Link2Off } from "lucide-react";
import { DimensionDonut, HBarList, YearChart } from "@/components/charts";
import { BigNumber, Card, ErrorState, Spinner } from "@/components/ui";
import { fetchRepositorioEstadisticas, type Estadisticas } from "@/lib/api";
import { nf } from "@/lib/utils";

export function DashboardPage() {
  const [stats, setStats] = useState<Estadisticas | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchRepositorioEstadisticas()
      .then((s) => alive && setStats(s))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  if (error) {
    return <ErrorState message={error} />;
  }
  if (!stats) {
    return <Spinner />;
  }

  return (
    <div className="space-y-8">
      {/* Portada */}
      <section className="relative overflow-hidden rounded-3xl border border-line bg-petro p-8 sm:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-neon/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-40 size-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative">
          <p className="font-display text-[0.7rem] font-semibold tracking-widest text-neon uppercase">
            Horizonte Quindío · Prospectiva 2050
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-paper sm:text-4xl">
            Repositorio de información del territorio
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-mist">
            {nf(stats.total)} documentos de referencia sobre el departamento: planes, informes,
            acuerdos, boletines y piezas de socialización, clasificados por las{" "}
            <span className="text-paper">cuatro dimensiones</span> del proceso. Los documentos viven
            en Google Drive; aquí se ordenan, se filtran y se cuentan.
          </p>
          <Link
            to="/catalogo"
            className="mt-6 inline-flex items-center gap-2 rounded-pill bg-neon px-5 py-2.5 font-display text-sm font-bold text-petro-deep no-underline transition-colors hover:bg-neon-deep"
          >
            Explorar el catálogo
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Números gigantes */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BigNumber value={nf(stats.total)} label="Documentos publicados" color="var(--color-neon)" />
        <BigNumber value={nf(stats.conEnlace)} label="Con enlace de descarga" color="#34d399" />
        <BigNumber value={nf(stats.sinEnlace)} label="Enlace pendiente" color="#f472b6" />
        <BigNumber value={nf(stats.porDimension.length)} label="Dimensiones" color="#60a5fa" />
      </section>

      {/* Dimensión + año */}
      <section className="grid gap-4 lg:grid-cols-5">
        <Card
          className="lg:col-span-2"
          title="Documentos por dimensión"
          subtitle="Las mismas 4 dimensiones del proceso"
        >
          <DimensionDonut data={stats.porDimension} />
        </Card>
        <Card
          className="lg:col-span-3"
          title="Documentos por año de publicación"
          subtitle="1997 — 2026, según el registro original"
        >
          <YearChart data={stats.porAnio} />
        </Card>
      </section>

      {/* Categorías */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card title="Por tipo de documento" subtitle="Las 17 tipologías del inventario">
          <HBarList data={stats.porTipo.slice(0, 12)} color="#fbbf24" />
        </Card>
        <Card title="Por formato" subtitle="El formato en el que se publicó cada pieza">
          <HBarList data={stats.porFormato} color="#34d399" />
        </Card>
        <Card title="Por delimitación espacial" subtitle="El alcance territorial del documento">
          <HBarList data={stats.porDelimitacion} color="#60a5fa" />
        </Card>
      </section>

      {/* Autores */}
      <Card title="Autores y entidades más presentes" subtitle="Top 10 responsables de los documentos">
        <div className="grid gap-8 md:grid-cols-2">
          <HBarList data={stats.topAutores} color="#f472b6" />
          <div className="grid grid-cols-1 gap-3">
            {[
              { icon: FileText, label: "Formatos", value: stats.porFormato.length, color: "#34d399" },
              { icon: Globe, label: "Ámbitos territoriales", value: stats.porDelimitacion.length, color: "#60a5fa" },
              { icon: Link2Off, label: "Sin enlace (pendiente)", value: stats.sinEnlace, color: "#f472b6" },
            ].map((row) => {
              const Icon = row.icon;
              return (
                <div
                  key={row.label}
                  className="flex items-center gap-4 rounded-xl border border-line bg-petro-mid/60 px-4 py-3"
                >
                  <span className="grid size-9 place-items-center rounded-lg" style={{ background: `${row.color}18`, color: row.color }}>
                    <Icon className="size-4" />
                  </span>
                  <span className="flex-1 text-xs text-mist">{row.label}</span>
                  <span className="font-display text-xl font-extrabold" style={{ color: row.color }}>
                    {row.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}