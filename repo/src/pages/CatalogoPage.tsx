import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Download, Search, X } from "lucide-react";
import { Badge, Dot, EmptyState, ErrorState, Spinner } from "@/components/ui";
import {
  DIMENSIONES,
  fetchRepositorio,
  fetchRepositorioFacetas,
  dimColor,
  dimTitle,
  type Facetas,
  type Orden,
  type RepositorioItem,
} from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * Catálogo con filtros, búsqueda y paginación.
 *
 * El estado del filtro vive en la URL (`?q=&dimension=&…`), no en useState:
 *
 *   1. El sitio principal entra aquí con `/repo?q=<título>` cuando un
 *      documento aún no tiene enlace ("Ver ficha en el repositorio").
 *   2. Se puede compartir un resultado filtrado.
 *   3. El back y forward del navegador funcionan.
 *
 * Si una búsqueda inicial por `q` deja exactamente UN resultado (viene de una
 * ficha del sitio principal), se abre directamente la ficha.
 */
export function CatalogoPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [facetas, setFacetas] = useState<Facetas | null>(null);
  const [data, setData] = useState<RepositorioItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const autoOpened = useRef<string | null>(null);

  const q = searchParams.get("q") ?? "";
  const dimension = searchParams.get("dimension") ?? "";
  const tipo = searchParams.get("tipo") ?? "";
  const delimitacion = searchParams.get("delimitacion") ?? "";
  const formato = searchParams.get("formato") ?? "";
  const desde = searchParams.get("desde") ?? "";
  const hasta = searchParams.get("hasta") ?? "";
  const orden = (searchParams.get("orden") as Orden) ?? "recientes";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const perPage = 20;

  const params = useMemo(
    () => ({ q, dimension, tipo, delimitacion, formato, desde, hasta, orden, page, perPage }),
    [q, dimension, tipo, delimitacion, formato, desde, hasta, orden, page, perPage],
  );

  const anios = useMemo(
    () =>
      (facetas?.anios ?? [])
        .map((g) => Number(g.clave))
        .filter((a) => Number.isFinite(a))
        .sort((a, b) => a - b),
    [facetas],
  );

  useEffect(() => {
    fetchRepositorioFacetas()
      .then(setFacetas)
      .catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    const timer = window.setTimeout(() => {
      fetchRepositorio(params)
        .then((res) => {
          if (!alive) return;
          setData(res.data);
          setTotal(res.meta.total);
          // Llegada desde el sitio principal con una búsqueda exacta: abrir la
          // ficha directamente para no hacer dar un clic de más al visitante.
          if (q && res.meta.total === 1 && res.data.length === 1 && autoOpened.current !== q) {
            autoOpened.current = q;
            navigate(`/documento/${res.data[0].id}`, { replace: true });
          }
        })
        .catch((e: Error) => alive && setError(e.message))
        .finally(() => alive && setLoading(false));
    }, q ? 300 : 0);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  function setFilter(key: string, value: string) {
    const fresh = new URLSearchParams(searchParams);
    if (value) fresh.set(key, value);
    else fresh.delete(key);
    // Cambiar cualquier filtro devuelve a la página 1 (si no, podrías quedar
    // en una página que ya no existe tras reducir los resultados).
    fresh.delete("page");
    setSearchParams(fresh, { replace: true });
  }

  // Paginar NO puede pasar por setFilter: esa función borra `page` a propósito.
  function goToPage(p: number) {
    const fresh = new URLSearchParams(searchParams);
    if (p <= 1) fresh.delete("page");
    else fresh.set("page", String(p));
    // Sin `replace` para que el botón «atrás» del navegador funcione.
    setSearchParams(fresh);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const clearSearch = () => setFilter("q", "");
  const pageCount = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="space-y-6">
      {/* Encabezado con búsqueda */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-paper sm:text-3xl">
            Catálogo de documentos
          </h1>
          <p className="mt-2 text-sm text-muted">
            {loading ? "Buscando…" : `${total} documento${total === 1 ? "" : "s"} en este resultado`}
          </p>
        </div>
        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setFilter("q", e.target.value)}
            placeholder="Buscar por título o autor…"
            className="h-11 w-full rounded-pill border border-line bg-petro-mid pl-10 pr-10 text-sm text-paper outline-none transition-colors placeholder:text-muted focus:border-neon/60"
          />
          {q ? (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Limpiar búsqueda"
              className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-petro-soft hover:text-paper"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Filtros */}
        <aside className="glass h-fit space-y-6 rounded-2xl p-5">
          <div>
            <p className="mb-2.5 font-display text-[0.68rem] font-bold tracking-widest text-muted uppercase">
              Dimensión
            </p>
            <div className="flex flex-wrap gap-2">
              {DIMENSIONES.map((d) => {
                const active = dimension === d.slug;
                return (
                  <button
                    key={d.slug}
                    type="button"
                    onClick={() => setFilter("dimension", active ? "" : d.slug)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-pill border px-3 py-1.5 font-display text-[0.7rem] font-semibold transition-all",
                      active
                        ? "text-petro-deep"
                        : "bg-petro-mid text-mist hover:text-paper",
                    )}
                    style={{
                      borderColor: active ? d.color : "var(--color-line)",
                      background: active ? d.color : undefined,
                      boxShadow: active ? `0 0 12px ${d.color}66` : undefined,
                    }}
                  >
                    <Dot color={d.color} />
                    {d.short}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2.5 font-display text-[0.68rem] font-bold tracking-widest text-muted uppercase">
              Año
            </p>
            <div className="flex items-center gap-2">
              <select
                value={desde}
                onChange={(e) => setFilter("desde", e.target.value)}
                aria-label="Desde el año"
                className="h-9 w-full rounded-lg border border-line bg-petro-mid px-2 text-xs text-paper outline-none focus:border-neon/60"
              >
                <option value="">Desde</option>
                {anios.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <select
                value={hasta}
                onChange={(e) => setFilter("hasta", e.target.value)}
                aria-label="Hasta el año"
                className="h-9 w-full rounded-lg border border-line bg-petro-mid px-2 text-xs text-paper outline-none focus:border-neon/60"
              >
                <option value="">Hasta</option>
                {anios.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <SelectFilter
            label="Tipo de documento"
            value={tipo}
            onChange={(v) => setFilter("tipo", v)}
            options={(facetas?.tipos ?? []).map((g) => ({ value: String(g.clave), label: String(g.clave) }))}
          />
          <SelectFilter
            label="Delimitación espacial"
            value={delimitacion}
            onChange={(v) => setFilter("delimitacion", v)}
            options={(facetas?.delimitaciones ?? []).map((g) => ({ value: String(g.clave), label: String(g.clave) }))}
          />
          <SelectFilter
            label="Formato"
            value={formato}
            onChange={(v) => setFilter("formato", v)}
            options={(facetas?.formatos ?? []).map((g) => ({ value: String(g.clave), label: String(g.clave) }))}
          />

          <div>
            <p className="mb-2.5 font-display text-[0.68rem] font-bold tracking-widest text-muted uppercase">
              Ordenar por
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["recientes", "Más recientes"],
                  ["antiguos", "Más antiguos"],
                  ["titulo", "Título"],
                ] as [Orden, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter("orden", orden === value ? "" : value)}
                  className={cn(
                    "rounded-pill border px-3 py-1.5 font-display text-[0.7rem] font-semibold transition-all",
                    orden === value
                      ? "border-neon bg-neon text-petro-deep"
                      : "border-line bg-petro-mid text-mist hover:text-paper",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Resultados */}
        <div className="min-w-0">
          {error ? (
            <ErrorState message={error} />
          ) : loading ? (
            <Spinner />
          ) : data.length === 0 ? (
            <EmptyState
              title="Sin resultados"
              hint="Ajusta los filtros o prueba otra búsqueda. Si viniste desde el sitio principal, puede que este documento aún no esté en el repositorio."
            />
          ) : (
            <>
              <ul className="space-y-3">
                {data.map((doc) => (
                  <ResultCard key={doc.id} doc={doc} />
                ))}
              </ul>
              <Pagination page={page} pageCount={pageCount} total={total} onPage={goToPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SelectFilter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <p className="mb-2.5 font-display text-[0.68rem] font-bold tracking-widest text-muted uppercase">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-lg border border-line bg-petro-mid px-2 text-xs text-paper outline-none focus:border-neon/60"
      >
        <option value="">Todos</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ResultCard({ doc }: { doc: RepositorioItem }) {
  const color = dimColor(doc.dimension);
  return (
    <li className="glass group flex flex-col gap-3 rounded-2xl p-5 transition-all hover:border-neon/40 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {doc.dimension ? (
            <Badge color={color}>
              <Dot color={color} />
              {dimTitle(doc.dimension)}
            </Badge>
          ) : (
            <Badge>Sin dimensión</Badge>
          )}
          <Badge className="border-transparent">{doc.formato}</Badge>
          {doc.anio ? <Badge color="#9db8b5">{doc.anio}</Badge> : null}
        </div>
        <Link
          to={`/documento/${doc.id}`}
          className="mt-2 block truncate font-display text-sm font-bold text-paper no-underline transition-colors hover:text-neon"
          title={doc.titulo}
        >
          {doc.titulo}
        </Link>
        <p className="mt-1 truncate text-xs text-muted">
          {doc.autor ?? "Sin autor"} · {doc.tipo} · {doc.codigo}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {doc.link ? (
          <a
            href={doc.link}
            target="_blank"
            rel="noopener noreferrer"
            title="Descargar (Google Drive)"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-line bg-petro-mid text-mist transition-colors hover:border-emerald-400/50 hover:text-emerald-300"
          >
            <Download className="size-4" />
          </a>
        ) : (
          <span className="rounded-pill border border-dashed border-line px-3 py-1.5 text-[0.68rem] font-semibold text-muted">
            Enlace pendiente
          </span>
        )}
        <Link
          to={`/documento/${doc.id}`}
          className="inline-flex items-center gap-1.5 rounded-pill bg-petro-soft px-4 py-2 font-display text-xs font-semibold text-paper no-underline transition-colors group-hover:bg-neon group-hover:text-petro-deep"
        >
          Ver ficha
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </li>
  );
}

function Pagination({
  page,
  pageCount,
  total,
  onPage,
}: {
  page: number;
  pageCount: number;
  total: number;
  onPage: (p: number) => void;
}) {
  if (pageCount <= 1) return null;
  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-petro-mid px-4 py-2 font-display text-xs font-semibold text-mist transition-colors hover:text-paper disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft className="size-3.5" /> Anterior
      </button>
      <span className="text-xs text-muted">
        Página {page} de {pageCount} · {total} documentos
      </span>
      <button
        type="button"
        disabled={page >= pageCount}
        onClick={() => onPage(page + 1)}
        className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-petro-mid px-4 py-2 font-display text-xs font-semibold text-mist transition-colors hover:text-paper disabled:pointer-events-none disabled:opacity-40"
      >
        Siguiente <ChevronRight className="size-3.5" />
      </button>
    </div>
  );
}