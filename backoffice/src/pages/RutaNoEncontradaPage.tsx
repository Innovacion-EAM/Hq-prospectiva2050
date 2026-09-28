import { useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button, EmptyState } from "@/components/ui";

/**
 * Cualquier ruta del backoffice que no exista caía en un render vacío (pantalla
 * en blanco). Ahora muestra un 404 con salida al panel.
 */
export function RutaNoEncontradaPage() {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <EmptyState
        title="Esta página no existe"
        description="La ruta que buscas no corresponde a ninguna sección del panel. Puede que el enlace esté mal escrito o que el contenido se haya movido."
        action={
          <Button onClick={() => navigate("/")}>
            <Compass className="size-4" /> Ir al panel
          </Button>
        }
      />
    </div>
  );
}
