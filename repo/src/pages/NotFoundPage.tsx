import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="glass flex flex-col items-center gap-3 rounded-3xl px-6 py-20 text-center">
      <span className="font-display text-5xl font-extrabold text-neon">404</span>
      <p className="font-display text-sm font-bold text-paper">Esta página no existe en el repositorio</p>
      <p className="max-w-sm text-xs text-muted">
        El documento pudo haber sido retirado, o la dirección está mal escrita.
      </p>
      <Link
        to="/"
        className="mt-2 inline-flex items-center gap-2 rounded-pill bg-neon px-5 py-2.5 font-display text-sm font-bold text-petro-deep no-underline transition-colors hover:bg-neon-deep"
      >
        <ArrowLeft className="size-4" />
        Volver al inicio
      </Link>
    </div>
  );
}