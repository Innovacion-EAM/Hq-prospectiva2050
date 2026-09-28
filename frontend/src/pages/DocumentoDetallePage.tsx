import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { PageHero } from "@/components/site-shell";
import { ShareRow } from "@/components/share-row";
import { documentoUrl, fetchDocumentos, formatFecha, type ApiDocumento } from "@/lib/api";
import { NotFoundPage } from "./NotFoundPage";

const ETIQUETAS: { campo: keyof ApiDocumento; titulo: string }[] = [
  { campo: "autor", titulo: "Autor(es)" },
  { campo: "tipo", titulo: "Tipo de documento" },
  { campo: "delimitacion", titulo: "Delimitación espacial" },
  { campo: "formato", titulo: "Formato" },
];

/**
 * Ficha de un documento. El repositorio oficial define estas columnas, así que
 * se muestran todas: sin la ficha, autor y alcance territorial no quedaban
 * visibles en ninguna parte del sitio.
 */
export function DocumentoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<ApiDocumento | null>(null);
  const [loading, setLoading] = useState(true);
  const [noEncontrado, setNoEncontrado] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchDocumentos()
      .then((res) => {
        const found = res.data.find((d) => String(d.id) === id);
        if (found) setDoc(found);
        else setNoEncontrado(true);
      })
      .catch(() => setNoEncontrado(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <p className="text-muted">Cargando documento…</p>
      </section>
    );
  }
  if (noEncontrado || !doc) return <NotFoundPage />;

  const url = documentoUrl(doc);

  return (
    <>
      <PageHero kicker="Repositorio" title={doc.titulo} />
      <article className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
        <Link
          to="/documentos"
          className="inline-flex items-center gap-1.5 font-display text-xs font-semibold text-lime-ink no-underline hover:underline"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Volver al repositorio
        </Link>

        <dl className="mt-6 grid gap-4 rounded-2xl border border-stone bg-fog/40 p-5 sm:grid-cols-2">
          <div>
            <dt className="font-display text-xs font-semibold text-muted">Fecha de publicación</dt>
            <dd className="mt-0.5 text-sm text-ink">{formatFecha(doc.fecha)}</dd>
          </div>
          {ETIQUETAS.map(({ campo, titulo }) => {
            const valor = doc[campo];
            return (
              <div key={campo}>
                <dt className="font-display text-xs font-semibold text-muted">{titulo}</dt>
                <dd className="mt-0.5 text-sm text-ink">{valor ? String(valor) : "—"}</dd>
              </div>
            );
          })}
        </dl>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-full border border-lime-hot bg-lime px-4 py-2 font-display text-xs font-semibold text-ink no-underline hover:opacity-90"
            >
              {doc.archivo ? (
                <Download className="size-4" aria-hidden="true" />
              ) : (
                <ExternalLink className="size-4" aria-hidden="true" />
              )}
              {doc.archivo ? "Descargar documento" : "Abrir enlace externo"}
            </a>
          ) : (
            <p className="text-xs text-muted">
              Este documento todavía no tiene archivo ni enlace de acceso.
            </p>
          )}
        </div>

        <div className="mt-8">
          <ShareRow titulo={doc.titulo} />
        </div>
      </article>
    </>
  );
}
