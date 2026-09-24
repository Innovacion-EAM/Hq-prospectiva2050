import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Button, Card, CardBody, Field, Input, Spinner } from "@/components/ui";
import { useAuth } from "@/lib/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch {
      setError("Correo o contraseña incorrectos.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-ink-deep px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-lime font-display text-2xl font-extrabold text-lime-fg">
            Q
          </span>
          <h1 className="mt-4 font-display text-xl font-bold text-paper">
            Horizonte Quindío · Backoffice
          </h1>
          <p className="mt-1 text-sm text-mist">Ingresa para administrar el sitio</p>
        </div>
        <Card>
          <CardBody>
            <form onSubmit={submit} className="space-y-4">
              <Field label="Correo electrónico">
                <Input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@prospectiva.com"
                />
              </Field>
              <Field label="Contraseña">
                <Input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </Field>
              {error ? (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                  {error}
                </p>
              ) : null}
              <Button type="submit" variant="lime" className="w-full" disabled={sending}>
                {sending ? <Spinner className="size-4" /> : <LogIn className="size-4" />}
                {sending ? "Ingresando…" : "Ingresar"}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}