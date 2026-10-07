import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Database,
  FileSpreadsheet,
  Pencil,
  Plus,
  Rocket,
  Save,
  Trash2,
  UploadCloud,
} from "lucide-react";
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
  TextArea,
  Toggle,
} from "@/components/ui";
import { repositorio } from "@/lib/data";
import {
  DIMENSIONES_REPO,
  FORMATOS_REPO,
  TIPOS_REPO,
  dimRepoColor,
  type ImportarResultado,
  type RepositorioItem,
  type RepositorioStats,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type Tab = "catalogo" | "importar" | "estadisticas";
type OrdenRepo = "codigo" | "recientes" | "antiguos" | "titulo";

const TABS: { id: Tab; label: string }[] = [
  { id: "catalogo", label: "Catálogo" },
  { id: "importar", label: "Importar" },
  { id: "estadisticas", label: "Estadísticas" },
];

const PER_PAGE = 50;

/** Formulario vacío para un ítem nuevo (los públicos se crean publicados). */
function emptyItem(): RepositorioItem {
  return {
    id: 0,
    codigo: 0,
    titulo: "",
    autor: null,
    anio: null,
    tipo: "Informe General o de Gestión",
    delimitacion: null,
    formato: "PDF",
    dimension: null,
    link: null,
    resumen: null,
    publicado: true,
    publicadoEn: null,
    creadoEn: null,
    actualizadoEn: null,
  };
}

export function RepositorioPage() {
  const [tab, setTab] = useState<Tab>("catalogo");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Repositorio de información"
        description="Los 392 documentos de referencia que se muestran en /repo: catalogo, importación desde el Excel y estadísticas de lo publicado."
        actions={
          <a
            href={(import.meta.env.VITE_SITE_URL || "http://localhost:5173") + "/repo"}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-pill bg-ink px-4 py-2 font-display text-xs font-semibold text-paper no-underline transition-colors hover:bg-ink-mid"
          >
            <Database className="size-3.5" /> Ver el repositorio público
          </a>
        }
      />

      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-pill px-4 py-2 font-display text-xs font-semibold transition-colors",
              tab === t.id
                ? "bg-lime text-lime-fg"
                : "border border-mist bg-paper text-muted hover:text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "catalogo" ? <CatalogoTab /> : null}
      {tab === "importar" ? <ImportarTab /> : null}
      {tab === "estadisticas" ? <EstadisticasTab /> : null}
    </div>
  );
}

// ── Pestaña: Catálogo ──────────────────────────────────────────────────────

