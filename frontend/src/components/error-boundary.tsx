import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Se muestra cuando el error viene del sitio público. */
  titulo?: string;
  mensaje?: string;
};

type State = { error: Error | null };

/**
 * Evita que un error de render deje el sitio en blanco. Sin esto, cualquier
 * `TypeError` en un componente tumba la SPA entera y el visitante ve una
 * pantalla vacía sin ninguna pista de qué pasó.
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
      <main
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
          background: "var(--color-paper, #f7f6f2)",
          color: "var(--color-ink, #0b3336)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ maxWidth: "34rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.75rem" }}>
            {this.props.titulo ?? "Algo salió mal"}
          </h1>
          <p style={{ lineHeight: 1.6, margin: "0 0 1.5rem", opacity: 0.8 }}>
            {this.props.mensaje ??
              "No pudimos mostrar esta página. Vuelve al inicio o inténtalo de nuevo en unos minutos."}
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
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
                color: "var(--color-ink, #0b3336)",
              }}
            >
              Reintentar
            </button>
            <a
              href="/"
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
          {import.meta.env.DEV ? (
            <pre
              style={{
                marginTop: "2rem",
                padding: "1rem",
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
          ) : null}
        </div>
      </main>
    );
  }
}
