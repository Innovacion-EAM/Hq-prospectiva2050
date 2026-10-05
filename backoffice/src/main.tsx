import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { Toaster } from "sonner"
import "./index.css"
import App from "./App.tsx"
import { ErrorBoundary } from "./components/error-boundary"

const basename = import.meta.env.MODE === "dev" ? "" : "/admin"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      {/* El límite va dentro del router para que el enlace "Ir al inicio" del
          mensaje de error funcione. Sin él, cualquier error de render tumba la
          SPA entera y el panel queda en blanco sin decir nada. */}
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
      <Toaster position="bottom-right" richColors closeButton />
    </BrowserRouter>
  </StrictMode>,
)
