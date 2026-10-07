import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Download, ExternalLink, FileText, Globe, Landmark, MapPin, User2 } from "lucide-react";
import { Badge, Dot, ErrorState, Spinner } from "@/components/ui";
import { fetchRepositorioItem, dimColor, dimTitle, type RepositorioItem } from "@/lib/api";
import { initials } from "@/lib/utils";

export function FichaPage() {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<RepositorioItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    setError(null);
    setDoc(null);
    fetchRepositorioItem(id)
      .then((d) => alive && setDoc(d))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [id]);

  if (error) {
    return (
      <div className="space-y-6">
        <BackLink />
        <ErrorState message={error} />
      </div>
    );
  }
  if (!doc) {
    return <Spinner />;
  }

  const color = dimColor(doc.dimension);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <BackLink />

      {/* Encabezado */}
      <section className="glass relative overflow-hidden rounded-3xl p-7 sm:p-9">
        <div
          className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full opacity-15 blur-3xl"
          style={{ background: color ?? "var(--color-neon)" }}
        />
        <div className="relative">
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
            <Badge color="#9db8b5">#{doc.codigo}</Badge>
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-2xl font-extrabold leading-tight tracking-tight text-paper sm:text-3xl">
            {doc.titulo}
          </h1>

          {doc.autor ? (
            <div className="mt-5 flex items-center gap-3">
              <span
                className="grid size-10 place-items-center rounded-full font-display text-xs font-extrabold text-petro-deep"
                style={{ background: color ?? "var(--color-neon)" }}
              >
                {initials(doc.autor)}
              </span>
              <div>
                <p className="text-xs text-muted">Autor / responsable</p>
                <p className="font-display text-sm font-bold text-paper">{doc.autor}</p>
              </div>
            </div>
          ) : null}

          <div className="mt-7 flex flex-wrap gap-2.5">
            {doc.link ? (
              <a
                href={doc.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-pill bg-neon px-6 py-3 font-display text-sm font-bold text-petro-deep no-underline shadow-lg shadow-neon/20 transition-colors hover:bg-neon-deep"
              >
                <Download className="size-4" />
                Descargar documento
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-pill border border-dashed border-line px-6 py-3 font-display text-sm font-semibold text-muted">
                Enlace pendiente: se publicará cuando esté disponible.
              </span>
            )}
            {doc.link ? (
              <a
                href={doc.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-pill border border-line bg-petro-mid px-5 py-3 font-display text-xs font-semibold text-mist no-underline transition-colors hover:text-paper"
              >
                Abrir en Google Drive
                <ExternalLink className="size-3.5" />
              </a>
            ) : null}
          </div>
        </div>
      </section>

      {/* Metadatos */}
      <section className="grid gap-4 sm:grid-cols-2">
        <MetaTile icon={CalendarDays} label="Año de publicación" value={doc.anio ? String(doc.anio) : "Sin año registrado"} />
        <MetaTile icon={User2} label="Autor" value={doc.autor ?? "Sin autor registrado"} />
        <MetaTile icon={FileText} label="Tipo de documento" value={doc.tipo} />
        <MetaTile icon={MapPin} label="Delimitación espacial" value={doc.delimitacion ?? "Sin ámbito registrado"} />
        <MetaTile icon={Globe} label="Formato" value={doc.formato} />
        <MetaTile icon={Landmark} label="Clasificación" value={dimTitle(doc.dimension) ?? "Sin clasificar"} />
      </section>

      <p className="text-center text-xs text-muted">
        Documento de referencia del proceso de prospectiva territorial del Quindío. Los archivos
        viven en Google Drive y se sirven desde allí.
      </p>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/catalogo"
      className="inline-flex items-center gap-1.5 font-display text-xs font-semibold text-muted no-underline transition-colors hover:text-neon"
    >
      <ArrowLeft className="size-3.5" />
      Volver al catálogo
    </Link>
  );
}

function MetaTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="glass flex items-start gap-3.5 rounded-2xl p-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-petro-mid text-neon">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[0.68rem] font-semibold uppercase tracking-widest text-muted">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-paper">{value}</p>
      </div>
    </div>
  );
}