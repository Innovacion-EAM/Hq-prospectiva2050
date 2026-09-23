import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-display text-xs font-semibold tracking-[0.2em] text-lime-hot uppercase">
        404
      </p>
      <h1 className="mt-3 font-display text-display font-extrabold text-ink">
        No encontramos esta página
      </h1>
      <p className="mt-3 text-muted">
        El enlace puede haber cambiado. Vuelve al proyecto o recorre el mapa del sitio.
      </p>
      <Link
        to="/proyecto"
        className="mt-8 inline-flex rounded-pill bg-lime px-5 py-2.5 font-display text-sm font-semibold text-lime-fg no-underline"
      >
        Ir a El Proyecto
      </Link>
    </section>
  );
}
