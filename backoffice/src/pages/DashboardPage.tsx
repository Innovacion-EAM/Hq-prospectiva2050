import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  FileStack,
  Inbox,
  Newspaper,
} from "lucide-react";
import { collections, useCollection } from "@/lib/data";
import { Card, PageHeader, Spinner, Thumb, Badge } from "@/components/ui";
import { formatFechaLocal } from "@/lib/utils";

export function DashboardPage() {
  const noticias = useCollection(collections.noticias());
  const documentos = useCollection(collections.documentos());
  const convocatorias = useCollection(collections.convocatorias());
  const mensajes = useCollection(collections.mensajes());

  const loading = noticias.loading || documentos.loading || convocatorias.loading || mensajes.loading;

  const publicadas = noticias.items.filter((n) => n.publicado).length;
  const activas = convocatorias.items.filter((c) => c.activa).length;
  const noLeidos = mensajes.items.filter((m) => !m.leido).length;

  const cards = [
    {
      label: "Noticias publicadas",
      value: loading ? "…" : publicadas,
      icon: Newspaper,
      href: "/noticias",
      total: noticias.items.length,
    },
    {
      label: "Documentos",
      value: loading ? "…" : documentos.items.length,
      icon: FileStack,
      href: "/documentos",
    },
    {
      label: "Convocatorias activas",
      value: loading ? "…" : activas,
      icon: CalendarDays,
      href: "/convocatorias",
      total: convocatorias.items.length,
    },
    {
      label: "Mensajes sin leer",
      value: loading ? "…" : noLeidos,
      icon: Inbox,
      href: "/mensajes",
      total: mensajes.items.length,
    },
  ];

  const recientes = noticias.items.slice(0, 5);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Panel de control"
        description="Resumen del contenido del sitio Horizonte Quindío 2050 y accesos rápidos."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.href} to={c.href} className="no-underline">
              <Card className="group p-5 transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-fog text-ink transition-colors group-hover:bg-lime">
                    <Icon className="size-5" />
                  </span>
                  <ArrowRight className="size-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="mt-4 font-display text-3xl font-extrabold text-ink">{c.value}</p>
                <p className="mt-1 text-xs text-muted">{c.label}</p>
                {"total" in c && c.total !== undefined && (
                  <p className="mt-0.5 text-[0.68rem] text-muted/70">Total: {c.total}</p>
                )}
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-stone px-6 py-4">
          <h2 className="font-display text-base font-bold text-ink">Noticias recientes</h2>
          <Link
            to="/noticias"
            className="inline-flex items-center gap-1 text-xs font-semibold text-lime-hot no-underline hover:text-ink"
          >
            Administrar <ArrowRight className="size-3.5" />
          </Link>
        </div>
        {loading ? (
          <div className="p-10">
            <Spinner />
          </div>
        ) : recientes.length === 0 ? (
          <p className="p-6 text-sm text-muted">Aún no hay noticias.</p>
        ) : (
          <ul className="divide-y divide-stone">
            {recientes.map((n) => (
              <li key={n.id}>
                <Link
                  to={`/noticias/${n.id}`}
                  className="flex items-center gap-4 px-6 py-3 transition-colors no-underline hover:bg-fog"
                >
                  <Thumb src={n.imagen} alt={n.titulo} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink no-underline">{n.titulo}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatFechaLocal(n.fecha)} · {n.categoria}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    {n.destacado ? <Badge tone="ink">Destacada</Badge> : null}
                    {n.publicado ? <Badge tone="lime">Publicada</Badge> : <Badge>Borrador</Badge>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}