import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileStack, Save, Trash2 } from "lucide-react";
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
  Select,
  Spinner,
  TextArea,
} from "@/components/ui";
import { FORMATOS, TIPOS_DOCUMENTO, type Documento } from "@/lib/types";

const TIPO_LABEL: Record<string, string> = {
  proyecto: "Proyecto",
  informes: "Informes",
  memorias: "Memorias",
  boletines: "Boletines",
  presentaciones: "Presentaciones",
  publicaciones: "Publicaciones",
};

function emptyDocumento(): Documento {
  return {
    id: 0,
    titulo: "",
    autor: "",
    fecha: todayISO(),
    tipo: "proyecto",
    delimitacion: "Departamental",
    formato: "PDF",
    link: "",
  };
}

export function DocumentosListPage() {
  const { items, loading, remove } = useCollection(collections.documentos());
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("todos");

  const filtered = items
    .filter((d) => (tipo === "todos" ? true : d.tipo === tipo))
    .filter((d) => `${d.titulo} ${d.autor} ${d.delimitacion}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentos"
        description="Repositorio público del proceso: convenios, informes, memorias, boletines, presentaciones y publicaciones."
        actions={
          <LinkBtn to="/documentos/nuevo" variant="lime">
            <FileStack className="size-4" /> Nuevo documento
          </LinkBtn>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTipo("todos")}
            className={
              tipo === "todos"
                ? "rounded-pill bg-lime px-3.5 py-1.5 font-display text-xs font-semibold text-lime-fg"
                : "rounded-pill border border-mist bg-paper px-3.5 py-1.5 font-display text-xs font-semibold text-muted"
            }
          >
            Todos
          </button>
          {TIPOS_DOCUMENTO.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              className={
                tipo === t
                  ? "rounded-pill bg-lime px-3.5 py-1.5 font-display text-xs font-semibold text-lime-fg"
                  : "rounded-pill border border-mist bg-paper px-3.5 py-1.5 font-display text-xs font-semibold text-muted"
              }
            >
              {TIPO_LABEL[t]}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar documento..."
          className="h-9 w-full rounded-pill border border-mist bg-paper px-4 text-sm outline-none focus:border-lime-hot focus:ring-2 focus:ring-lime/40 sm:w-64"
        />
      </div>

      {loading ? (
        <div className="p-14">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No se encontraron documentos"
          action={<LinkBtn to="/documentos/nuevo" variant="lime">Agregar documento</LinkBtn>}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone bg-paper">
          <ul className="divide-y divide-stone">
            {filtered.map((d) => (
              <li
                key={d.id}
                className="group flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-fog/60 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone="neutral">{TIPO_LABEL[d.tipo]}</Badge>
                    <Badge>{d.formato}</Badge>
                    {d.delimitacion ? <Badge tone="ink">{d.delimitacion}</Badge> : null}
                  </div>
                  <p className="mt-1.5 truncate font-display text-sm font-semibold text-ink">{d.titulo}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {d.autor} · {d.fecha}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <LinkBtn to={`/documentos/${d.id}`} variant="outline" size="sm">
                    Editar
                  </LinkBtn>
                  <ConfirmButton
                    label="Eliminar documento"
                    onConfirm={async () => {
                      await remove(d.id);
                      toast.success("Documento eliminado");
                    }}
                    confirmText="¿Eliminar documento?"
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

export function DocumentoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { items, loading, create, update } = useCollection(collections.documentos());
  const item = items.find((d) => d.id === Number(id));
  const [form, setForm] = useState<Documento | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading || form) return;
    if (isEdit && !item) return;
    setForm(item ? { ...item } : emptyDocumento());
  }, [loading, item, form, isEdit]);

  if (loading || (!form && isEdit && !item)) {
    return (
      <div className="p-14">
        <Spinner />
      </div>
    );
  }

  if (isEdit && !item) {
    return <EmptyState title="Documento no encontrado" action={<LinkBtn to="/documentos">Volver</LinkBtn>} />;
  }

  const guardar = form!;
  function commit(patch: Partial<Documento>) {
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
      toast.success(isEdit ? "Documento actualizado" : "Documento creado");
      navigate(`/documentos/${saved.id}`);
    } catch {
      toast.error("No se pudo guardar el documento");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Editar documento" : "Nuevo documento"}
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
            <Input value={guardar.titulo} onChange={(e) => commit({ titulo: e.target.value })} placeholder="Título del documento" />
          </Field>
          <Field label="Autor / Responsable">
            <Input value={guardar.autor} onChange={(e) => commit({ autor: e.target.value })} placeholder="Institución o persona" />
          </Field>
          <FormGrid>
            <Field label="Fecha">
              <Input type="date" value={guardar.fecha} onChange={(e) => commit({ fecha: e.target.value })} />
            </Field>
            <Field label="Tipo">
              <Select value={guardar.tipo} onChange={(e) => commit({ tipo: e.target.value })}>
                {TIPOS_DOCUMENTO.map((t) => (
                  <option key={t} value={t}>
                    {TIPO_LABEL[t]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Delimitación" hint="Alcance territorial del documento.">
              <Input value={guardar.delimitacion} onChange={(e) => commit({ delimitacion: e.target.value })} placeholder="Departamental" />
            </Field>
            <Field label="Formato">
              <Select value={guardar.formato} onChange={(e) => commit({ formato: e.target.value })}>
                {FORMATOS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </Select>
            </Field>
          </FormGrid>
          <Field label="Enlace de descarga" hint="URL del archivo (PDF) en el servidor o en un enlace externo.">
            <TextArea rows={2} value={guardar.link} onChange={(e) => commit({ link: e.target.value })} placeholder="https://... o /files/..." />
          </Field>
        </CardBody>
      </Card>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(-1)} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="lime" onClick={save} disabled={saving}>
          <Save className="size-4" /> {saving ? "Guardando…" : "Guardar documento"}
        </Button>
      </div>
    </div>
  );
}