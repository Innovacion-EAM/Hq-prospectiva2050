import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Boxes, LayoutGrid, Plus, Save, Trash2, X } from "lucide-react";
import { collections, slugify, useCollection } from "@/lib/data";
import { toast } from "sonner";
import {
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
  Select,
  Spinner,
  StringsEditor,
  TextArea,
} from "@/components/ui";
import { ICONOS_DIMENSION, type Dimension } from "@/lib/types";

type Step = { n: string; title: string };

function emptyDimension(): Dimension {
  return {
    id: 0,
    slug: "",
    title: "",
    short: "",
    tipo: "dimension",
    icon: "target",
    summary: "",
    body: [""],
    layers: [],
    layersLabel: "Líneas de trabajo",
    steps: [],
    stepsLabel: "Retos principales",
    charts: [],
  };
}

export function DimensionesListPage() {
  const { items, loading, remove } = useCollection(collections.dimensiones());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dimensiones"
        description="Las dimensiones del ejercicio de prospectiva y sus bloques de apoyo, con texto, retos, líneas de trabajo y series de datos para sus gráficos."
        actions={
          <LinkBtn to="/dimensiones/nuevo" variant="lime">
            <Boxes className="size-4" /> Nueva dimensión
          </LinkBtn>
        }
      />

      {loading ? (
        <div className="p-14">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <EmptyState title="No hay dimensiones" action={<LinkBtn to="/dimensiones/nuevo" variant="lime">Crear dimensión</LinkBtn>} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone bg-paper">
          <ul className="divide-y divide-stone">
            {items.map((d) => (
              <li
                key={d.id}
                className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-fog/60"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-fog font-display text-xs font-bold text-lime-ink uppercase">
                  {d.tipo === "bloque" ? <LayoutGrid className="size-4" /> : d.slug.slice(0, 3)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-semibold text-ink">{d.title}</p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {d.charts.length} series · {d.steps.length}{" "}
                    {(d.stepsLabel || "retos").toLowerCase()} ·{" "}
                    {d.layers.length} {(d.layersLabel || "líneas").toLowerCase()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span
                    className={
                      "rounded-full border px-2 py-0.5 font-display text-[0.6rem] font-semibold tracking-wide uppercase " +
                      (d.tipo === "bloque"
                        ? "border-stone text-muted"
                        : "border-lime-hot/40 text-lime-ink")
                    }
                  >
                    {d.tipo === "bloque" ? "Bloque" : "Dimensión"}
                  </span>
                  <LinkBtn to={`/dimensiones/${d.id}`} variant="outline" size="sm">
                    Editar
                  </LinkBtn>
                  <ConfirmButton
                    label="Eliminar dimensión"
                    onConfirm={async () => {
                      await remove(d.id);
                      toast.success("Dimensión eliminada");
                    }}
                    confirmText="¿Eliminar dimensión?"
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

export function DimensionFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { items, loading, create, update } = useCollection(collections.dimensiones());
  const item = items.find((d) => d.id === Number(id));
  const [form, setForm] = useState<Dimension | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading || form) return;
    if (isEdit && !item) return;
    setForm(
      item
        ? {
            ...item,
            stepsLabel: item.stepsLabel || "",
            layersLabel: item.layersLabel || "",
            body: [...item.body],
            layers: [...item.layers],
            steps: item.steps.map((s) => ({ ...s })),
            charts: item.charts.map((c) => ({ ...c, data: [...c.data] })),
          }
        : emptyDimension(),
    );
  }, [loading, item, form, isEdit]);

  // OJO: el orden de estas tres guardas importa.
  // 1) Si está cargando, spinner.
  // 2) Si edita y no existe, "no encontrado" — antes de mirar `form`, porque
  //    cuando no hay item el useEffect nunca inicializa `form` (se queda null)
  //    y, si esta guarda exigiera `form`, el spinner giraría para siempre.
  // 3) Si `form` sigue null, spinner. El useEffect que lo inicializa no corre
  //    hasta después del primer render, así que hay siempre un frame con
  //    form === null. La guarda antigua (`!form && isEdit && !item`) no cortaba
  //    ese frame en `/nuevo` (donde isEdit es false) y la página reventaba con
  //    "Cannot read properties of null (reading 'slug')".
  if (loading) {
    return (
      <div className="p-14">
        <Spinner />
      </div>
    );
  }

  if (isEdit && !item) {
    return <EmptyState title="Dimensión no encontrada" action={<LinkBtn to="/dimensiones">Volver</LinkBtn>} />;
  }

  if (!form) {
    return (
      <div className="p-14">
        <Spinner />
      </div>
    );
  }

  const guardar = form!;
  function commit(patch: Partial<Dimension>) {
    setForm((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  async function save() {
    if (!guardar.title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }
    const payload: Dimension = {
      ...guardar,
      slug: guardar.slug.trim() ? guardar.slug : slugify(guardar.title),
    };
    setSaving(true);
    try {
      const saved = isEdit ? await update(Number(id), payload) : await create(payload);
      toast.success(isEdit ? "Dimensión actualizada" : "Dimensión creada");
      navigate(`/dimensiones/${saved.id}`);
    } catch {
      toast.error("No se pudo guardar la dimensión");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Editar dimensión" : "Nueva dimensión"}
        description={`URL pública: /dimensiones/${guardar.slug || slugify(guardar.title)}`}
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
          <FormGrid>
            <Field label="Título">
              <Input value={guardar.title} onChange={(e) => commit({ title: e.target.value })} placeholder="Dimensión económico - Productiva" />
            </Field>
            <Field label="Título corto" hint="Versión abreviada para navegación.">
              <Input value={guardar.short} onChange={(e) => commit({ short: e.target.value })} placeholder="Dimensión económico Productiva" />
            </Field>
            <Field label="Slug" hint="Se genera automáticamente si va vacío.">
              <Input value={guardar.slug} onChange={(e) => commit({ slug: e.target.value })} placeholder="economica-productiva" />
            </Field>
            <Field label="Icono">
              <Select value={guardar.tipo} onChange={(e) => commit({ tipo: e.target.value as Dimension["tipo"] })}>
                <option value="dimension">Dimensión de análisis (una de las 4)</option>
                <option value="bloque">Bloque de apoyo (misiones, retos, hoja de ruta)</option>
              </Select>
              <Select value={guardar.icon} onChange={(e) => commit({ icon: e.target.value })}>
                {ICONOS_DIMENSION.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </Select>
            </Field>
          </FormGrid>
          <Field label="Resumen" hint="Texto corto que se muestra en la tarjeta.">
            <TextArea rows={3} value={guardar.summary} onChange={(e) => commit({ summary: e.target.value })} />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <ParagraphEditor
            label="Análisis"
            value={guardar.body}
            onChange={(body) => commit({ body })}
            hint="Párrafos que describen la dimensión (el texto que abre la ficha, después de la descripción)."
          />
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardBody className="space-y-5">
            <Field
              label="Título de la lista de líneas"
              hint="El encabezado que verá el visitante sobre esta lista. Si va vacío, se usa «Líneas de trabajo»."
            >
              <Input
                value={guardar.layersLabel}
                onChange={(e) => commit({ layersLabel: e.target.value })}
                placeholder="Líneas de trabajo"
              />
            </Field>
            <StringsEditor
              label={guardar.layersLabel || "Líneas de trabajo"}
              value={guardar.layers}
              onChange={(layers) => commit({ layers })}
              hint="Una línea por fila. En la ficha salen bajo el encabezado de arriba."
              placeholder="Línea de trabajo"
            />
            <div className="border-t border-stone pt-5">
              <Field
                label="Título de la lista de retos"
                hint="El encabezado que verá el visitante sobre esta lista. Si va vacío, se usa «Retos principales». En «Misiones del proceso» puede ser «Misiones»."
              >
                <Input
                  value={guardar.stepsLabel}
                  onChange={(e) => commit({ stepsLabel: e.target.value })}
                  placeholder="Retos principales"
                />
              </Field>
              <div className="mt-4">
                <StepsEditor
                  title={guardar.stepsLabel || "Retos principales"}
                  value={guardar.steps}
                  onChange={(steps) => commit({ steps })}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="space-y-2">
              <span className="font-display text-xs font-semibold text-ink">
                Series de datos (gráficos)
              </span>
              <p className="text-xs text-muted">
                Las series de las gráficas de esta dimensión se editan aparte, en{" "}
                <span className="font-semibold text-ink">Configuración → Estadísticas</span>, junto
                a las de las demás dimensiones. Aquí queda solo el contenido de la dimensión.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(-1)} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="lime" onClick={save} disabled={saving}>
          <Save className="size-4" /> {saving ? "Guardando…" : "Guardar dimensión"}
        </Button>
      </div>
    </div>
  );
}

function StepsEditor({
  value,
  onChange,
  title,
}: {
  value: Step[];
  onChange: (next: Step[]) => void;
  title: string;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const clean = draft.trim();
    if (!clean) return;
    const n = String(value.length + 1).padStart(2, "0");
    onChange([...value, { n, title: clean }]);
    setDraft("");
  }

  function rename(i: number, title: string) {
    onChange(value.map((s, j) => (j === i ? { ...s, title } : s)));
  }

  return (
    <div className="space-y-2">
      <span className="font-display text-xs font-semibold text-ink">{title}</span>
      <div className="flex gap-2">
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Escribe un reto" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <Button variant="lime" size="icon" onClick={add} aria-label="Agregar reto">
          <Plus className="size-4" />
        </Button>
      </div>
      {value.length > 0 ? (
        <ul className="space-y-1.5">
          {value.map((s, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-fog font-display text-xs font-bold text-ink">
                {s.n}
              </span>
              <Input value={s.title} onChange={(e) => rename(i, e.target.value)} className="h-9 text-xs" />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                aria-label="Quitar paso"
                className="text-muted hover:text-rose-600"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
