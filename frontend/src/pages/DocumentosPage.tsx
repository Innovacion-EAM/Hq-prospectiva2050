import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HomeDocuments } from "@/components/shared-sections";
import { PageHero } from "@/components/site-shell";
import { fetchDocumentos, formatFecha, type ApiDocumento } from "@/lib/api";

export function DocumentosPage() {
  const [docs, setDocs] = useState<ApiDocumento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocumentos()
      .then((res) => setDocs(res.data))
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHero
        kicker="Archivo"
        title="Documentos y publicaciones"
        intro="El repositorio público del proceso: convenios, informes, memorias, boletines y piezas de socialización."
      />
      <HomeDocuments />
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="font-display text-xl font-bold text-ink">Recientes</h2>
        {loading ? (
          <p className="mt-6 text-muted">Cargando documentos…</p>
        ) : docs.length === 0 ? (
          <p className="mt-6 text-muted">El repositorio se está poblando. Vuelve pronto.</p>
        ) : (
          <ul className="mt-6 divide-y divide-stone overflow-hidden rounded-2xl border border-stone">
            {docs.map((doc) => (
              <li key={doc.id}>
                <Link
                  to={`/documentos/${doc.tipo}`}
                  className="flex flex-col gap-1 px-5 py-4 no-underline hover:bg-fog sm:flex-row sm:items-center sm:justify-between"
                >
                  <span>
                    <span className="font-display text-sm font-semibold text-ink">
                      {doc.titulo}
                    </span>
                    <span className="mt-1 block text-xs text-muted">{doc.autor}</span>
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
