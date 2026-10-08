import { ConfigCrud, type FieldDef } from "@/components/config-crud";
import { Badge, PageHeader } from "@/components/ui";
import { collections } from "@/lib/data";
import { ICONOS_CATEGORIA, STATUS_TALLER } from "@/lib/types";
import type { DocCategoria, Taller } from "@/lib/types";

/**
 * Sección de estadísticas del panel, **vacía a propósito**.
 *
 * Antes editaba las cuatro cifras de la portada (11, 2050, 3 y 60). Esas cifras
 * son datos de la portada, así que ahora se editan donde se ven: en **Ajustes →
 * Home**, en la tarjeta «Cifras de la portada». Esta pantalla queda reservada
 * para otra cosa; mientras tanto, deja claro dónde se edita lo que había aquí.
 */
export function EstadisticasPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Estadísticas"
        description="Sección reservada para otro contenido."
      />
      <p className="max-w-2xl text-sm text-muted">
        Las cuatro cifras de la portada (11, 2050, 3 y 60) se editan ahora en{" "}
        <span className="font-semibold text-ink">Ajustes → Home</span>, en la
        tarjeta «Cifras de la portada», donde se ven junto al resto del inicio.
      </p>
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