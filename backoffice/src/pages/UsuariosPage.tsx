import { useState, type FormEvent } from "react";
import { Shield, Trash2, UserPlus } from "lucide-react";
import { collections, useCollection, type Crud } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import {
  Badge,
  Button,
  Card,
  CardBody,
  ConfirmButton,
  EmptyState,
  Field,
  FormGrid,
  Input,
  PageHeader,
  Select,
  Spinner,
} from "@/components/ui";
import type { Role, User } from "@/lib/types";

type UserForm = { id: number | null; email: string; password: string; role: Role };

const EMPTY: UserForm = { id: null, email: "", password: "", role: "editor" };

export function UsuariosPage() {
  const usersCrud = collections.users();
  const { items, loading } = useCollection(usersCrud as unknown as Crud<User>);
  const { create, update, remove } = usersCrud;
  const { user: current } = useAuth();
  const [form, setForm] = useState<UserForm | null>(null);

  function commit(patch: Partial<UserForm>) {
    setForm((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    if (!form.email.trim()) {
      toast.error("El correo es obligatorio");
      return;
    }
    if (form.id === null && !form.password) {
      toast.error("La contraseña es obligatoria");
      return;
    }
    try {
      if (form.id === null) {
        await create({ email: form.email.trim(), password: form.password, role: form.role });
        toast.success("Usuario creado");
      } else {
        const patch: { email?: string; password?: string; role?: Role } = {};
        if (form.email.trim()) patch.email = form.email.trim();
        if (form.password) patch.password = form.password;
        patch.role = form.role;
        await update(form.id, patch);
        toast.success("Usuario actualizado");
      }
      setForm(null);
    } catch {
      toast.error("No se pudo guardar el usuario");
    }
  }

  function editar(u: User) {
    setForm({ id: u.id, email: u.email, password: "", role: u.role });
  }

  async function borrar(u: User) {
    try {
      await remove(u.id);
      toast.success("Usuario eliminado");
    } catch {
      toast.error("No se pudo eliminar el usuario");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        description="Cuentas con acceso al backoffice. El rol editor administra contenido; admin además gestiona usuarios y la galería."
        actions={
          <Button variant="lime" onClick={() => setForm({ ...EMPTY })}>
            <UserPlus className="size-4" /> Nuevo usuario
          </Button>
        }
      />

      {form ? (
        <Card>
          <CardBody>
            <form onSubmit={guardar} className="space-y-4">
              <FormGrid>
                <Field label="Correo electrónico">
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => commit({ email: e.target.value })}
                    placeholder="usuario@prospectiva.com"
                  />
                </Field>
                <Field
                  label={form.id === null ? "Contraseña" : "Nueva contraseña (opcional)"}
                >
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => commit({ password: e.target.value })}
                    placeholder="••••••••"
                  />
                </Field>
                <Field label="Rol">
                  <Select value={form.role} onChange={(e) => commit({ role: e.target.value as Role })}>
                    <option value="editor">Editor</option>
                    <option value="admin">Administrador</option>
                  </Select>
                </Field>
              </FormGrid>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setForm(null)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="lime">
                  Guardar usuario
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      ) : null}

      {loading ? (
        <div className="p-14">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No hay usuarios"
          action={
            <Button variant="lime" onClick={() => setForm({ ...EMPTY })}>
              Crear primer usuario
            </Button>
          }
        />
      ) : (
        <Card>
          <ul className="divide-y divide-stone">
            {items.map((u) => (
              <li
                key={u.id}
                className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-lime font-display text-sm font-extrabold text-lime-fg">
                    {u.email.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="truncate font-display text-sm font-semibold text-ink">{u.email}</p>
                    <p className="text-xs text-muted">
                      Creado el{" "}
                      {new Date(u.createdAt).toLocaleDateString("es-CO")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge tone={u.role === "admin" ? "lime" : "ink"}>
                    <Shield className="size-2.5" /> {u.role === "admin" ? "Administrador" : "Editor"}
                  </Badge>
                  {current?.id === u.id ? (
                    <span className="rounded-pill bg-fog px-2.5 py-1 text-[0.65rem] font-semibold text-muted">
                      Tú
                    </span>
                  ) : null}
                  <Button variant="outline" size="sm" onClick={() => editar(u)}>
                    Editar
                  </Button>
                  <ConfirmButton
                    label="Eliminar usuario"
                    confirmText={`¿Eliminar a ${u.email}?`}
                    onConfirm={() => borrar(u)}
                  >
                    <Trash2 className="size-3.5" />
                  </ConfirmButton>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}