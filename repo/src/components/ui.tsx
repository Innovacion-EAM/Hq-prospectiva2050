import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  title,
  subtitle,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <section className={cn("glass rounded-2xl p-5", className)}>
      {title ? (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="font-display text-sm font-bold text-paper">{title}</h2>
            {subtitle ? <p className="mt-0.5 text-xs text-muted">{subtitle}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function BigNumber({ value, label, color }: { value: string | number; label: string; color?: string }) {
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-5">
      {/* Halo sutil del color de la serie, para que el número "respire". */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full opacity-20 blur-2xl"
        style={{ background: color ?? "var(--color-neon)" }}
      />
      <p className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl" style={{ color: color ?? "var(--color-neon)" }}>
        {value}
      </p>
      <p className="mt-2 text-xs font-medium text-mist">{label}</p>
    </div>
  );
}

export function Badge({
  children,
  color,
  className,
}: {
  children: ReactNode;
  color?: string | null;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-0.5 font-display text-[0.68rem] font-semibold",
        className,
      )}
      style={
        color
          ? { color, borderColor: `${color}55`, background: `${color}14` }
          : { color: "var(--color-mist)", borderColor: "var(--color-line)", background: "var(--color-petro-mid)" }
      }
    >
      {children}
    </span>
  );
}

export function Dot({ color, className }: { color: string | null; className?: string }) {
  return (
    <span
      className={cn("inline-block size-2 shrink-0 rounded-full", className)}
      style={{ background: color ?? "var(--color-mist)", boxShadow: color ? `0 0 8px ${color}88` : undefined }}
    />
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-muted">
      <span className="size-5 animate-spin rounded-full border-2 border-line border-t-neon" />
      <span className="text-xs">Cargando…</span>
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="glass flex flex-col items-center gap-2 rounded-2xl px-6 py-16 text-center">
      <span className="text-3xl">🗂️</span>
      <p className="font-display text-sm font-bold text-paper">{title}</p>
      {hint ? <p className="max-w-sm text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="glass flex flex-col items-center gap-2 rounded-2xl px-6 py-16 text-center">
      <span className="text-3xl">⚠️</span>
      <p className="font-display text-sm font-bold text-paper">Ups, algo falló</p>
      <p className="max-w-sm text-xs text-muted">{message}</p>
    </div>
  );
}