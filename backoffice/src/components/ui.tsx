import { type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ChevronDown, Plus, Search, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveUrl } from "@/lib/data";

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "lime" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "icon";
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-pill font-display font-semibold transition-all duration-200 tap-scale disabled:pointer-events-none disabled:opacity-50",
        size === "sm" && "px-3.5 py-1.5 text-xs",
        size === "md" && "px-5 py-2.5 text-sm",
        size === "icon" && "size-9",
        variant === "primary" && "bg-ink text-paper shadow-sm hover:bg-ink-mid",
        variant === "lime" && "bg-lime text-lime-fg hover:bg-lime-deep",
        variant === "outline" && "border border-mist bg-paper text-ink hover:border-ink/40 hover:bg-fog",
        variant === "ghost" && "text-muted hover:bg-fog hover:text-ink",
        variant === "danger" && "bg-rose-600 text-white hover:bg-rose-700",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconBtn({
  label,
  danger,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; danger?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "grid size-8 place-items-center rounded-full transition-colors",
        danger ? "text-muted hover:bg-rose-50 hover:text-rose-600" : "text-muted hover:bg-fog hover:text-ink",
        className,
      )}
      {...props}
    >
      {props.children}
    </button>
  );
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block font-display text-xs font-semibold text-ink">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[0.7rem] text-muted">{hint}</span> : null}
    </label>
  );
}

export const inputCls =
  "h-10 w-full rounded-lg border border-mist bg-paper px-3 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-lime-hot focus:ring-2 focus:ring-lime/40";

export const textareaCls =
  "w-full resize-y rounded-lg border border-mist bg-paper px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-lime-hot focus:ring-2 focus:ring-lime/40";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputCls, props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(textareaCls, props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className={cn(inputCls, "appearance-none pr-9", props.className)} />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2"
    >
      <span
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-lime-hot" : "bg-mist",
        )}
      >
        <span
          className={cn(
            "inline-block size-4 transform rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </span>
      {label ? <span className="text-xs font-medium text-ink">{label}</span> : null}
    </button>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "lime" | "ink" | "convoca" | "danger" | "rose";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 font-display text-[0.65rem] font-semibold uppercase tracking-wide",
        tone === "neutral" && "bg-fog text-muted",
        tone === "lime" && "bg-lime text-lime-fg",
        tone === "ink" && "bg-ink text-paper",
        tone === "convoca" && "bg-convoca text-white",
        tone === "danger" && "bg-rose-600 text-white",
        tone === "rose" && "bg-rose-100 text-rose-700",
      )}
    >
      {children}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-stone bg-paper shadow-xs", className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-mist bg-paper px-6 py-14 text-center">
      <p className="font-display text-sm font-bold text-ink">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-xs text-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "mx-auto size-6 animate-spin rounded-full border-2 border-mist border-t-ink",
        className,
      )}
    />
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      <input
        // El `placeholder` no es un nombre accesible: desaparece al escribir y
        // los lectores de pantalla lo omiten. El texto visible del `SearchInput`
        // vive en el `PageHeader` de cada página, así que aquí va el nombre real.
        aria-label="Buscar"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(inputCls, "pl-9")}
      />
    </div>
  );
}

