import { useState, type ReactNode } from "react";
import { CheckCheck, ChevronRight, Copy, Inbox, Mail, MailX, RefreshCw, Trash2 } from "lucide-react";
import { collections, useCollection } from "@/lib/data";
import { refrescarNoLeidos } from "@/lib/no-leidos";
import { useAuth } from "@/lib/auth";
import {
  Badge,
  Button,
  Card,
  ConfirmButton,
  EmptyState,
  Modal,
  PageHeader,
  SearchInput,
  Spinner,
  Toggle,
} from "@/components/ui";
import { cn, formatFechaLocal } from "@/lib/utils";
import { toast } from "sonner";
import {
  ETIQUETAS_ESTADO,
  ETIQUETAS_TIPO,
  FILTROS_ESTADO,
  pasaFiltroEstado,
  type EstadoMensaje,
  type FiltroEstado,
  type Mensaje,
  type TipoMensaje,
} from "@/lib/types";

const TONE_POR_TIPO: Record<string, "neutral" | "lime" | "ink" | "convoca" | "rose"> = {
  inscripciones: "lime",
  contacto: "ink",
  boletin: "convoca",
  sugerencias: "neutral",
};

/**
 * Tono del badge de estado. `respondido` y `archivado` se ven apagados porque
 * ya no piden una acción; lo que está abierto (nuevo, en revisión) destaca para
 * que la bandeja muestre de entrada qué está sin atender.
 */
const TONE_POR_ESTADO: Record<EstadoMensaje, "neutral" | "lime" | "ink"> = {
  nuevo: "ink",
  en_revision: "lime",
  respondido: "neutral",
  archivado: "neutral",
};

