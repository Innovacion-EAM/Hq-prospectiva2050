import { useRef, useState } from "react";
import { ImageOff, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  EXTENSION_ARCHIVO_ACEPTADA,
  resolveUrl,
  uploadFileRequest,
} from "@/lib/data";
import { Button, Field, Input } from "@/components/ui";
import type { SiteSettings } from "@/lib/types";
import { ModuloCard, NavLinksEditor } from "./nav-links-editor";

/**
 * Módulo "Header": la marca y los textos del encabezado, y el orden de los
 * enlaces del menú.
 *
 * Antes esto estaba escrito en el código del frontend, así que cambiar el orden
 * del menú o el nombre del logo era cosa de tocar el repositorio y volver a
 * compilar. Ahora es una fila de la configuración del sitio, y este módulo es su
 * pantalla.
 */
export function ModuloHeader({
  form,
  commit,
}: {
  form: SiteSettings;
  commit: (patch: Partial<SiteSettings>) => void;
}) {
  const [subiendo, setSubiendo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function subir(file: File | undefined) {
    if (!file) return;
    if (!EXTENSION_ARCHIVO_ACEPTADA.test(file.name)) {
      toast.error("El logo debe ser una imagen: PNG, JPG, WebP o GIF.");
      return;
    }
    setSubiendo(true);
    try {
      const saved = await uploadFileRequest(file);
      // Se guarda la ruta relativa (`/uploads/...`) y no la URL que devuelve la
      // biblioteca, igual que en el resto del panel: cambiar de dominio no tiene
      // que obligar a reescribir la fila.
      commit({ logoUrl: saved.url });
      toast.success("Logo subido. No olvides guardar los ajustes.");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "No se pudo subir el logo. Inténtalo de nuevo.",
      );
    } finally {
      setSubiendo(false);
      // Se limpia el input para que volver a elegir el mismo archivo dispare
      // `change` otra vez: si no, no se podría resubir sin recargar la página.
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const logoUrl = resolveUrl(form.logoUrl);

  return (
    <div className="space-y-6">
      <ModuloCard
        titulo="Marca"
        descripcion="La imagen que se ve arriba a la izquierda. Si no subes ninguna, se usa la marca propia del sitio."
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="grid size-20 shrink-0 place-items-center rounded-2xl bg-ink-deep p-2">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Vista previa del logo"
                className="max-h-16 max-w-full object-contain"
              />
            ) : (
              <span className="font-display text-[0.6rem] font-semibold tracking-wide text-mist uppercase">
                Marca del sitio
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="lime"
              onClick={() => inputRef.current?.click()}
              disabled={subiendo}
            >
              <Upload className="size-4" /> {subiendo ? "Subiendo…" : "Subir logo"}
            </Button>
            {form.logoUrl ? (
              <Button variant="ghost" onClick={() => commit({ logoUrl: "" })}>
                <ImageOff className="size-4" /> Quitar imagen
              </Button>
            ) : null}
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => subir(e.target.files?.[0])}
            />
          </div>
        </div>
        <p className="text-xs text-muted">
          PNG, JPG, WebP o GIF. Se muestra sin deformar y sin pasarse de la
          altura de la barra, así que conviene una imagen apaisada y con fondo
          transparente.
        </p>
      </ModuloCard>

      <ModuloCard titulo="Textos al lado del logo">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre">
            <Input
              value={form.logoTitulo}
              onChange={(e) => commit({ logoTitulo: e.target.value })}
              placeholder="Horizonte Quindío"
            />
          </Field>
          <Field
            label="Subtítulo"
            hint="Si lo dejas vacío se muestra el texto que trae el sitio por defecto."
          >
            <Input
              value={form.logoSubtitulo}
              onChange={(e) => commit({ logoSubtitulo: e.target.value })}
              placeholder="Prospectiva 2050"
            />
          </Field>
        </div>
      </ModuloCard>

      <ModuloCard
        titulo="Enlaces del menú"
        descripcion="El orden de esta lista es el orden en que se ven, de izquierda a derecha. Con las flechas se sube o se baja cada enlace."
      >
        <NavLinksEditor
          value={form.navLinks}
          onChange={(navLinks) => commit({ navLinks })}
        />
      </ModuloCard>
    </div>
  );
}