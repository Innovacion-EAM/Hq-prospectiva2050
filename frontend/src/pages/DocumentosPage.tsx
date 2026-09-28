import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { HomeDocuments } from "@/components/shared-sections";
import { PageHero } from "@/components/site-shell";
import { fetchDocumentos, formatFecha, type ApiDocumento } from "@/lib/api";

export function DocumentosPage() {
  const [docs, setDocs] = useState<ApiDocumento[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetchDocumentos()
      .then((res) => setDocs(res.data))
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  }, []);

  // El Excel de repositorio define las columnas: título, autor(es), fecha,
  // tipo, delimitación espacial, formato y enlace. Se puede buscar por todas.
  const filtrados = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return docs;
    return docs.filter((d) =>
      [d.titulo, d.autor, d.tipo, d.delimitacion, d.formato]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(t)),
    );
  }, [docs, q]);

  return (
    <>
      <PageHero
        kicker="Archivo"
        title="Repositorio de documentos"
        intro="Convenios, informes, memorias, boletines y piezas de socialización del proceso, con autor, alcance territorial y formato de cada documento."
      />
      <HomeDocuments />
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">Todos los documentos</h2>
            <p className="mt-1 text-xs text-muted">
              {q.trim()
                ? `${filtrados.length} de ${docs.length} documentos`
                : `${docs.length} documentos en el repositorio`}
            </p>
          </div>
          <label className="flex items-center gap-2 rounded-full border border-stone bg-paper px-3 py-1.5 focus-within:border-lime-hot/50">
            <Search className="size-4 shrink-0 text-muted" aria-hidden="true" />
            <span className="sr-only">Buscar documentos</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por título, autor o alcance"
              className="w-full bg-transparent font-display text-xs text-ink outline-none placeholder:text-muted sm:w-64"
            />
          </label>
        </div>

        {loading ? (
          <p className="mt-6 text-muted">Cargando documentos…</p>
        ) : filtrados.length === 0 ? (
          <p className="mt-6 text-muted">
            {q.trim() ? "Ningún documento coincide con la búsqueda." : "El repositorio se está poblando. Vuelve pronto."}
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-stone overflow-hidden rounded-2xl border border-stone">
            {filtrados.map((doc) => (
              <li key={doc.id}>
                <Link
                  to={`/documento/${doc.id}`}
                  className="flex flex-col gap-1 px-5 py-4 no-underline hover:bg-fog sm:flex-row sm:items-center sm:justify-between"
                >
                  <span>
                    <span className="font-display text-sm font-semibold text-ink">
                      {doc.titulo}
                    </span>
                    <span className="mt-1 block text-xs text-muted">
                      {doc.autor}
                      {doc.delimitacion ? ` · Alcance: ${doc.delimitacion}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {formatFecha(doc.fecha)} · {doc.formato}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
