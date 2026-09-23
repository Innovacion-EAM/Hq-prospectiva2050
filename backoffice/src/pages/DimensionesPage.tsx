import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Boxes, Plus, Save, Trash2, X } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { ICONOS_DIMENSION, type ChartSeries, type Dimension } from "@/lib/types";

type Step = { n: string; title: string };

function emptyDimension(): Dimension {
  return {
    id: 0,
    slug: "",
    title: "",
    short: "",
    icon: "target",
    summary: "",
    body: [""],
    layers: [],
    steps: [],
    charts: [],
  };
}

function serializeCharts(charts: ChartSeries[]): string[] {
  return charts.map((c) => `${c.name} | ${c.color}\n${c.data.map((d) => `${d.year}:${d.value}`).join("\n")}`);
}

function parseCharts(lines: string[]): ChartSeries[] {
  const defaultPalette = ["#0b3336", "#8fcb32", "#5c7072", "#5b2d8a", "#16484c", "#b5dc4a"];
  return lines
    .map((block, bi) => {
      const [header, ...points] = block.split("\n").filter((l) => l.trim().length > 0);
      const [name = "", color = defaultPalette[bi % defaultPalette.length]] = header.split("|").map((s) => s.trim());
      const data = points
        .map((p) => {
          const [year, valueRaw] = p.split(":").map((s) => s.trim());
          const value = Number(valueRaw);
          return year && !Number.isNaN(value) ? { year, value } : null;
        })
        .filter((d): d is { year: string; value: number } => d !== null);
      return name || data.length ? { name: name || "Serie", color: color || defaultPalette[bi % defaultPalette.length], data } : null;
    })
    .filter((c): c is ChartSeries => c !== null);
}

export function DimensionesListPage() {
  const { items, loading, remove } = useCollection(collections.dimensiones());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dimensiones"
        description="Las siete dimensiones del ejercicio de prospectiva, con texto, capas, pasos y series de datos para sus gráficos."
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
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-fog font-display text-xs font-bold text-lime-hot uppercase">
                  {d.slug.slice(0, 3)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-semibold text-ink">{d.title}</p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {d.charts.length} series · {d.steps.length} pasos · {d.layers.length} capas
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
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
            body: [...item.body],
            layers: [...item.layers],
            steps: item.steps.map((s) => ({ ...s })),
            charts: item.charts.map((c) => ({ ...c, data: [...c.data] })),
          }
        : emptyDimension(),
    );
  }, [loading, item, form, isEdit]);

  if (loading || (!form && isEdit && !item)) {
    return (
      <div className="p-14">
        <Spinner />
      </div>
    );
  }

  if (isEdit && !item) {
    return <EmptyState title="Dimensión no encontrada" action={<LinkBtn to="/dimensiones">Volver</LinkBtn>} />;
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
            label="Cuerpo"
            value={guardar.body}
            onChange={(body) => commit({ body })}
            hint="Párrafos descriptivos de la dimensión."
          />
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardBody>
            <StringsEditor
              label="Capas / Ejes"
              value={guardar.layers}
              onChange={(layers) => commit({ layers })}
              hint="Por ejemplo: Base cafetera, Servicios y turismo, Nueva industria."
              placeholder="Capa"
            />
            <div className="mt-6">
              <StepsEditor value={guardar.steps} onChange={(steps) => commit({ steps })} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <ChartsEditor value={guardar.charts} onChange={(charts) => commit({ charts })} />
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

function StepsEditor({ value, onChange }: { value: Step[]; onChange: (next: Step[]) => void }) {
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
      <span className="font-display text-xs font-semibold text-ink">Pasos de la metodología</span>
      <div className="flex gap-2">
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Nombre del paso" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <Button variant="lime" size="icon" onClick={add} aria-label="Agregar paso">
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

function ChartsEditor({ value, onChange }: { value: ChartSeries[]; onChange: (next: ChartSeries[]) => void }) {
  const [drafts, setDrafts] = useState<string[]>(serializeCharts(value));

  function updateDrafts(next: string[]) {
    setDrafts(next);
    onChange(parseCharts(next));
  }

  function add() {
    updateDrafts([...drafts, `Nueva serie | #0b3336\n2026:50`]);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between">
        <span className="font-display text-xs font-semibold text-ink">Series de datos (gráficos)</span>
        <Button variant="lime" size="sm" onClick={add}>
          <Plus className="size-3.5" /> Serie
        </Button>
      </div>
      <p className="text-[0.7rem] text-muted">
        Formato: <code>Nombre | color-hex</code> en la primera línea y un punto por línea con{" "}
        <code>año:valor</code>.
      </p>
      {drafts.length === 0 ? (
        <p className="rounded-lg border border-dashed border-mist px-3 py-4 text-center text-xs text-muted">
          Sin series. Agrega la primera para graficar en el sitio.
        </p>
      ) : (
        <ul className="space-y-2">
          {drafts.map((block, i) => (
            <li key={i} className="group relative">
              <button
                type="button"
                onClick={() => updateDrafts(drafts.filter((_, j) => j !== i))}
                aria-label="Eliminar serie"
                className="absolute right-2 top-2 z-10 grid size-6 place-items-center rounded-md bg-ink/80 text-paper opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="size-3" />
              </button>
              <textarea
                rows={7}
                value={block}
                onChange={(e) => updateDrafts(drafts.map((b, j) => (j === i ? e.target.value : b)))}
                className={cn(
                  "w-full resize-y rounded-lg border border-mist bg-paper px-3 py-2 pr-8 font-mono text-xs text-ink outline-none focus:border-lime-hot focus:ring-2 focus:ring-lime/40",
                  "group-hover:border-ink/30",
                )}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}