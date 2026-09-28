import { useState } from "react";
import { Check, Facebook, Link2, Linkedin, Mail, Share2 } from "lucide-react";

/**
 * Botones para compartir una página.
 *
 * El documento de arquitectura pide que el contenido sea compartible. Se
 * cubren redes sociales y, sobre todo, el enlace directo: es el único canal que
 * funciona sin que la persona tenga cuenta en una plataforma.
 */
export function ShareRow({ titulo }: { titulo: string }) {
  const [copiado, setCopiado] = useState(false);

  function urlActual(): string {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }

  async function compartir(destino: "facebook" | "linkedin" | "correo") {
    const url = encodeURIComponent(urlActual());
    const texto = encodeURIComponent(titulo);
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      correo: `mailto:?subject=${texto}&body=${texto}%0A%0A${url}`,
    };
    window.open(urls[destino], destino === "correo" ? "_self" : "_blank", "noopener,noreferrer");
  }

  async function copiarEnlace() {
    const url = urlActual();
    try {
      if (navigator.share && typeof navigator.share === "function") {
        // En móvil el menú nativo del sistema suele ser la mejor experiencia.
        await navigator.share({ title: titulo, url });
        return;
      }
    } catch {
      // El usuario canceló el diálogo nativo: se cae al portapapeles.
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  const base =
    "inline-flex items-center gap-2 rounded-full border border-stone bg-paper px-3 py-1.5 font-display text-xs font-semibold text-ink transition-colors hover:bg-fog";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 font-display text-xs font-semibold text-muted">
        <Share2 className="size-3.5" aria-hidden="true" />
        Compartir
      </span>
      <button type="button" onClick={() => compartir("facebook")} className={base} aria-label="Compartir en Facebook">
        <Facebook className="size-3.5" aria-hidden="true" />
        Facebook
      </button>
      <button type="button" onClick={() => compartir("linkedin")} className={base} aria-label="Compartir en LinkedIn">
        <Linkedin className="size-3.5" aria-hidden="true" />
        LinkedIn
      </button>
      <button type="button" onClick={() => compartir("correo")} className={base} aria-label="Compartir por correo">
        <Mail className="size-3.5" aria-hidden="true" />
        Correo
      </button>
      <button
        type="button"
        onClick={copiarEnlace}
        className={base}
        aria-label={copiado ? "Enlace copiado" : "Copiar enlace"}
      >
        {copiado ? (
          <Check className="size-3.5 text-lime-ink" aria-hidden="true" />
        ) : (
          <Link2 className="size-3.5" aria-hidden="true" />
        )}
        {copiado ? "Enlace copiado" : "Copiar enlace"}
      </button>
    </div>
  );
}