function CatalogoTab() {
  const [items, setItems] = useState<RepositorioItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<RepositorioItem | "nuevo" | null>(null);

  // Filtros locales: se aplican al recargar (q con botón, selects al instante).
  const [q, setQ] = useState("");
  const [dimension, setDimension] = useState("");
  const [tipo, setTipo] = useState("");
  const [formato, setFormato] = useState("");
  const [orden, setOrden] = useState<"codigo" | "recientes" | "antiguos" | "titulo">("codigo");

  const load = useCallback(
    async (over: Partial<{ q: string; dimension: string; tipo: string; formato: string; orden: typeof orden; page: number }>) => {
      const params = { q, dimension, tipo, formato, orden, page, ...over };
      setLoading(true);
      try {
        const res = await repositorio.list({
          q: params.q || undefined,
          dimension: params.dimension || undefined,
          tipo: params.tipo || undefined,
          formato: params.formato || undefined,
          page: params.page,
          perPage: PER_PAGE,
          orden: params.orden,
        });
        setItems(res.data);
        setTotal(res.meta.total);
        setPage(res.meta.page);
      } catch {
        setItems([]);
        setTotal(0);
        toast.error("No se pudo cargar el catálogo");
      } finally {
        setLoading(false);
      }
    },
    [q, dimension, tipo, formato, orden],
  );

  useEffect(() => {
    load({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimension, tipo, formato, orden]);

  if (editando) {
    return (
      <ItemForm
        item={editando === "nuevo" ? null : editando}
        onCancel={() => setEditando(null)}
        onSaved={(created) => {
          setEditando(null);
          load({ page: 1 });
          toast.success(created ? "Documento creado" : "Documento actualizado");
        }}
      />
    );
  }

  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));
  const color = (slug: string | null) => dimRepoColor(slug) ?? undefined;

  return (
    <div className="space-y-4">
      {/* Controles */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select value={dimension} onChange={(e) => setDimension(e.target.value)}>
            <option value="">Todas las dimensiones</option>
            {DIMENSIONES_REPO.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.title}
              </option>
            ))}
          </Select>
          <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos los tipos</option>
            {TIPOS_REPO.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
          <Select value={formato} onChange={(e) => setFormato(e.target.value)}>
            <option value="">Todos los formatos</option>
            {FORMATOS_REPO.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Select>
          <Select value={orden} onChange={(e) => setOrden(e.target.value as OrdenRepo)} aria-label="Ordenar por">
            <option value="codigo">Ordenar: Nº (1→392)</option>
            <option value="recientes">Ordenar: más recientes</option>
            <option value="antiguos">Ordenar: más antiguos</option>
            <option value="titulo">Ordenar: título</option>
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por título o autor…" className="h-9" />
          <Button variant="lime" size="sm" onClick={() => load({ page: 1 })}>
            Buscar
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">
          {loading ? "Cargando…" : `${total} ítems (incluye borradores)`}
        </p>
        <Button variant="lime" size="sm" onClick={() => setEditando("nuevo")}>
          <Plus className="size-3.5" /> Nuevo documento
        </Button>
      </div>

      {loading ? (
        <div className="p-14">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description="Ajusta los filtros o importa el Excel desde la pestaña Importar."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone bg-paper">
          <ul className="divide-y divide-stone">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-2 px-5 py-3.5 transition-colors hover:bg-fog/60 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone="ink">Nº {item.codigo}</Badge>
                    {item.dimension ? (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 font-display text-[0.65rem] font-semibold uppercase tracking-wide"
                        style={{ color: color(item.dimension), background: `${color(item.dimension) ?? "#000"}1a` }}
                      >
                        <span className="size-1.5 rounded-full" style={{ background: color(item.dimension) }} />
                        {DIMENSIONES_REPO.find((d) => d.slug === item.dimension)?.title ?? item.dimension}
                      </span>
                    ) : (
                      <Badge tone="neutral">Sin dimensión</Badge>
                    )}
                    <Badge>{item.formato}</Badge>
                    {item.anio ? <Badge tone="neutral">{item.anio}</Badge> : null}
                    {item.publicado ? (
                      <Badge tone="lime">Publicado</Badge>
                    ) : (
                      <Badge tone="rose">Borrador</Badge>
                    )}
                  </div>
                  <p className="mt-1.5 truncate font-display text-sm font-semibold text-ink">{item.titulo}</p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {item.autor ?? "Sin autor"} · {item.tipo}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        const next = await repositorio.update(item.id, { publicado: !item.publicado });
                        setItems((prev) => prev.map((it) => (it.id === next.id ? next : it)));
                        toast.success(next.publicado ? "Publicado" : "Pasado a borrador");
                      } catch {
                        toast.error("No se pudo cambiar el estado");
                      }
                    }}
                  >
                    {item.publicado ? "Despublicar" : "Publicar"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditando(item)}>
                    <Pencil className="size-3.5" /> Editar
                  </Button>
                  <ConfirmButton
                    label="Eliminar documento"
                    confirmText="¿Eliminar este documento del repositorio?"
                    onConfirm={async () => {
                      try {
                        await repositorio.remove(item.id);
                        setItems((prev) => prev.filter((it) => it.id !== item.id));
                        toast.success("Documento eliminado");
                      } catch {
                        toast.error("No se pudo eliminar");
                      }
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </ConfirmButton>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Paginación */}
      {pageCount > 1 ? (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => load({ page: page - 1 })}>
            Anterior
          </Button>
          <span className="text-xs font-medium text-muted">
            Página {page} de {pageCount}
          </span>
          <Button variant="outline" size="sm" disabled={page >= pageCount} onClick={() => load({ page: page + 1 })}>
            Siguiente
          </Button>
        </div>
      ) : null}
    </div>
  );
}

// ── Formulario crear / editar ──────────────────────────────────────────────