export function MensajesPage() {
  // `pollMs` de 30s: la lista se refresca sola, que es lo que hacía que un
  // mensaje recién enviado desde el sitio no apareciera hasta recargar.
  const { items, loading, actualizando, update, remove, refrescar } = useCollection(
    collections.mensajes(),
    [],
    30_000,
  );
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState<TipoMensaje | "todos">("todos");
  const [estado, setEstado] = useState<FiltroEstado>("todos");
  const [openId, setOpenId] = useState<number | null>(null);

  /**
   * Los mensajes que encajan con tipo y estado. El orden de los filtros es fijo
   * (tipo → estado → texto) y no depende del orden en que se escribieron, así que
   * el resultado es el mismo sin importar en qué orden se filtró.
   */
  const filtered = items
    .filter((m) => (tipo === "todos" ? true : m.tipo === tipo))
    .filter((m) => pasaFiltroEstado(m.estado ?? "nuevo", estado))
    .filter((m) =>
      `${m.nombre} ${m.email ?? ""} ${m.asunto} ${m.mensaje} ${m.seguimiento ?? ""}`
        .toLowerCase()
        .includes(q.toLowerCase()),
    )
    .sort((a, b) => b.id - a.id);

  const noLeidos = items.filter((m) => !m.leido).length;
  /** Lo que sigue abierto: ni respondido ni archivado. Es la cuenta que importa. */
  const sinResponder = items.filter((m) => {
    const e = m.estado ?? "nuevo";
    return e !== "respondido" && e !== "archivado";
  }).length;

  /**
   * El mensaje del diálogo. Se busca siempre en `items` y no en un estado
   * aparte: así el diálogo muestra el valor más fresco aunque el sondeo de 30
   * segundos lo haya actualizado mientras estaba abierto, y si el mensaje
   * desaparece (se eliminó) el diálogo se cierra solo en vez de quedarse con una
   * copia fantasma.
   */
  const abierto = openId === null ? null : (items.find((m) => m.id === openId) ?? null);

  /**
   * Marcar como leído (o desmarcarlo) baja el contador del menú, así que después
   * de la mutación se fuerza el recuento: sin esto el número se quedaría
   * congelado hasta el siguiente sondeo, medio minuto después de que la fila ya
   * hubiera dejado de estar resaltada.
   */
  async function toggleLeido(m: Mensaje) {
    await update(m.id, { leido: !m.leido });
    refrescarNoLeidos();
  }

  async function marcarTodos() {
    for (const m of items.filter((x) => !x.leido)) {
      await update(m.id, { leido: true });
    }
    refrescarNoLeidos();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mensajes"
        description={`Contactos, inscripciones a talleres, suscripciones al boletín y sugerencias recibidas desde el sitio.${noLeidos ? ` ${noLeidos} sin leer.` : ""}${sinResponder ? ` ${sinResponder} sin responder.` : ""}`}
        actions={
          <>
            {/* La lista ya se refresca sola, pero un botón a mano sirve para no
                esperar los 30 segundos justo cuando uno está mirando la bandeja
                esperando lo que acaba de enviar. */}
            <button
              type="button"
              onClick={() => void refrescar()}
              disabled={actualizando}
              className="inline-flex items-center gap-2 rounded-pill border border-mist bg-paper px-4 py-2 font-display text-xs font-semibold text-muted transition-colors hover:text-ink disabled:opacity-60"
            >
              <RefreshCw className={cn("size-4", actualizando && "animate-spin")} aria-hidden="true" />
              {actualizando ? "Actualizando..." : "Actualizar"}
            </button>
            {noLeidos > 0 ? (
              <button
                type="button"
                onClick={marcarTodos}
                className="inline-flex items-center gap-2 rounded-pill bg-ink px-4 py-2 font-display text-xs font-semibold text-paper hover:bg-ink-mid"
              >
                <CheckCheck className="size-4" /> Marcar todos como leídos
              </button>
            ) : null}
          </>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {(["todos", "contacto", "inscripciones", "boletin", "sugerencias"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              className={cn(
                "rounded-pill px-3.5 py-1.5 font-display text-xs font-semibold capitalize transition-colors",
                tipo === t ? "bg-lime text-lime-fg" : "border border-mist bg-paper text-muted hover:text-ink",
              )}
            >
              {ETIQUETAS_TIPO[t]}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-72">
          <SearchInput value={q} onChange={setQ} placeholder="Buscar mensajes..." />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-display text-[0.7rem] font-semibold tracking-wide text-muted uppercase">
          Estado
        </span>
        {FILTROS_ESTADO.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setEstado(f.value)}
            className={cn(
              "rounded-pill px-3 py-1 font-display text-[0.7rem] font-semibold transition-colors",
              estado === f.value
                ? "bg-ink text-paper"
                : "border border-mist bg-paper text-muted hover:text-ink",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-14">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No hay mensajes"
          description={
            items.length > 0
              ? "Ningún mensaje coincide con los filtros aplicados."
              : "Cuando el sitio reciba mensajes, aparecerán aquí."
          }
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((m) => (
            <li key={m.id}>
              <Card
                className={cn(
                  "transition-colors",
                  // Franja lateral en lo que está sin leer. Con solo el puntito
                  // y la fecha, un mensaje recién llegado se perdía en una lista
                  // larga; la franja lo delata a un vistazo sin leer nada.
                  !m.leido && "border-ink/30 border-l-[3px] border-l-lime-hot",
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(m.id)}
                  aria-haspopup="dialog"
                  className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-fog/40"
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
                      {/* `null` significa que no dejó canal. Antes se mostraba
                          `anonimo@prospectiva.local`, una dirección que parecía
                          real y contra la que nadie podía escribir. */}
                      {m.email ? (
                        <span className="text-xs text-muted">{m.email}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted">
                          <MailX className="size-3" aria-hidden="true" />
                          Sin contacto
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-body">{m.asunto || m.mensaje}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <Badge tone={TONE_POR_ESTADO[m.estado ?? "nuevo"]}>
                      {ETIQUETAS_ESTADO[m.estado ?? "nuevo"]}
                    </Badge>
                    <Badge tone={TONE_POR_TIPO[m.tipo] ?? "neutral"}>
                      {ETIQUETAS_TIPO[m.tipo as TipoMensaje] ?? m.tipo}
                    </Badge>
                    {/* El backend rechaza el formulario si la casilla no vino
                        marcada, así que `true` es prueba de que la autorización se
                        pidió. `false` es lo esperable en los mensajes anteriores a
                        la migración 0006: se recogieron cuando el aviso todavía no
                        existía, y no hay que inventar una autorización para ellos.
                        La distinción importa, porque es justo la evidencia que hay
                        que poder distinguir de la que no. */}
                    {m.consentimiento === false ? (
                      <span
                        title="Llegó antes de que existiera el Aviso de Privacidad (migración 0006), así que no hay constancia de autorización."
                        className="cursor-help text-[0.65rem] font-semibold tracking-wide text-muted uppercase underline decoration-dotted underline-offset-2"
                      >
                        Sin constancia
                      </span>
                    ) : null}
                    <span className="hidden text-xs text-muted sm:inline">{formatFechaLocal(m.fecha)}</span>
                    {/* La flecha dice «esto se abre», que es justo lo que no se
                        veía cuando el detalle crecía debajo de la fila. */}
                    <ChevronRight className="size-4 shrink-0 text-mist" aria-hidden="true" />
                  </span>
                </button>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {/* El detalle va en un diálogo y no debajo de la fila. Desplegaba el
          contenido justo donde estaba la lista, así que había que desplazar la
          vista para leerlo y no se distinguía de un hueco en blanco. */}
      <Modal
        open={abierto !== null}
        onClose={() => setOpenId(null)}
        title={abierto ? abierto.nombre : ""}
        subtitle={abierto ? subtituloDe(abierto) : undefined}
        footer={abierto ? pieDe(abierto, () => void toggleLeido(abierto)) : undefined}
        width="lg"
      >
        {abierto ? (
          <MensajeDetalle
            mensaje={abierto}
            onUpdate={(cambios) => update(abierto.id, cambios)}
            onRemove={
              user?.role === "admin"
                ? () => {
                    refrescarNoLeidos();
                    void remove(abierto.id);
                    setOpenId(null);
                  }
                : undefined
            }
          />
        ) : null}
      </Modal>

      <Card className="flex items-start gap-3 p-4 text-xs text-muted">
        <Inbox className="mt-0.5 size-4 shrink-0" />
        <p>
          Estos mensajes provienen de los cuatro formularios del sitio:{" "}
          <strong>contacto</strong> (<code className="rounded bg-fog px-1">POST /api/forms/contacto</code>),{" "}
          <strong>inscripciones</strong> (<code className="rounded bg-fog px-1">POST /api/forms/inscripciones</code>),{" "}
          <strong>boletín</strong> (<code className="rounded bg-fog px-1">POST /api/forms/boletin</code>) y{" "}
          <strong>sugerencias</strong> (<code className="rounded bg-fog px-1">POST /api/forms/sugerencias</code>, la
          caja del hero). El sistema <strong>no envía correos</strong>: quien administra responde por el canal que dejó
          la persona y anota lo que hizo en el seguimiento, para que quede registro.
        </p>
      </Card>
    </div>
  );
}

/**
 * Subtítulo del diálogo: de dónde vino el mensaje y en qué estado está, que es
 * lo que hay que saber de un vistazo antes de leerlo entero.
 */
function subtituloDe(m: Mensaje): string {
  const partes = [
    ETIQUETAS_TIPO[m.tipo as TipoMensaje] ?? m.tipo,
    ETIQUETAS_ESTADO[m.estado ?? "nuevo"],
    formatFechaLocal(m.fecha),
  ];
  if (m.consentimiento === false) partes.push("sin constancia de autorización");
  return partes.join(" · ");
}

/**
 * Pie del diálogo: leer y el contador del menú. Eliminar no va aquí porque es la
 * única acción irreversible y se queda en el cuerpo, donde se pulse a
 * propósito.
 */
function pieDe(m: Mensaje, onToggleLeido: () => void): ReactNode {
  return (
    <>
      <Toggle checked={m.leido} onChange={onToggleLeido} label={m.leido ? "Leído" : "Marcar como leído"} />
      <span className="text-[0.7rem] text-muted">
        {m.leido
          ? "Este mensaje ya no cuenta en el aviso del menú."
          : "Mientras esté sin leer, cuenta en el aviso del menú."}
      </span>
    </>
  );
}

/**
 * Cuerpo del diálogo: el texto recibido tal cual, la acción para responderle y
 * el estado interno de la atención.
 *
 * Marcar como leído no está aquí sino en el pie del diálogo, y por eso no
 * recibe el callback: es el pie quien lo tiene.
 */
function MensajeDetalle({
  mensaje: m,
  onUpdate,
  onRemove,
}: {
  mensaje: Mensaje;
  // El `update` del backoffice devuelve el mensaje guardado, no `void`. Se
  // tipa como `Promise<unknown>` porque a esta vista solo le importa que la
  // llamada se haya resuelto.
  onUpdate: (cambios: Partial<Mensaje>) => Promise<unknown>;
  onRemove?: () => void;
}) {
  const [seguimiento, setSeguimiento] = useState(m.seguimiento ?? "");
  const [guardando, setGuardando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  // Si el mensaje se actualiza desde afuera (otra pestaña, otro usuario) mientras
  // el diálogo está abierto, la nota se realinea con el valor guardado. Se hace
  // durante el render y no en un `useEffect` a propósito: el efecto pinta el
  // cambio en un segundo render, en el que el textarea muestra brevemente un
  // valor viejo y el botón de guardar se enciende o apaga solo.
  const [seguimientoGuardado, setSeguimientoGuardado] = useState(m.seguimiento ?? "");
  if (m.seguimiento !== seguimientoGuardado) {
    setSeguimientoGuardado(m.seguimiento ?? "");
    setSeguimiento(m.seguimiento ?? "");
  }

  const seguimientoCambiado = seguimiento.trim() !== (m.seguimiento ?? "").trim();

  async function guardarSeguimiento() {
    setGuardando(true);
    try {
      await onUpdate({ seguimiento: seguimiento.trim() || null });
      toast.success("Seguimiento guardado.");
    } catch {
      toast.error("No se pudo guardar el seguimiento.");
    } finally {
      setGuardando(false);
    }
  }

  async function copiarMensaje() {
    try {
      await navigator.clipboard.writeText(m.mensaje ?? "");
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast.error("No se pudo copiar. Selecciona el texto a mano.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-[0.7rem] font-semibold tracking-wide text-muted uppercase">
          Texto recibido
        </p>
        <blockquote className="mt-2 rounded-xl border-l-[3px] border-l-lime-hot bg-fog/60 px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap text-body">
          {m.mensaje}
        </blockquote>
      </div>

      <div>
        <p className="font-display text-[0.7rem] font-semibold tracking-wide text-muted uppercase">
          Responder
        </p>
        {m.email ? (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {/* El sistema no manda correos: lo que puede hacer es abrir el
                programa de correo con el texto preparado. El `mailto` lleva el
                mensaje original citado y el asunto, pero **nunca** la nota de
                seguimiento: esa es interna y no puede salir hacia afuera. */}
            <a
              href={enlaceDeRespuesta(m)}
              className="inline-flex items-center gap-2 rounded-pill bg-ink px-4 py-2 font-display text-xs font-semibold text-paper transition-colors hover:bg-ink-mid"
            >
              <Mail className="size-4" /> Responder por correo
            </a>
            <Button variant="outline" size="sm" onClick={() => void copiarMensaje()}>
              <Copy className="size-3.5" /> {copiado ? "Copiado" : "Copiar texto"}
            </Button>
            <span className="text-xs text-muted">A {m.email}</span>
          </div>
        ) : (
          <p className="mt-2 rounded-xl bg-fog/60 px-4 py-3 text-xs text-muted">
            Esta persona no dejó canal, así que no hay a dónde responderle desde aquí. Si la alcanzas por
            teléfono o en persona, cuéntalo en el seguimiento de abajo: es el registro de que se atendió.
          </p>
        )}
      </div>

      <div>
        <p className="font-display text-[0.7rem] font-semibold tracking-wide text-muted uppercase">
          Estado de atención
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {FILTROS_ESTADO.filter((f) => f.value !== "todos" && f.value !== "sin_responder").map((f) => (
            <button
              key={f.value}
              type="button"
              disabled={guardando}
              onClick={() => onUpdate({ estado: f.value as EstadoMensaje })}
              className={cn(
                "rounded-pill border px-3 py-1 font-display text-[0.7rem] font-semibold transition-colors disabled:opacity-50",
                (m.estado ?? "nuevo") === f.value
                  ? "border-ink bg-ink text-paper"
                  : "border-mist bg-paper text-muted hover:text-ink",
              )}
            >
              {ETIQUETAS_ESTADO[f.value as EstadoMensaje]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor={`seguimiento-${m.id}`}
          className="font-display text-[0.7rem] font-semibold tracking-wide text-muted uppercase"
        >
          Seguimiento interno
        </label>
        <textarea
          id={`seguimiento-${m.id}`}
          value={seguimiento}
          onChange={(e) => setSeguimiento(e.target.value)}
          rows={3}
          placeholder="A quién se le respondió, por qué canal y cuándo. Esto no se envía a la ciudadanía: es el registro del equipo."
          className="mt-2 w-full resize-y rounded-xl border border-mist bg-paper px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:border-lime-ink"
        />
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            disabled={!seguimientoCambiado || guardando}
            onClick={guardarSeguimiento}
            className="rounded-pill bg-ink px-3.5 py-1.5 font-display text-xs font-semibold text-paper transition-opacity disabled:opacity-40"
          >
            {guardando ? "Guardando…" : "Guardar seguimiento"}
          </button>
          {seguimientoCambiado ? (
            <span className="text-[0.7rem] text-muted">Hay cambios sin guardar</span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-stone pt-4">
        <span className="text-[0.7rem] text-muted">
          {m.email ? (
            <>
              Canal: <strong className="text-ink">{m.email}</strong>
            </>
          ) : (
            "Sin canal de respuesta"
          )}
        </span>
        <div className="flex-1" />
        {onRemove ? (
          <ConfirmButton label="Eliminar mensaje" onConfirm={onRemove} confirmText="¿Eliminar mensaje?" variant="outline">
            <Trash2 className="size-3.5" /> Eliminar
          </ConfirmButton>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Enlace `mailto` con el mensaje ya citado.
 *
 * Deliberadamente **no** incluye el `seguimiento`: es la nota interna del
 * equipo, y un `mailto:` abre el correo del administrador a la vista de quien
 * vaya a leerlo antes de enviarlo. Que la respuesta se escriba por fuera del
 * sistema es lo pactado; que el registro interno se salga con ella, no.
 */
function enlaceDeRespuesta(m: Mensaje): string {
  const asunto = encodeURIComponent(m.asunto ? `Re: ${m.asunto}` : "Mensaje del sitio");
  const cuerpo = encodeURIComponent(
    [
      "",
      "",
      "—",
      `${m.nombre} escribió el ${formatFechaLocal(m.fecha)}:`,
      "",
      m.mensaje ?? "",
      "",
    ].join("\n"),
  );
  return `mailto:${m.email}?subject=${asunto}&body=${cuerpo}`;
}

