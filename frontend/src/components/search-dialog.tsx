import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSite } from "@/data/site-context";
import { cn } from "@/lib/utils";

export function SearchDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { searchSite } = useSite();
  const hits = searchSite(q);

  useEffect(() => {
    if (open) {
      setQ("");
      const t = window.setTimeout(() => inputRef.current?.focus(), 30);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink/55 px-4 pt-24 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Buscar en el sitio"
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-paper shadow-[var(--shadow-float)]"
      >
        <div className="flex items-center gap-3 border-b border-stone px-4">
          <Search className="size-5 text-muted" aria-hidden />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar documentos, dimensiones, noticias…"
            className="h-14 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted hover:bg-fog hover:text-ink"
            aria-label="Cerrar búsqueda"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
          {q.trim().length < 2 ? (
            <p className="px-3 py-8 text-center text-sm text-muted">
              Escribe al menos dos letras para buscar.
            </p>
          ) : hits.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted">
              No encontramos resultados para “{q}”.
            </p>
          ) : (
            <ul className="flex flex-col">
              {hits.map((hit) => (
                <li key={hit.href + hit.title}>
                  <Link
                    to={hit.href}
                    onClick={onClose}
                    className={cn(
                      "block rounded-xl px-3 py-3 no-underline transition-colors hover:bg-fog",
                    )}
                  >
                    <span className="font-display text-[0.65rem] font-semibold tracking-widest text-muted uppercase">
                      {hit.kind}
                    </span>
                    <span className="mt-0.5 block font-display text-sm font-semibold text-ink">
                      {hit.title}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-sm text-muted">
                      {hit.excerpt}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
