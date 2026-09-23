import { Link } from "react-router-dom";
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

export function Logo({
  variant = "light",
  compact = false,
}: {
  variant?: "light" | "dark";
  compact?: boolean;
}) {
  const light = variant === "light";
  return (
    <Link
      to="/"
      className="group flex items-center gap-2.5 no-underline"
      aria-label="Horizonte Quindío — inicio"
    >
      <LogoMark
        className={cn("h-11 w-11 transition-transform group-hover:scale-105", light ? "text-paper" : "text-ink")}
      />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-[0.7rem] font-extrabold tracking-[0.18em] uppercase sm:text-[0.78rem]",
            light ? "text-paper" : "text-ink",
          )}
        >
          Horizonte Quindío
        </span>
        {!compact ? (
          <span
            className={cn(
              "mt-1 font-display text-[0.58rem] font-semibold tracking-[0.28em] uppercase",
              light ? "text-lime" : "text-muted",
            )}
          >
            Prospectiva 2050
          </span>
        ) : null}
      </span>
    </Link>
  );
}