export function StringsEditor({
  label,
  value,
  onChange,
  hint,
  placeholder = "Texto",
}: {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  hint?: string;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const clean = draft.trim();
    if (!clean) return;
    onChange([...value, clean]);
    setDraft("");
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2">
        <Field label={label} hint={hint} className="flex-1">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
        </Field>
        <Button variant="lime" size="md" onClick={add} aria-label={`Agregar ${label}`}>
          <Plus className="size-4" />
        </Button>
      </div>
      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((item, i) => (
            <li
              key={`${item}-${i}`}
              className="inline-flex items-center gap-1 rounded-pill bg-fog px-3 py-1 text-xs text-ink"
            >
              <span className="max-w-60 truncate">{item}</span>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                aria-label="Quitar"
                className="text-muted hover:text-rose-600"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function ConfirmButton({
  onConfirm,
  label,
  confirmText = "¿Eliminar definitivamente?",
  children,
  variant = "ghost",
}: {
  onConfirm: () => void;
  label: string;
  confirmText?: string;
  children: ReactNode;
  variant?: "ghost" | "outline";
}) {
  const [armed, setArmed] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => () => clearTimeout(timeout.current ?? undefined), []);

  return (
    <Button
      variant={armed ? "danger" : variant}
      size="sm"
      className={cn(armed && "rounded-lg")}
      aria-label={label}
      title={label}
      onClick={() => {
        if (armed) {
          clearTimeout(timeout.current ?? undefined);
          setArmed(false);
          onConfirm();
        } else {
          setArmed(true);
          timeout.current = setTimeout(() => setArmed(false), 3000);
        }
      }}
    >
      {armed ? confirmText : children}
    </Button>
  );
}

export function Thumb({ src, alt, className }: { src: string; alt: string; className?: string }) {
  // `src` puede venir como ruta relativa (`/uploads/...`) desde la base de datos,
  // así que se resuelve contra `API_BASE` antes de ponerlo en el `src`. Sin esto
  // el panel pediría la imagen al nginx del backoffice en vez de al API y salía
  // el hueco gris.
  const url = resolveUrl(src);
  return (
    <div
      className={cn(
        "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-stone bg-fog",
        className,
      )}
    >
      {url ? (
        <img src={url} alt={alt} className="h-full w-full object-cover" loading="lazy" />
      ) : null}
    </div>
  );
}

export function LinkBtn({
  to,
  variant = "primary",
  size = "md",
  children,
  className,
}: {
  to: string;
  variant?: "primary" | "lime" | "outline" | "ghost";
  size?: "sm" | "md";
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-pill font-display font-semibold transition-all duration-200 no-underline",
        size === "sm" ? "px-3.5 py-1.5 text-xs" : "px-5 py-2.5 text-sm",
        variant === "primary" && "bg-ink text-paper shadow-sm hover:bg-ink-mid",
        variant === "lime" && "bg-lime text-lime-fg hover:bg-lime-deep",
        variant === "outline" && "border border-mist bg-paper text-ink hover:bg-fog",
        variant === "ghost" && "text-muted hover:bg-fog hover:text-ink",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function FormGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-6 sm:grid-cols-2">{children}</div>;
}

export function Divider({ label }: { label?: string }) {
  return label ? (
    <div className="flex items-center gap-3 py-2">
      <span className="font-display text-sm font-bold text-ink">{label}</span>
      <span className="h-px flex-1 bg-stone" />
    </div>
  ) : (
    <div className="h-px bg-stone" />
  );
}

export function ParagraphEditor({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  hint?: string;
}) {
  function setAt(i: number, text: string) {
    onChange(value.map((p, j) => (j === i ? text : p)));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between">
        <span className="font-display text-xs font-semibold text-ink">{label}</span>
        <Button
          variant="lime"
          size="sm"
          onClick={() => onChange([...value, ""])}
          aria-label="Agregar párrafo"
        >
          <Plus className="size-3.5" /> Párrafo
        </Button>
      </div>
      {hint ? <span className="mt-1 block text-[0.7rem] text-muted">{hint}</span> : null}
      {value.length === 0 ? (
        <p className="rounded-lg border border-dashed border-mist px-3 py-4 text-center text-xs text-muted">
          Sin contenido todavía. Agrega el primer párrafo.
        </p>
      ) : (
        <ul className="space-y-2">
          {value.map((paragraph, i) => (
            <li key={i} className="group relative">
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                aria-label="Eliminar párrafo"
                className="absolute right-2 top-2 z-10 grid size-6 place-items-center rounded-md bg-ink/80 text-paper opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="size-3" />
              </button>
              <textarea
                // Hay varios párrafos y el `label` del editor no se puede
                // reutilizar tal cual: se numera para que se sepa cuál es cuál.
                aria-label={`${label}, párrafo ${i + 1} de ${value.length}`}
                rows={3}
                value={paragraph}
                onChange={(e) => setAt(i, e.target.value)}
                placeholder="Escribe el párrafo..."
                className={cn(textareaCls, "group-hover:border-ink/30")}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Snippet({ children }: { children: ReactNode }) {
  return <pre className="rounded-lg bg-fog p-2 text-[0.7rem] text-body whitespace-pre-wrap break-words">{children}</pre>;
}
/**
 * Diálogo modal. Se monta en un `portal` sobre `document.body` para que el
 * `z-index` no compita con el de la página y para que el foco entre aquí aunque
 * el contenido esté anidado en algo con su propio contexto de apilamiento.
 *
 * Cierra con `Escape`, con un clic en el fondo y con el botón de la esquina, que
 * son las tres formas que la gente ya tiene automatizadas en la cabeza. Mientras
 * está abierto el fondo no hace scroll, porque sin eso el documento se desplaza
 * un poco al abrir y otro poco al cerrar y parece que la página parpadeó.
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: "md" | "lg";
}) {
  const panel = useRef<HTMLDivElement>(null);
  /**
   * El cierre se guarda en una ref y no en las dependencias del efecto. La
   * función que se pasa suele ser una flecha creada en el render del padre, así
   * que su identidad cambia en cada render: si fuera dependencia, el efecto se
   * re-ejecutaría sin parar y volvería a robarle el foco al panel mientras la
   * persona está escribiendo en un campo. Con la ref, lo único que reinicia el
   * efecto es que el diálogo se abra o se cierre.
   */
  const alCerrar = useRef(onClose);
  useEffect(() => {
    alCerrar.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") alCerrar.current();
    };
    document.addEventListener("keydown", alPulsar);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // El foco entra al diálogo al abrirlo. Sin esto se queda en el botón de la
    // fila que lo abrió, y al tabular se seguiría moviendo por la lista de
    // detrás, que es justo lo que un modal debe impedir.
    panel.current?.focus();
    return () => {
      document.removeEventListener("keydown", alPulsar);
      document.body.style.overflow = overflowPrevio;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/55 px-4 py-8 backdrop-blur-sm"
      onClick={(e) => {
        // Solo cierra si el clic fue en el fondo, no si venía de dentro del
        // panel: `e.target` es el nodo exacto donde se presionó.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          "my-auto w-full overflow-hidden rounded-2xl bg-paper shadow-[var(--shadow-float)] outline-none",
          width === "md" ? "max-w-2xl" : "max-w-4xl",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-stone px-5 py-4">
          <div className="min-w-0">
            <h2 className="font-display text-base font-bold text-ink">{title}</h2>
            {subtitle ? <p className="mt-0.5 text-xs text-muted">{subtitle}</p> : null}
          </div>
          <IconBtn label="Cerrar" onClick={onClose}>
            <X className="size-4" />
          </IconBtn>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">{children}</div>
        {footer ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-stone bg-fog/50 px-5 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
