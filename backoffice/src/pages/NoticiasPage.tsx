import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Save, Star, Trash2 } from "lucide-react";
import { collections, slugify, todayISO, useCollection } from "@/lib/data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Badge,
  Button,
  Card,
  CardBody,
  ConfirmButton,
  Divider,
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
  Thumb,
  Toggle,
} from "@/components/ui";
import { CATEGORIAS_NOTICIA, type Noticia } from "@/lib/types";

function emptyNoticia(): Noticia {
  return {
    id: 0,
    slug: "",
    titulo: "",
    categoria: CATEGORIAS_NOTICIA[0] ?? "Noticias y Comunicados",
    fecha: todayISO(),
    imagen: "/images/news-ciudad.jpg",
    resumen: "",
    contenido: [""],
    etiquetas: [],
    publicado: true,
    destacado: false,
  };
}

export function NoticiasListPage() {
  const { items, loading, update, remove } = useCollection(collections.noticias());
  const [q, setQ] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<
    "todas" | "publicadas" | "borradores" | "destacadas"
  >("todas");
  const [categoria, setCategoria] = useState("Todas");

  const categorias = Array.from(new Set(["Todas", ...items.map((n) => n.categoria)]));

  const filtered = items
    .filter((n) => (categoria === "Todas" ? true : n.categoria === categoria))
    .filter((n) =>
      filtroEstado === "todas"
        ? true
        : filtroEstado === "publicadas"
          ? n.publicado
          : filtroEstado === "borradores"
            ? !n.publicado
            : n.destacado,
    )
    .filter((n) =>
      `${n.titulo} ${n.resumen} ${n.categoria} ${n.etiquetas.join(" ")}`
        .toLowerCase()
        .includes(q.toLowerCase()),
    )
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id);

  async function togglePublicado(n: Noticia) {
    await update(n.id, { publicado: !n.publicado });
    toast.success(n.publicado ? "Noticia en borrador" : "Noticia publicada");
  }

  async function toggleDestacado(n: Noticia) {
    await update(n.id, { destacado: !n.destacado });
    toast.success(n.destacado ? "Dejó de ser destacada" : "Marcada como destacada");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Noticias"
        description="CRUD de noticias, comunicados, talleres y convocatorias. La primeras publicaciones aparecen en la portada de /noticias."
        actions={
          <LinkBtn to="/noticias/nuevo" variant="lime">
            <Star className="size-4" /> Nueva noticia
          </LinkBtn>
        }
      />

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {categorias.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategoria(c)}
              className={cn(
                "rounded-pill px-3.5 py-1.5 font-display text-xs font-semibold transition-colors",
                categoria === c ? "bg-lime text-lime-fg" : "border border-mist bg-paper text-muted hover:text-ink",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              ["todas", "Todas"],
              ["publicadas", "Publicadas"],
              ["borradores", "Borradores"],
              ["destacadas", "Destacadas"],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => setFiltroEstado(v)}
              className={cn(
                "rounded-pill px-3 py-1 text-[0.7rem] font-semibold transition-colors",
                filtroEstado === v ? "bg-ink text-paper" : "bg-fog text-muted hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar noticia..."
            className="h-9 w-full rounded-pill border border-mist bg-paper px-4 text-sm outline-none focus:border-lime-hot focus:ring-2 focus:ring-lime/40 xl:w-56"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-14">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No se encontraron noticias"
          description="Ajusta los filtros o crea una noticia nueva."
          action={
            <LinkBtn to="/noticias/nuevo" variant="lime">
              Crear noticia
            </LinkBtn>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone bg-paper">
          <ul className="divide-y divide-stone">
            {filtered.map((n) => (
              <li
                key={n.id}
                className="group flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-fog/60 sm:flex-row sm:items-center"
              >
                <Thumb src={n.imagen} alt={n.titulo} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone="neutral">{n.categoria}</Badge>
                    {n.destacado ? (
                      <Badge tone="ink">
                        <Star className="size-2.5" /> Destacada
                      </Badge>
                    ) : null}
                    {n.publicado ? (
                      <Badge tone="lime">
                        <Eye className="size-2.5" /> Publicada
                      </Badge>
                    ) : (
                      <Badge>
                        <EyeOff className="size-2.5" /> Borrador
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1.5 truncate font-display text-sm font-semibold text-ink">{n.titulo}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {n.fecha} · /noticias/{n.slug}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePublicado(n)}
                    title={n.publicado ? "Pasar a borrador" : "Publicar"}
                  >
                    {n.publicado ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleDestacado(n)}
                    className={cn(n.destacado && "border-amber-300 text-amber-600")}
                    title={n.destacado ? "Quitar destacada" : "Marcar como destacada"}
                  >
                    <Star className="size-3.5" fill={n.destacado ? "currentColor" : "none"} />
                  </Button>
                  <LinkBtn to={`/noticias/${n.id}`} variant="outline" size="sm">
                    Editar
                  </LinkBtn>
                  <ConfirmButton
                    label="Eliminar noticia"
                    onConfirm={async () => {
                      await remove(n.id);
                      toast.success("Noticia eliminada");
                    }}
                    confirmText="¿Eliminar noticia?"
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

export function NoticiaFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { items, loading, create, update } = useCollection(collections.noticias());

  const item = items.find((n) => n.id === Number(id));
  const [form, setForm] = useState<Noticia | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading || form) return;
    if (isEdit && !item) return;
    setForm(item ? { ...item, contenido: [...item.contenido], etiquetas: [...item.etiquetas] } : emptyNoticia());
  }, [loading, item, form, isEdit]);

  if (loading || (!form && isEdit && !item)) {
    return (
      <div className="p-14">
        <Spinner />
      </div>
    );
  }

  if (isEdit && !item) {
    return (
      <EmptyState
        title="Noticia no encontrada"
        action={<LinkBtn to="/noticias">Volver</LinkBtn>}
      />
    );
  }

  const guardar = form!;

  function commit(patch: Partial<Noticia>) {
    setForm((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  async function save() {
    if (!guardar.titulo.trim()) {
      toast.error("El título es obligatorio");
      return;
    }
    const payload: Noticia = {
      ...guardar,
      slug: guardar.slug.trim() ? guardar.slug : slugify(guardar.titulo),
    };
    setSaving(true);
    try {
      const saved = isEdit ? await update(Number(id), payload) : await create(payload);
      toast.success(isEdit ? "Noticia actualizada" : "Noticia creada");
      navigate(`/noticias/${saved.id}`);
    } catch {
      toast.error("No se pudo guardar la noticia");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Editar noticia" : "Nueva noticia"}
        description={`URL pública: /noticias/${guardar.slug || slugify(guardar.titulo)}`}
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
              <Input
                value={guardar.titulo}
                onChange={(e) => commit({ titulo: e.target.value })}
                placeholder="Título de la noticia"
              />
            </Field>
            <FormGrid>
              <Field label="Fecha de publicación">
                <Input type="date" value={guardar.fecha} onChange={(e) => commit({ fecha: e.target.value })} />
              </Field>
              <Field label="Categoría">
                <Select value={guardar.categoria} onChange={(e) => commit({ categoria: e.target.value })}>
                  {CATEGORIAS_NOTICIA.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
            </FormGrid>
            <Field label="Slug" hint="Deja vacío para generarlo automáticamente desde el título.">
              <Input
                value={guardar.slug}
                onChange={(e) => commit({ slug: e.target.value })}
                placeholder="se-genera-automaticamente"
              />
            </Field>
            <Field label="Imagen" hint="Ruta dentro de public/ o URL completa.">
              <Input
                value={guardar.imagen}
                onChange={(e) => commit({ imagen: e.target.value })}
                placeholder="/images/news-ciudad.jpg"
              />
            </Field>
            <Field label="Resumen" hint="Texto breve que se muestra en tarjetas y en el buscador.">
              <TextArea rows={3} value={guardar.resumen} onChange={(e) => commit({ resumen: e.target.value })} />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-6">
            <Field label="Vista previa">
              <Thumb src={guardar.imagen} alt={guardar.titulo} className="h-28 w-full" />
            </Field>
            <div className="flex flex-col gap-3">
              <Toggle checked={guardar.publicado} onChange={(v) => commit({ publicado: v })} label="Publicada" />
              <Toggle checked={guardar.destacado} onChange={(v) => commit({ destacado: v })} label="Destacada (portada)" />
            </div>
            <Divider />
            <StringsEditor
              label="Etiquetas"
              value={guardar.etiquetas}
              onChange={(etiquetas) => commit({ etiquetas })}
              hint="Se usan para búsqueda y agrupación."
              placeholder="Etiqueta"
            />
            <Card className="bg-fog p-4 text-xs text-muted">
              <p className="font-display text-xs font-bold text-ink">Nota sobre destacadas</p>
              <p className="mt-1">
                El sitio muestra la primera noticia de la lista como tarjeta destacada al inicio de /noticias.
                Combina la fecha y esta marca para controlar cuál aparece en grande.
              </p>
            </Card>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <ParagraphEditor
            label="Contenido"
            value={guardar.contenido}
            onChange={(contenido) => commit({ contenido })}
            hint="Cada bloque es un párrafo del artículo completo."
          />
        </CardBody>
      </Card>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button variant="outline" onClick={() => navigate(-1)} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="lime" onClick={save} disabled={saving}>
          <Save className="size-4" /> {saving ? "Guardando…" : "Guardar noticia"}
        </Button>
      </div>
    </div>
  );
}