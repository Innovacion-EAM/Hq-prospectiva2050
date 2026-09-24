import { useEffect, useRef, useState } from "react";
import { Check, ImagePlus, Upload } from "lucide-react";
import { collections, uploadFileRequest } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button, Spinner, Thumb } from "@/components/ui";
import type { Media } from "@/lib/types";

function isImage(media: Media): boolean {
  return media.mime.startsWith("image/");
}

function looksLikeImage(url: string): boolean {
  return /\.(png|jpe?g|webp|gif|svg|avif|bmp)$/i.test(url.split("?")[0] || "");
}

export function MediaPicker({
  value,
  onSelect,
  hint,
}: {
  value: string;
  onSelect: (url: string) => void;
  hint?: string;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setLoading(true);
    collections
      .media()
      .list()
      .then((list) => alive && setItems(list))
      .catch(() => alive && setItems([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [open]);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const saved = await uploadFileRequest(file);
      setItems((prev) => [saved, ...prev]);
      onSelect(saved.url);
    } catch {
      // el error se muestra en la página que usa el picker
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
        onChange={(e) => {
          void onFile(e.target.files?.[0]);
          e.currentTarget.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-xl border border-mist bg-paper p-2 text-left transition-colors hover:border-lime-hot"
      >
        {value ? (
          looksLikeImage(value) ? (
            <Thumb src={value} alt="Seleccionada" className="size-14 shrink-0" />
          ) : (
            <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-fog px-2 text-[0.6rem] font-bold text-muted">
              {value.split(".").pop()?.toUpperCase()}
            </span>
          )
        ) : (
          <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-fog text-muted">
            <ImagePlus className="size-5" />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block font-display text-xs font-semibold text-ink">
            {value ? "Cambiar archivo" : "Seleccionar archivo"}
          </span>
          <span className="mt-0.5 block truncate text-xs text-muted">
            {value || "Sube una imagen o abre la galería"}
          </span>
        </span>
        <span className="rounded-pill bg-fog px-3 py-1.5 text-xs font-semibold text-ink">
          {value ? "Cambiar" : "Elegir"}
        </span>
      </button>
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-ink/55 px-4 pt-16 pb-8 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-paper shadow-[var(--shadow-float)]">
            <div className="flex items-center justify-between border-b border-stone px-5 py-4">
              <div>
                <h3 className="font-display text-base font-bold text-ink">Biblioteca de archivos</h3>
                <p className="text-xs text-muted">Sube una imagen o usa una existente.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cerrar
              </Button>
            </div>
            <div className="border-b border-stone bg-fog/60 px-5 py-3">
              <Button variant="lime" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
                <Upload className="size-3.5" /> {uploading ? "Subiendo…" : "Subir archivo"}
              </Button>
            </div>
            <div className="max-h-[52vh] overflow-y-auto p-5">
              {loading ? (
                <div className="grid place-items-center py-10">
                  <Spinner />
                </div>
              ) : items.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted">
                  Aún no hay archivos subidos.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                  {items.map((m) => {
                    const selected = m.url === value;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          onSelect(m.url);
                          setOpen(false);
                        }}
                        className={cn(
                          "group relative aspect-square overflow-hidden rounded-xl border bg-fog transition-colors",
                          selected ? "border-lime ring-2 ring-lime/40" : "border-stone hover:border-lime-hot/50",
                        )}
                      >
                        {isImage(m) ? (
                          <img src={m.url} alt={m.filename} className="h-full w-full object-cover" />
                        ) : (
                          <span className="grid h-full w-full place-items-center text-[0.6rem] font-bold text-muted">
                            {m.filename.split(".").pop()?.toUpperCase()}
                          </span>
                        )}
                        {selected ? (
                          <span className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-lime text-lime-fg">
                            <Check className="size-3" />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}