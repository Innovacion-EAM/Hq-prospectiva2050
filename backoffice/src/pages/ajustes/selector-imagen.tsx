import { useRef, useState } from "react";
import { ImageOff, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  EXTENSION_ARCHIVO_ACEPTADA,
  resolveUrl,
  uploadFileRequest,
} from "@/lib/data";
import { Button } from "@/components/ui";

/**
 * Campo de imagen de los ajustes: subir una, quitarla y ver la que hay.
 *
 * Existía dentro del módulo Header para el logo. Al abrir el módulo Home hacía
 * falta en tres sitios más (fondo del hero, foto del hero, fondo del proyecto),
 * y copiarlo cuatro veces habría significado cuatro versiones del mismo
 * `subir()` con el mismo manejo de errores y el mismo limpio del input.
 *
 * La diferencia con el logo: aquí **quitar no significa "dejar sin imagen"**,
 * significa "volver a la imagen que trae el sitio". Por eso el botón dice
 * "Usar la del sitio" y el campo queda en la cadena vacía. El backend lo acepta
 * (`VacioOpcional`) y el frontend lo resuelve al respaldo.
 */
export function SelectorImagen({
  valor,
  onChange,
  etiqueta,
  /** Cómo se llama la imagen que trae el sitio, en el texto de ayuda. */
  respaldo,
  /** `contiene` deja la imagen entera; `corta` la llena. Los fondos van cortados. */
  forma = "contiene",
}: {
  /**
   * La ruta guardada. Admite `null` porque es lo que devuelve la API cuando la
   * imagen es la del sitio; `AjustesPage` ya lo normaliza a `""` en la portada,
   * y aquí se acepta igual para que el componente no dependa de eso.
   */
  valor: string | null;
  onChange: (ruta: string) => void;
  etiqueta: string;
  respaldo: string;
  forma?: "contiene" | "corta";
}) {
  const [subiendo, setSubiendo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function subir(file: File | undefined) {
    if (!file) return;
    if (!EXTENSION_ARCHIVO_ACEPTADA.test(file.name)) {
      toast.error("La imagen debe ser un archivo: PNG, JPG, WebP o GIF.");
      return;
    }
    setSubiendo(true);
    try {
      const saved = await uploadFileRequest(file);
      // Se guarda la ruta relativa (`/uploads/...`) y no la URL que devuelve la
      // biblioteca, como en el resto del panel: cambiar de dominio no tiene que
      // obligar a reescribir la fila.
      onChange(saved.url);
      toast.success(`Imagen subida. No olvides guardar los ajustes.`);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : `No se pudo subir la imagen. Inténtalo de nuevo.`,
      );
    } finally {
      setSubiendo(false);
      // Se limpia el input para que volver a elegir el mismo archivo dispare
      // `change` otra vez: si no, no se podría resubir sin recargar la página.
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const src = resolveUrl(valor);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-4">
        <div
          className={
            forma === "corta"
              ? "grid h-16 w-28 shrink-0 place-items-center overflow-hidden rounded-2xl bg-ink-deep"
              : "grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-ink-deep p-2"
          }
        >
          {src ? (
            <img
              src={src}
              alt={`Vista previa de ${etiqueta}`}
              className={forma === "corta" ? "size-full object-cover" : "max-h-16 max-w-full object-contain"}
            />
          ) : (
            <span className="px-2 text-center font-display text-[0.55rem] font-semibold tracking-wide text-mist uppercase">
              La del sitio
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="lime" onClick={() => inputRef.current?.click()} disabled={subiendo}>
            <Upload className="size-4" /> {subiendo ? "Subriendo…" : "Subir imagen"}
          </Button>
          {/* El botón solo aparece cuando hay una imagen puesta. Si no hay
              ninguna, el recuadro ya dice "La del sitio" y no hay nada que
              deshacer: aparecería siempre y sería un botón que no hace nada. */}
          {valor ? (
            <Button variant="ghost" onClick={() => onChange("")}>
              <ImageOff className="size-4" /> Usar la del sitio
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
        PNG, JPG, WebP o GIF. Es opcional: si no subes ninguna se usa {respaldo}, y
        con «Usar la del sitio» se vuelve a ella en cualquier momento.
      </p>
    </div>
  );
}