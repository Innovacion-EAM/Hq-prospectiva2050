import { Link } from "react-router-dom";
import { useSite } from "@/data/site-context";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("shrink-0", className)}
      aria-hidden="true"
      fill="none"
    >
      <defs>
        <linearGradient id="qGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.85" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Main Outer Q Ribbon Ring */}
      <path
        d="M 50 10 C 26 10, 10 28, 10 50 C 10 68, 22 81, 38 82 C 28 75, 22 62, 22 48 C 22 30, 34 20, 50 20 C 65 20, 76 30, 76 48 C 76 56, 73 63, 67 68 C 76 61, 84 48, 82 38 C 79 20, 67 10, 50 10 Z"
        fill="url(#qGrad)"
      />

      {/* S-Wave Ribbon Tail */}
      <path
        d="M 32 68 C 42 68, 52 52, 64 52 C 73 52, 79 66, 96 71 C 82 71, 72 62, 64 57 C 54 57, 44 76, 32 68 Z"
        fill="url(#qGrad)"
      />

      {/* Bottom Accent Ribbon Line */}
      <path
        d="M 30 78 C 42 78, 55 72, 60 68 C 52 74, 40 81, 30 78 Z"
        fill="url(#qGrad)"
      />
    </svg>
  );
}

/**
 * Marca y textos del encabezado.
 *
 * Los textos salen de la base (Ajustes → Header) y la imagen también: si se subió
 * un logo se muestra ese, y si no se ve la marca dibujada en `LogoMark`, que es
 * lo que había antes de que el módulo existiera.
 *
 * `compact` oculta el subtítulo y lo usa el pie de página, donde el logo va
 * pequeño y de adorno.
 */
export function Logo({
  variant = "light",
  compact = false,
}: {
  variant?: "light" | "dark";
  compact?: boolean;
}) {
  const light = variant === "light";
  const { LOGO } = useSite();

  return (
    <Link
      to="/"
      className="group flex items-center gap-2.5 no-underline"
      aria-label={`${LOGO.titulo} — inicio`}
    >
      {LOGO.url ? (
        /*
          La imagen se recorta con `object-contain` y se limita a la altura que
          ocupaba la marca dibujada. Sin ese tope, un logo alto estiraría la
          barra más allá de los 4.5rem y desarmaría el encabezado entero; y con
          `object-contain` no se deforma aunque tenga otra proporción.
        */
        <img
          src={LOGO.url}
          alt=""
          className="max-h-11 max-w-[11rem] shrink-0 object-contain transition-transform group-hover:scale-105"
        />
      ) : (
        <LogoMark
          className={cn("h-11 w-11 transition-transform group-hover:scale-105", light ? "text-paper" : "text-ink")}
        />
      )}
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-[0.7rem] font-extrabold tracking-[0.18em] uppercase sm:text-[0.78rem]",
            light ? "text-paper" : "text-ink",
          )}
        >
          {LOGO.titulo}
        </span>
        {!compact && LOGO.subtitulo ? (
          <span
            className={cn(
              "mt-1 font-display text-[0.58rem] font-semibold tracking-[0.28em] uppercase",
              light ? "text-lime" : "text-muted",
            )}
          >
            {LOGO.subtitulo}
          </span>
        ) : null}
      </span>
    </Link>
  );
}