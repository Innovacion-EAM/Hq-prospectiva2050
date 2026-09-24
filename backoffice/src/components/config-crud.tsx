import { useState } from "react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { type Crud, useCollection } from "@/lib/data";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardBody,
  ConfirmButton,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
  Spinner,
  TextArea,
} from "@/components/ui";
import { cn } from "@/lib/utils";

export type FieldDef<T> = {
  key: keyof T;
  label: string;
  type?: "text" | "textarea" | "select" | "date";
  options?: readonly string[];
  hint?: string;
};

export function ConfigCrud<T extends { id: number }>({
  title,
  description,
  store,
  empty,
  fields,
  columns,
  display,
}: {
  title: string;
  description: string;
  store: () => Crud<T>;
  empty: () => T;
  fields: FieldDef<T>[];
  columns: (item: T) => string[];
  display?: (item: T) => React.ReactNode;
}) {
  const { items, loading, create, update, remove } = useCollection(store());
  const [editing, setEditing] = useState<T | null>(null);
  const [saving, setSaving] = useState(false);

  function commit(patch: Partial<T>) {
    setEditing((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.id === 0) {
        await create(editing);
        toast.success("Elemento creado");
        setEditing(null);
      } else {
        await update(editing.id, editing);
        toast.success("Elemento actualizado");
        setEditing(null);
      }
    } catch {
      toast.error("No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button variant="lime" onClick={() => setEditing(empty())}>
            <Plus className="size-4" /> Nuevo
          </Button>
        }
      />

      {editing ? (
        <Card className="border-l-4 border-l-lime-hot">
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-display text-sm font-bold text-ink">
                {editing.id === 0 ? `Nuevo elemento` : "Editando elemento"}
              </p>
              <button
                type="button"
                onClick={() => setEditing(null)}
                aria-label="Cerrar formulario"
                className="text-muted hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((f) => {
                const value = String(editing[f.key] ?? "");
                return (
                  <Field
                    key={String(f.key)}
                    label={f.label}
                    hint={f.hint}
                    className={f.type === "textarea" ? "sm:col-span-2" : ""}
                  >
                    {f.type === "textarea" ? (
                      <TextArea rows={3} value={value} onChange={(e) => commit({ [f.key]: e.target.value } as Partial<T>)} />
                    ) : f.type === "select" ? (
                      <Select value={value} onChange={(e) => commit({ [f.key]: e.target.value } as Partial<T>)}>
                        {f.options?.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <Input
                        type={f.type === "date" ? "date" : "text"}
                        value={value}
                        onChange={(e) => commit({ [f.key]: e.target.value } as Partial<T>)}
                      />
                    )}
                  </Field>
                );
              })}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
                Cancelar
              </Button>
              <Button variant="lime" onClick={save} disabled={saving}>
                <Save className="size-4" /> {saving ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : null}

      {loading ? (
        <div className="p-14">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Sin elementos"
          action={
            <Button variant="lime" onClick={() => setEditing(empty())}>
              <Plus className="size-4" /> Agregar
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone bg-paper">
          <ul className="divide-y divide-stone">
            {items.map((item) => (
              <li key={item.id} className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-fog/60">
                {display ? (
                  <div className="min-w-0 flex-1">{display(item)}</div>
                ) : (
                  <div className="min-w-0 flex-1">
                    {columns(item).map((col, i) => (
                      <p
                        key={i}
                        className={cn(
                          "truncate",
                          i === 0 ? "font-display text-sm font-semibold text-ink" : "mt-0.5 text-xs text-muted",
                        )}
                      >
                        {col}
                      </p>
                    ))}
                  </div>
                )}
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button variant="outline" size="sm" onClick={() => setEditing({ ...item })} title="Editar">
                    <Pencil className="size-3.5" /> Editar
                  </Button>
                  <ConfirmButton
                    label="Eliminar"
                    onConfirm={async () => {
                      await remove(item.id);
                      toast.success("Elemento eliminado");
                    }}
                    confirmText="¿Eliminar?"
                  >
                    <Trash2 className="size-3.5" />
                  </ConfirmButton>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}