import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = { error: Error | null };

/**
 * Evita que un error de render deje el panel en blanco.
 *
 * El sitio público ya tenía el suyo; el backoffice no, y se notó: un bucle de
 * renders al abrir un mensaje tumbaba la SPA entera y lo único que veía quien
 * lo usaba era una pantalla vacía, sin ningún rastro de qué había pasado. Este
 * límite corta el daño y enseña qué falló.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
          background: "var(--color-fog, #f1f0ec)",
          color: "var(--color-ink, #0b3336)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ maxWidth: "36rem" }}>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, margin: "0 0 0.75rem" }}>
            Esta pantalla no pudo mostrarse
          </h1>
          <p style={{ lineHeight: 1.6, margin: "0 0 1.25rem", opacity: 0.8 }}>
            Es un fallo del panel, no de los datos: nada se perdió y lo que habías escrito se queda en la base.
            Puedes reintentar o volver al inicio.
          </p>

          {/*
            El mensaje del error se enseña siempre, y no solo en desarrollo como
            en el sitio público. Aquí la persona que mira el panel es quien está
            probando el sistema, así que el texto del error es justo lo que
            necesita para poder contarlo. Sin esto, un fallo se venía viendo como
            una página en blanco.
          */}
          <pre
            style={{
              margin: "0 0 1.25rem",
              padding: "0.9rem",
              borderRadius: "0.5rem",
              background: "rgba(0,0,0,0.06)",
              fontSize: "0.75rem",
              textAlign: "left",
              overflow: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {error.message}
          </pre>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              style={{
                border: "none",
                borderRadius: "999px",
                padding: "0.6rem 1.4rem",
                fontWeight: 600,
                cursor: "pointer",
                background: "var(--color-lime, #b6f13c)",
                color: "var(--color-lime-fg, #0b3336)",
              }}
            >
              Reintentar
            </button>
            <a
              // El panel vive bajo /admin vía traefik, así que el inicio no es "/".
              href="/admin"
              style={{
                borderRadius: "999px",
                padding: "0.6rem 1.4rem",
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                border: "1px solid currentColor",
                color: "inherit",
              }}
            >
              Ir al inicio
            </a>
          </div>
        </div>
      </div>
    );
  }
}
