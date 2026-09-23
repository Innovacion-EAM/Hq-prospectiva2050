import { useState } from "react";
import { CheckCheck, Inbox, Mail, Trash2 } from "lucide-react";
import { collections, useCollection } from "@/lib/data";
import { Badge, Card, ConfirmButton, EmptyState, PageHeader, SearchInput, Spinner, Toggle } from "@/components/ui";
import { cn, formatFechaLocal } from "@/lib/utils";
import type { Mensaje } from "@/lib/types";

export function MensajesPage() {
  const { items, loading, update, remove } = useCollection(collections.mensajes());
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState<"todos" | "contacto" | "inscripciones">("todos");
  const [openId, setOpenId] = useState<number | null>(null);

  const filtered = items
    .filter((m) => (tipo === "todos" ? true : m.tipo === tipo))
    .filter((m) => `${m.nombre} ${m.email} ${m.asunto} ${m.mensaje}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.id - a.id);

  const noLeidos = items.filter((m) => !m.leido).length;

  async function toggleLeido(m: Mensaje) {
    await update(m.id, { leido: !m.leido });
  }

  async function marcarTodos() {
    for (const m of items.filter((x) => !x.leido)) {
      await update(m.id, { leido: true });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mensajes"
        description={`Mensajes enviados desde el formulario de contacto e inscripciones de talleres.${noLeidos ? ` ${noLeidos} sin leer.` : ""}`}
        actions={
          noLeidos > 0 ? (
            <button
              type="button"
              onClick={marcarTodos}
              className="inline-flex items-center gap-2 rounded-pill bg-ink px-4 py-2 font-display text-xs font-semibold text-paper hover:bg-ink-mid"
            >
              <CheckCheck className="size-4" /> Marcar todos como leídos
            </button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {(["todos", "contacto", "inscripciones"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              className={cn(
                "rounded-pill px-3.5 py-1.5 font-display text-xs font-semibold capitalize transition-colors",
                tipo === t ? "bg-lime text-lime-fg" : "border border-mist bg-paper text-muted hover:text-ink",
              )}
            >
              {t === "contacto" ? "Contacto" : t === "inscripciones" ? "Inscripciones" : "Todos"}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-72">
          <SearchInput value={q} onChange={setQ} placeholder="Buscar mensajes..." />
        </div>
      </div>

      {loading ? (
        <div className="p-14">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No hay mensajes" description="Cuando el sitio reciba mensajes, aparecerán aquí." />
      ) : (
        <ul className="space-y-3">
          {filtered.map((m) => (
            <li key={m.id}>
              <Card className={cn("overflow-hidden transition-colors", !m.leido && "border-ink/30")}>
                <button
                  type="button"
                  onClick={() => setOpenId((v) => (v === m.id ? null : m.id))}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left"
                >
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-full",
                      m.tipo === "inscripciones" ? "bg-lime text-lime-fg" : "bg-fog text-ink",
                    )}
                  >
                    <Mail className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      {!m.leido ? <span className="size-2 rounded-full bg-lime-hot" /> : null}
                      <span className="font-display text-sm font-semibold text-ink">{m.nombre}</span>
                      <span className="text-xs text-muted">{m.email}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-body">{m.asunto || m.mensaje}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <Badge tone={m.tipo === "inscripciones" ? "lime" : "neutral"}>{m.tipo}</Badge>
                    <span className="hidden text-xs text-muted sm:inline">{formatFechaLocal(m.fecha)}</span>
                  </span>
                </button>
                {openId === m.id ? (
                  <div className="border-t border-stone bg-fog/60 px-5 py-4">
                    <p className="whitespace-pre-wrap text-sm text-body">{m.mensaje}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <Toggle
                        checked={m.leido}
                        onChange={() => toggleLeido(m)}
                        label={m.leido ? "Leído" : "Marcar como leído"}
                      />
                      <div className="flex-1" />
                      <ConfirmButton
                        label="Eliminar mensaje"
                        onConfirm={() => remove(m.id)}
                        confirmText="¿Eliminar mensaje?"
                        variant="outline"
                      >
                        <Trash2 className="size-3.5" /> Eliminar
                      </ConfirmButton>
                    </div>
                  </div>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Card className="flex items-start gap-3 p-4 text-xs text-muted">
        <Inbox className="mt-0.5 size-4 shrink-0" />
        <p>
          Estos mensajes provienen de los formularios del sitio: <strong>contacto</strong> (HomeContact) e{" "}
          <strong>inscripciones</strong> (Participa). El backend los debe recibir en{" "}
          <code className="rounded bg-fog px-1">POST /api/forms/contacto</code> y{" "}
          <code className="rounded bg-fog px-1">POST /api/forms/inscripciones</code>.
        </p>
      </Card>
    </div>
  );
}