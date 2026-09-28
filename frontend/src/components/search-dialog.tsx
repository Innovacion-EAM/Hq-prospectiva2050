import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearch } from "@/hooks/use-search";
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
  // Lo que tenía el foco antes de abrir el diálogo. Sin esto, al cerrarlo el
  // foco se cae al <body> y quien navega con teclado tiene que recorrer la página
  // entera desde arriba para volver a donde estaba.
  const previoRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const buscar = useSearch();
  const hits = useMemo(() => buscar(q), [buscar, q]);

  useEffect(() => {
    if (open) {
      previoRef.current = document.activeElement as HTMLElement | null;
      setQ("");
      const t = window.setTimeout(() => inputRef.current?.focus(), 30);
      return () => window.clearTimeout(t);
    }
    // Al cerrar se devuelve el foco a donde estaba. Va en un efecto aparte para
    // que también funcione cuando el diálogo se desmonta en lugar de cerrarse.
  }, [open]);

  useEffect(() => {
    if (!open) {
      previoRef.current?.focus?.();
      previoRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      // `aria-modal="true"` promete que el foco no sale del diálogo, pero un
      // lector de pantalla sí puede recorrer el fondo: si no se atrapa el Tab,
      // el foco se va al contenido de detrás del velo y el diálogo queda
      // huérfano. Con dos elementos focusables (el input y el botón de
      // cerrar) el ciclo es trivial.
      if (e.key !== "Tab") return;
      const focoables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focoables || focoables.length === 0) return;
      const primero = focoables[0];
      const ultimo = focoables[focoables.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink/55 px-4 pt-24 backdrop-blur-sm">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Buscar en el sitio"
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-paper shadow-[var(--shadow-float)]"
      >
        <div className="flex items-center gap-3 border-b border-stone px-4">
          <Search className="size-5 text-muted" aria-hidden="true" />
          {/*
            El `placeholder` no es un nombre accesible: desaparece al escribir y
            los lectores de pantalla lo omiten. Sin esto el campo se anuncia
            simplemente como «campo de texto», y no hay forma de saber si es el
            buscador u otro campo.
          */}
          <input
            ref={inputRef}
            type="search"
            aria-label="Buscar noticias, documentos y dimensiones"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar noticias, documentos, dimensiones…"
            className="h-14 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted hover:bg-fog hover:text-ink"
            aria-label="Cerrar búsqueda"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        {/* El conteo se anuncia solo: quien va con lector de pantalla necesita
            saber si la búsqueda devolvió algo sin tener que contar los enlaces. */}
        <div className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
          {q.trim().length < 2 ? (
            <p className="px-3 py-8 text-center text-sm text-muted">
              Escribe al menos dos letras para buscar.
            </p>
          ) : hits.length === 0 ? (
            <p role="status" className="px-3 py-8 text-center text-sm text-muted">
              No encontramos resultados para “{q}”.
            </p>
          ) : (
            <ul aria-label={`${hits.length} resultados para ${q}`}>
              {hits.map((hit) => (
                <li key={hit.href + hit.title}>
                  <Link
                    to={hit.href}
                    onClick={onClose}
                    className={cn(
                      "block rounded-xl px-3 py-3 no-underline transition-colors hover:bg-fog focus:bg-fog",
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
