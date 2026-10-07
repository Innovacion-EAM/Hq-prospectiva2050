import { useState, type FormEvent } from "react";
import { KeyRound } from "lucide-react";
import { http } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardBody,
  Divider,
  Field,
  FormGrid,
  Input,
  PageHeader,
  Spinner,
} from "@/components/ui";

/**
 * "Mi cuenta": cambiar la contraseña de quien está conectado.
 *
 * El backend pide siempre la contraseña actual, así que el formulario la
 * necesita. No hay forma de ver la contraseña actual desde aquí, y no es una
 * decisión de la interfaz: el backend solo guarda el hash bcrypt, que es de
 * una sola dirección. Nadie en el sistema puede volver a leerla, ni siquiera
 * quien administra la base de datos. Si se olvida, hay que restablecerla.
 */
export function MiCuentaPage() {
  const { user } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [saving, setSaving] = useState(false);

  if (!user) return <Spinner className="p-14" />;

  async function saveNow(e: FormEvent) {
    e.preventDefault();

    if (next !== repeat) {
      toast.error("La contraseña nueva y su repetición no coinciden");
      return;
    }

    setSaving(true);
    try {
      await http("/api/auth/password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: current,
          newPassword: next,
        }),
      });
      // Se limpia el formulario: los tres campos ya no sirven de nada y
      // dejarlos escritos es dejar la contraseña en la página.
      setCurrent("");
      setNext("");
      setRepeat("");
      toast.success("Contraseña actualizada");
    } catch (err) {
      // El backend manda el motivo en el cuerpo del error, que es mucho más
      // útil que un "algo salió mal": "la actual no es correcta" y "debe
      // tener al menos 8 caracteres" guides distinto.
      toast.error(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar la contraseña",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mi cuenta"
        description={`Sesión de ${user.email}. Aquí cambias tu propia contraseña.`}
      />

      <Card className="max-w-2xl">
        <CardBody>
          <form onSubmit={saveNow} className="space-y-6">
            <Divider label="Cambiar contraseña" />
            <FormGrid>
              <Field label="Contraseña actual">
                <Input
                  type="password"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </Field>
              <Field label="Contraseña nueva" hint="Mínimo 8 caracteres.">
                <Input
                  type="password"
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </Field>
              <Field label="Repite la contraseña nueva">
                <Input
                  type="password"
                  value={repeat}
                  onChange={(e) => setRepeat(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </Field>
            </FormGrid>
            <Button type="submit" variant="lime" disabled={saving}>
              <KeyRound className="size-4" />{" "}
              {saving ? "Actualizando…" : "Actualizar contraseña"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}