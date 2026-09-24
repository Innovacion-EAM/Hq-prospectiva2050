import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Save, Trash2 } from "lucide-react";
import { collections, slugify, useCollection } from "@/lib/data";
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
  ParagraphEditor,
  Spinner,
  TextArea,
  Thumb,
} from "@/components/ui";
import type { PaginaProyecto } from "@/lib/types";

export function ProyectoListPage() {
  const { items, loading, remove } = useCollection(collections.paginas());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Páginas del proyecto"
        description="Contenido de las páginas bajo /proyecto: qué es, contexto, objetivo, gobernanza, principios y línea de tiempo."
        actions={
          <LinkBtn to="/proyecto/nuevo" variant="lime">
            <BookOpen className="size-4" /> Nueva página
          </LinkBtn>
        }
      />

      {loading ? (
        <div className="p-14">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No hay páginas"
          action={<LinkBtn to="/proyecto/nuevo" variant="lime">Crear página</LinkBtn>}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone bg-paper">
          <ul className="divide-y divide-stone">
            {items.map((p) => (
              <li
                key={p.id}
                className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-fog/60"
              >
                <Thumb src={p.image} alt={p.title} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone="neutral">{p.kicker || "El proyecto"}</Badge>
                  </div>
                  <p className="mt-1.5 truncate font-display text-sm font-semibold text-ink">{p.title}</p>
                  <p className="mt-0.5 text-xs text-muted">/proyecto/{p.slug}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <LinkBtn to={`/proyecto/${p.id}`} variant="outline" size="sm">
                    Editar
                  </LinkBtn>
                  <ConfirmButton
                    label="Eliminar página"
                    onConfirm={async () => {
                      await remove(p.id);
                      toast.success("Página eliminada");
                    }}
                    confirmText="¿Eliminar página?"
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

function emptyPagina(): PaginaProyecto {
  return {
    id: 0,
    slug: "",
    title: "",
    kicker: "El proyecto",
    image: "",
    excerpt: "",
    lead: "",
    body: [""],
  };
}

export function ProyectoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { items, loading, create, update } = useCollection(collections.paginas());
  const item = items.find((p) => p.id === Number(id));
  const [form, setForm] = useState<PaginaProyecto | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading || form) return;
    if (isEdit && !item) return;
    setForm(item ? { ...item, body: [...item.body] } : emptyPagina());
  }, [loading, item, form, isEdit]);

  if (loading || (!form && isEdit && !item)) {
    return (
      <div className="p-14">
        <Spinner />
      </div>
    );
  }

  if (isEdit && !item) {
    return <EmptyState title="Página no encontrada" action={<LinkBtn to="/proyecto">Volver</LinkBtn>} />;
  }

  const guardar = form!;
  function commit(patch: Partial<PaginaProyecto>) {
    setForm((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  async function save() {
    if (!guardar.title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }
    const payload: PaginaProyecto = {
      ...guardar,
      slug: guardar.slug.trim() ? guardar.slug : slugify(guardar.title),
    };
    setSaving(true);
    try {
      const saved = isEdit ? await update(Number(id), payload) : await create(payload);
      toast.success(isEdit ? "Página actualizada" : "Página creada");
      navigate(`/proyecto/${saved.id}`);
    } catch {
      toast.error("No se pudo guardar la página");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Editar página" : "Nueva página del proyecto"}
        description={`URL pública: /proyecto/${guardar.slug || slugify(guardar.title)}`}
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

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card>
          <CardBody className="space-y-5">
            <Field label="Título">
              <Input value={guardar.title} onChange={(e) => commit({ title: e.target.value })} placeholder="Título de la página" />
            </Field>
            <FormGrid>
              <Field label="Slug" hint="Se genera automáticamente desde el título si va vacío.">
                <Input value={guardar.slug} onChange={(e) => commit({ slug: e.target.value })} placeholder="que-es" />
              </Field>
              <Field label="Kicker" hint="Etiqueta corta que antecede al título.">
                <Input value={guardar.kicker} onChange={(e) => commit({ kicker: e.target.value })} placeholder="El proyecto" />
              </Field>
            </FormGrid>
            <Field label="Imagen">
              <Input value={guardar.image} onChange={(e) => commit({ image: e.target.value })} placeholder="/images/card-que-es.jpg" />
            </Field>
            <Field label="Resumen" hint="Se usa en tarjetas y buscador.">
              <TextArea rows={3} value={guardar.excerpt} onChange={(e) => commit({ excerpt: e.target.value })} />
            </Field>
            <Field label="Lead" hint="Primer párrafo destacado de la página.">
              <TextArea rows={3} value={guardar.lead} onChange={(e) => commit({ lead: e.target.value })} />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-6">
            <Field label="Vista previa">
              <Thumb src={guardar.image} alt={guardar.title} className="h-28 w-full" />
            </Field>
            <div className="rounded-xl bg-fog p-4 text-xs text-muted">
              <p className="font-display text-xs font-bold text-ink">Campos que puedes editar</p>
              <p className="mt-1.5">
                Título, kicker, imagen, resumen, párrafo de introducción (lead) y el cuerpo del artículo. Cada
                página se publica automáticamente en /proyecto.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <ParagraphEditor
            label="Cuerpo"
            value={guardar.body}
            onChange={(body) => commit({ body })}
            hint="Cada bloque es un párrafo de la página."
          />
        </CardBody>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(-1)} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="lime" onClick={save} disabled={saving}>
          <Save className="size-4" /> {saving ? "Guardando…" : "Guardar página"}
        </Button>
      </div>
    </div>
  );
}