function ItemForm({
  item,
  onCancel,
  onSaved,
}: {
  item: RepositorioItem | null;
  onCancel: () => void;
  onSaved: (created: boolean) => void;
}) {
  const [form, setForm] = useState<RepositorioItem>(item ? { ...item } : emptyItem());
  const [saving, setSaving] = useState(false);

  function commit(patch: Partial<RepositorioItem>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  async function save() {
    if (!form.titulo.trim()) {
      toast.error("El título es obligatorio");
      return;
    }
    if (form.codigo <= 0) {
      toast.error("El código (No. del Excel) es obligatorio y debe ser único");
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<RepositorioItem> = {
        codigo: form.codigo,
        titulo: form.titulo.trim(),
        autor: form.autor?.trim() || null,
        anio: form.anio,
        tipo: form.tipo,
        delimitacion: form.delimitacion?.trim() || null,
        formato: form.formato,
        dimension: form.dimension,
        link: form.link?.trim() || null,
        resumen: form.resumen?.trim() || null,
        publicado: form.publicado,
      };
      if (item) {
        await repositorio.update(item.id, payload);
      } else {
        await repositorio.create(payload as Omit<RepositorioItem, "id">);
      }
      onSaved(!item);
    } catch {
      toast.error("No se pudo guardar el documento");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={saving}>
          <ArrowLeft className="size-3.5" /> Volver al catálogo
        </Button>
        <p className="font-display text-sm font-bold text-ink">
          {item ? `Editar documento #${item.codigo}` : "Nuevo documento"}
        </p>
      </div>

      <Card>
        <CardBody className="space-y-5">
          <FormGrid>
            <Field label="Código" hint='El "No." del Excel. Es clave única: reimportar el mismo código actualiza, no duplica.'>
              <Input
                type="number"
                value={form.codigo === 0 ? "" : String(form.codigo)}
                onChange={(e) => commit({ codigo: Number(e.target.value) })}
                placeholder="Ej. 247"
              />
            </Field>
            <Field label="Año de publicación">
              <Input
                type="number"
                placeholder="Ej. 2023"
                value={form.anio ?? ""}
                onChange={(e) => commit({ anio: e.target.value ? Number(e.target.value) : null })}
              />
            </Field>
            <Field label="Dimensión">
              <Select
                value={form.dimension ?? ""}
                onChange={(e) => commit({ dimension: e.target.value || null })}
              >
                <option value="">Sin dimensión</option>
                {DIMENSIONES_REPO.map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {d.title}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Formato">
              <Select value={form.formato} onChange={(e) => commit({ formato: e.target.value })}>
                {FORMATOS_REPO.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Tipo de documento">
              <Select value={form.tipo} onChange={(e) => commit({ tipo: e.target.value })}>
                {TIPOS_REPO.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Delimitación espacial" hint="Alcance territorial del documento.">
              <Input
                value={form.delimitacion ?? ""}
                onChange={(e) => commit({ delimitacion: e.target.value || null })}
                placeholder="Ej. Departamental (Quindío)"
              />
            </Field>
          </FormGrid>

          <Field label="Título del documento">
            <Input
              value={form.titulo}
              onChange={(e) => commit({ titulo: e.target.value })}
              placeholder="Título completo del documento"
            />
          </Field>
          <Field label="Autor / Responsable">
            <Input
              value={form.autor ?? ""}
              onChange={(e) => commit({ autor: e.target.value || null })}
              placeholder="Institución o persona responsable"
            />
          </Field>
          <Field label="Link de acceso/descarga" hint="URL de Google Drive. La de drive.google.com/file/d/… se puede pegar tal cual.">
            <TextArea
              rows={2}
              value={form.link ?? ""}
              onChange={(e) => commit({ link: e.target.value || null })}
              placeholder="https://drive.google.com/file/d/..."
            />
          </Field>
          <Field label="Resumen">
            <TextArea
              rows={3}
              value={form.resumen ?? ""}
              onChange={(e) => commit({ resumen: e.target.value || null })}
              placeholder="Breve descripción del contenido (opcional)"
            />
          </Field>
          <div className="flex items-center gap-4 border-t border-stone pt-4">
            <Toggle checked={form.publicado} onChange={(v) => commit({ publicado: v })} label="Publicado" />
            <span className="text-xs text-muted">
              {form.publicado ? "Visible en /repo y en el sitio principal." : "Solo visible en este panel."}
            </span>
          </div>
        </CardBody>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="lime" onClick={save} disabled={saving}>
          <Save className="size-4" /> {saving ? "Guardando…" : "Guardar documento"}
        </Button>
      </div>
    </div>
  );
}

// ── Pestaña: Importar ──────────────────────────────────────────────────────

function ImportarTab() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportarResultado | null>(null);
  const [uploading, setUploading] = useState(false);
  const [publicando, setPublicando] = useState(false);

  async function subir() {
    if (!file) {
      toast.error("Selecciona un archivo CSV");
      return;
    }
    setUploading(true);
    setResult(null);
    try {
      const res = await repositorio.importar(file);
      setResult(res);
      toast.success(`${res.creados} creados, ${res.actualizados} actualizados`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo importar");
    } finally {
      setUploading(false);
    }
  }

  async function publicarTodos() {
    setPublicando(true);
    try {
      const res = await repositorio.publicarTodos();
      toast.success(
        res.actualizados > 0
          ? `${res.actualizados} documentos publicados`
          : "No había borradores por publicar",
      );
    } catch {
      toast.error("No se pudo publicar todo");
    } finally {
      setPublicando(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-lime text-lime-fg">
              <FileSpreadsheet className="size-5" />
            </span>
            <div>
              <p className="font-display text-sm font-bold text-ink">Importar desde CSV / Excel exportado</p>
              <p className="text-xs text-muted">
                Acepta la exportación "CSV (delimitado por comas)" del Excel original o el CSV
                canónico del proyecto. El código (columna "No.") es la clave: reimportar el mismo
                archivo actualiza los datos sin duplicar. Los nuevos quedan publicados.
              </p>
            </div>
          </div>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-muted file:mr-3 file:rounded-pill file:border-0 file:bg-ink file:px-4 file:py-2 file:font-display file:text-xs file:font-semibold file:text-paper hover:file:bg-ink-mid"
          />
          <div className="flex flex-wrap gap-2">
            <Button variant="lime" onClick={subir} disabled={uploading || !file}>
              <UploadCloud className="size-4" /> {uploading ? "Importando…" : "Importar archivo"}
            </Button>
            <Button
              variant="outline"
              onClick={publicarTodos}
              disabled={publicando}
            >
              <Rocket className="size-4" /> {publicando ? "Publicando…" : "Publicar todos los borradores"}
            </Button>
          </div>
          <p className="text-xs text-muted">
            Tip: los enlaces de drive.google.com/file/d/… se convierten a descarga directa y una
            celda que no sea URL queda como "Enlace pendiente".
          </p>
        </CardBody>
      </Card>

      {result ? (
        <Card>
          <CardBody className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <ResumenNum value={result.creados} label="Creados" tone="lime" />
              <ResumenNum value={result.actualizados} label="Actualizados" tone="neutral" />
              <ResumenNum value={result.errores.length} label="Filas con error" tone="danger" />
            </div>
            {result.errores.length > 0 ? (
              <div className="max-h-56 overflow-y-auto rounded-xl border border-stone bg-fog/60 p-3">
                <p className="mb-2 font-display text-xs font-bold text-ink">Errores por fila</p>
                <ul className="space-y-1">
                  {result.errores.map((e, i) => (
                    <li key={i} className="text-xs text-muted">
                      Fila {e.fila}: {e.motivo}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}

function ResumenNum({ value, label, tone }: { value: number; label: string; tone: "lime" | "neutral" | "danger" }) {
  return (
    <div className="rounded-xl border border-stone bg-fog/60 px-4 py-3">
      <p className={cn("font-display text-2xl font-extrabold", tone === "lime" && "text-lime-hot", tone === "danger" && "text-rose-600", tone === "neutral" && "text-ink")}>
        {value}
      </p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

// ── Pestaña: Estadísticas ──────────────────────────────────────────────────

function EstadisticasTab() {
  const [stats, setStats] = useState<RepositorioStats | null>(null);

  useEffect(() => {
    repositorio
      .estadisticas()
      .then(setStats)
      .catch(() => {
        setStats(null);
      });
  }, []);

  if (!stats) {
    return (
      <div className="p-14">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <ResumenNum value={stats.total} label="Documentos publicados" tone="lime" />
        <ResumenNum value={stats.conEnlace} label="Con enlace de descarga" tone="neutral" />
        <ResumenNum value={stats.sinEnlace} label="Enlace pendiente" tone="danger" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardBody className="space-y-4">
            <p className="font-display text-sm font-bold text-ink">Documentos por dimensión</p>
            <BarList
              data={stats.porDimension.map((g) => ({
                label: DIMENSIONES_REPO.find((d) => d.slug === String(g.clave))?.title ?? String(g.clave),
                value: g.count,
                color: dimRepoColor(String(g.clave)) ?? undefined,
              }))}
            />
          </CardBody>
        </Card>
        <Card>
          <CardBody className="space-y-4">
            <p className="font-display text-sm font-bold text-ink">Por formato</p>
            <BarList data={stats.porFormato.map((g) => ({ label: String(g.clave), value: g.count }))} />
          </CardBody>
        </Card>
        <Card className="lg:col-span-2">
          <CardBody className="space-y-4">
            <p className="font-display text-sm font-bold text-ink">Por tipo de documento</p>
            <BarList data={stats.porTipo.slice(0, 12).map((g) => ({ label: String(g.clave), value: g.count }))} />
          </CardBody>
        </Card>
        <Card className="lg:col-span-2">
          <CardBody className="space-y-4">
            <p className="font-display text-sm font-bold text-ink">Documentos por año</p>
            <div className="flex flex-wrap gap-1.5">
              {stats.porAnio
                .filter((g) => g.clave !== null)
                .sort((a, b) => Number(a.clave) - Number(b.clave))
                .slice(-26)
                .map((g) => (
                  <span key={String(g.clave)} className="rounded-pill border border-stone bg-fog px-3 py-1.5 font-display text-xs font-semibold text-ink">
                    {String(g.clave)} · {g.count}
                  </span>
                ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function BarList({ data }: { data: { label: string; value: number; color?: string }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="space-y-2.5">
      {data.map((d) => (
        <li key={d.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
            <span className="truncate text-muted">{d.label}</span>
            <span className="font-display font-bold text-ink">{d.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-fog">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(3, Math.round((d.value / max) * 100))}%`,
                background: d.color ?? "var(--color-lime-hot)",
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}