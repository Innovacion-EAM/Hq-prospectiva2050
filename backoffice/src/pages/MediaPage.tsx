import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { collections, uploadFileRequest } from "@/lib/data";
import { toast } from "sonner";
import { Button, ConfirmButton, EmptyState, PageHeader, Spinner } from "@/components/ui";
import type { Media } from "@/lib/types";

function isImage(m: Media): boolean {
  return m.mime.startsWith("image/");
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loadinglist, setLoadingList] = useState(true);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    collections
      .media()
      .list()
      .then((list) => alive && setMedia(list))
      .catch(() => alive && setMedia([]))
      .finally(() => alive && setLoadingList(false));
    return () => {
      alive = false;
    };
  }, []);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const saved = await uploadFileRequest(file);
      setMedia((prev) => [saved, ...prev]);
      toast.success("Archivo subido a la biblioteca");
    } catch {
      toast.error("No se pudo subir el archivo");
    } finally {
      setUploading(false);
    }
  }

  async function borrar(m: Media) {
    try {
      await collections.media().remove(m.id);
      setMedia((prev) => prev.filter((x) => x.id !== m.id));
      toast.success("Archivo eliminado");
    } catch {
      toast.error("No se pudo eliminar el archivo");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Galería de imágenes"
        description="Biblioteca reutilizable: sube imágenes y documentos para usarlos en noticias, páginas y fichas."
        actions={
          <Button variant="lime" onClick={() => inputRef.current?.click()} disabled={uploading}>
            <Upload className="size-4" /> {uploading ? "Subiendo…" : "Subir archivo"}
          </Button>
        }
      />
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

      {loadinglist ? (
        <div className="p-14">
          <Spinner />
        </div>
      ) : media.length === 0 ? (
        <EmptyState
          title="La biblioteca está vacía"
          description="Sube la primera imagen; luego podrás reutilizarla desde cualquier formulario."
          action={
            <Button variant="lime" onClick={() => inputRef.current?.click()}>
              <ImagePlus className="size-4" /> Subir archivo
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((m) => (
            <div
              key={m.id}
              className="group overflow-hidden rounded-2xl border border-stone bg-paper shadow-xs"
            >
              <div className="aspect-square bg-fog">
                {isImage(m) ? (
                  <img src={m.url} alt={m.filename} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <span className="grid h-full w-full place-items-center text-sm font-bold text-muted">
                    {m.filename.split(".").pop()?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-ink" title={m.filename}>
                    {m.filename}
                  </p>
                  <p className="text-[0.68rem] text-muted">{formatSize(m.size)}</p>
                </div>
                <ConfirmButton
                  label="Eliminar archivo"
                  confirmText="¿Eliminar archivo de la biblioteca?"
                  onConfirm={() => borrar(m)}
                >
                  <Trash2 className="size-3.5" />
                </ConfirmButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}