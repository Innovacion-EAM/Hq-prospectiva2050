import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Megaphone, Save, Trash2 } from "lucide-react";
import { collections, todayISO, useCollection } from "@/lib/data";
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
  LinkBtn,
  PageHeader,
  Spinner,
  TextArea,
  Toggle,
} from "@/components/ui";
import { cn, formatFechaLocal } from "@/lib/utils";
import type { Convocatoria } from "@/lib/types";

function emptyConvocatoria(): Convocatoria {
  return {
    id: 0,
    titulo: "",
    fecha: todayISO(),
    descripcion: "",
    enlace: "",
    activa: true,
  };
}

export function ConvocatoriasListPage() {
  const { items, loading, update, remove } = useCollection(collections.convocatorias());

  const sorted = [...items].sort((a, b) => Number(b.activa) - Number(a.activa) || b.id - a.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Convocatorias"
        description="Convocatorias abiertas y pasadas que se muestran en la sección Participa."
        actions={
          <LinkBtn to="/convocatorias/nuevo" variant="lime">
            <Megaphone className="size-4" /> Nueva convocatoria
          </LinkBtn>
        }
      />

      {loading ? (
        <div className="p-14">
          <Spinner />
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          title="No hay convocatorias"
          action={<LinkBtn to="/convocatorias/nuevo" variant="lime">Crear convocatoria</LinkBtn>}
        />
      ) : (
        <div className="space-y-3">
          {sorted.map((c) => (
            <Card
              key={c.id}
              className={cn("overflow-hidden transition-colors", c.activa ? "border-l-4 border-l-lime-hot" : "border-l-4 border-l-mist")}
            >
              <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {c.activa ? <Badge tone="lime">Activa</Badge> : <Badge>Cerrada</Badge>}
                    {c.fecha ? <Badge tone="neutral">{formatFechaLocal(c.fecha)}</Badge> : null}
                  </div>
                  <p className="mt-2 font-display text-sm font-semibold text-ink">{c.titulo}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted">{c.descripcion || "Sin descripción."}</p>
                  {c.enlace ? (
                    <a
                      href={c.enlace}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-lime-hot no-underline hover:text-ink"
                    >
                      Enlace de inscripción <ExternalLink className="size-3" />
                    </a>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await update(c.id, { activa: !c.activa });
                      toast.success(c.activa ? "Convocatoria cerrada" : "Convocatoria activada");
                    }}
                  >
                    {c.activa ? "Cerrar" : "Activar"}
                  </Button>
                  <LinkBtn to={`/convocatorias/${c.id}`} variant="outline" size="sm">
                    Editar
                  </LinkBtn>
                  <ConfirmButton
                    label="Eliminar convocatoria"
                    onConfirm={async () => {
                      await remove(c.id);
                      toast.success("Convocatoria eliminada");
                    }}
                    confirmText="¿Eliminar convocatoria?"
                  >
                    <Trash2 className="size-3.5" />
                  </ConfirmButton>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function ConvocatoriaFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { items, loading, create, update } = useCollection(collections.convocatorias());
  const item = items.find((c) => c.id === Number(id));
  const [form, setForm] = useState<Convocatoria | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading || form) return;
    if (isEdit && !item) return;
    setForm(item ? { ...item } : emptyConvocatoria());
  }, [loading, item, form, isEdit]);

  if (loading || (!form && isEdit && !item)) {
    return (
      <div className="p-14">
        <Spinner />
      </div>
    );
  }

  if (isEdit && !item) {
    return <EmptyState title="Convocatoria no encontrada" action={<LinkBtn to="/convocatorias">Volver</LinkBtn>} />;
  }

  const guardar = form!;
  function commit(patch: Partial<Convocatoria>) {
    setForm((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  async function save() {
    if (!guardar.titulo.trim()) {
      toast.error("El título es obligatorio");
      return;
    }
    setSaving(true);
    try {
      const saved = isEdit ? await update(Number(id), guardar) : await create(guardar);
      toast.success(isEdit ? "Convocatoria actualizada" : "Convocatoria creada");
      navigate(`/convocatorias/${saved.id}`);
    } catch {
      toast.error("No se pudo guardar la convocatoria");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Editar convocatoria" : "Nueva convocatoria"}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate(-1)} disabled={saving}>
              <ArrowLeft className="size-4" /> Volver
            </Button>
            <Button variant="lime" onClick={save} disabled={saving}>
              <Save className="size-4" /> {saving ? "Guardando…" : "Guardar"}
            </Button>
          </>
        }
      />
      <Card>
        <CardBody className="space-y-5">
          <Field label="Título">
            <Input value={guardar.titulo} onChange={(e) => commit({ titulo: e.target.value })} placeholder="Título de la convocatoria" />
          </Field>
          <FormGrid>
            <Field label="Fecha">
              <Input type="date" value={guardar.fecha} onChange={(e) => commit({ fecha: e.target.value })} />
            </Field>
            <Field label="Enlace de inscripción">
              <Input value={guardar.enlace} onChange={(e) => commit({ enlace: e.target.value })} placeholder="https://forms.example.com/..." />
            </Field>
          </FormGrid>
          <Field label="Descripción">
            <TextArea rows={4} value={guardar.descripcion} onChange={(e) => commit({ descripcion: e.target.value })} />
          </Field>
          <div className="flex items-center gap-4">
            <Toggle checked={guardar.activa} onChange={(v) => commit({ activa: v })} label="Convocatoria activa" />
            <span className="text-xs text-muted">Solo las activas se muestran en la página Participa.</span>
          </div>
        </CardBody>
      </Card>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(-1)} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="lime" onClick={save} disabled={saving}>
          <Save className="size-4" /> {saving ? "Guardando…" : "Guardar convocatoria"}
        </Button>
      </div>
    </div>
  );
}