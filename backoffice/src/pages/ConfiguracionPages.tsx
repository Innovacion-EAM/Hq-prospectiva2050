import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { ConfigCrud, type FieldDef } from "@/components/config-crud";
import { ChartsEditor } from "@/components/charts-editor";
import { Badge, Button, Card, CardBody, EmptyState, PageHeader, Spinner } from "@/components/ui";
import { collections, useCollection } from "@/lib/data";
import { ICONOS_CATEGORIA, STATUS_TALLER } from "@/lib/types";
import type { ChartSeries, Dimension, DocCategoria, Taller } from "@/lib/types";

/**
 * Tarjeta de las series de una dimensión.
 *
 * El estado de las series vive aquí y no en `EstadisticasPage` para que cada
 * tarjeta se guarde sola: la lista trae las cuatro dimensiones de análisis y los
 * cuatro bloques, y arrastrar un único formulario para todas obligaría a guardar
 * filas que nadie tocó.
 */
function EstadisticaDimensionCard({
  dim,
  onSave,
}: {
  dim: Dimension;
  onSave: (charts: ChartSeries[]) => Promise<void>;
}) {
  const [charts, setCharts] = useState<ChartSeries[]>(dim.charts);
  const [saving, setSaving] = useState(false);
  const cambio = JSON.stringify(charts) !== JSON.stringify(dim.charts);

  async function guardar() {
    setSaving(true);
    try {
      await onSave(charts);
      toast.success(`Series de «${dim.title}» guardadas.`);
    } catch {
      toast.error("No se pudieron guardar las series.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold text-ink">{dim.title}</p>
            <p className="mt-0.5 text-xs text-muted">
              {dim.tipo === "dimension" ? "Dimensión de análisis" : "Bloque del home"} · /{dim.slug}
            </p>
          </div>
          <Button variant="lime" size="sm" onClick={guardar} disabled={saving || !cambio}>
            <Save className="size-3.5" /> {saving ? "Guardando…" : "Guardar"}
          </Button>
        </div>
        <ChartsEditor value={charts} onChange={setCharts} />
      </CardBody>
    </Card>
  );
}

/**
 * Estadísticas: las series de los gráficos, por dimensión.
 *
 * Antes esta pantalla editaba las cuatro cifras de la portada (11, 2050, 3 y
 * 60); esas cifras son datos de la portada y se editan donde se ven, en **Ajustes
 * → Home**. Aquí se editan en cambio las series de `dimension.charts`, que son
 * las que dibujan las gráficas de `/dimensiones`. Administra **todas** las
 * entidades con series: las cuatro dimensiones de análisis y también los bloques
 * del home (misiones, retos, iniciativas y hallazgos).
 */
export function EstadisticasPage() {
  const { items, loading, update } = useCollection(collections.dimensiones());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estadísticas"
        description="Las series de datos que dibujan las gráficas de cada dimensión en el sitio."
      />

      <p className="max-w-3xl rounded-2xl border border-mist bg-fog px-4 py-3 text-xs text-muted">
        Aquí van las series de los gráficos, por dimensión. Las cuatro cifras de la portada (11, 2050,
        3 y 60) se editan en <span className="font-semibold text-ink">Ajustes → Home</span>, y el texto
        de cada dimensión en la barra lateral →{" "}
        <span className="font-semibold text-ink">Dimensiones</span>.
      </p>

      {loading ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Sin dimensiones"
          description="Crea una dimensión en la barra lateral para poder cargarle series."
        />
      ) : (
        <div className="space-y-4">
          {items.map((dim) => (
            <EstadisticaDimensionCard
              key={dim.id}
              dim={dim}
              onSave={(charts) => update(dim.id, { charts }).then(() => undefined)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TalleresPage() {
  const fields: FieldDef<Taller>[] = [
    { key: "date", label: "Fecha", type: "date" },
    { key: "title", label: "Nombre del taller" },
    { key: "place", label: "Lugar" },
    { key: "status", label: "Estado", type: "select", options: STATUS_TALLER },
  ];
  return (
    <ConfigCrud<Taller>
      title="Talleres y eventos"
      description="Agenda pública que se muestra en la sección Participa."
      store={collections.talleres}
      empty={() => ({ id: 0, date: "", title: "", place: "", status: "Próximo" })}
      fields={fields}
      columns={(t) => [t.title, `${t.date} · ${t.place}`]}
      display={(t) => (
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold text-ink">{t.title}</p>
            <p className="mt-0.5 text-xs text-muted">
              {t.date} · {t.place}
            </p>
          </div>
          <Badge tone={t.status === "Abierto" ? "lime" : t.status === "Realizado" ? "neutral" : "ink"}>
            {t.status}
          </Badge>
        </div>
      )}
    />
  );
}

export function CategoriasPage() {
  const fields: FieldDef<DocCategoria>[] = [
    { key: "title", label: "Título de la categoría" },
    { key: "slug", label: "Slug" },
    { key: "description", label: "Descripción", type: "textarea" },
    { key: "icon", label: "Icono", type: "select", options: ICONOS_CATEGORIA },
  ];
  return (
    <ConfigCrud<DocCategoria>
      title="Categorías de documentos"
      description="Las seis categorías del repositorio de documentos de la portada."
      store={collections.categorias}
      empty={() => ({ id: 0, title: "", slug: "", description: "", icon: "file" })}
      fields={fields}
      columns={(c) => [c.title, `/documentos/${c.slug} · ${c.icon}`]}
    />
  );
}