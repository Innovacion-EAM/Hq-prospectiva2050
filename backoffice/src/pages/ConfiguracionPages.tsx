import { ConfigCrud, type FieldDef } from "@/components/config-crud";
import { Badge } from "@/components/ui";
import { collections } from "@/lib/data";
import { ICONOS_CATEGORIA, STATUS_TALLER } from "@/lib/types";
import type { DocCategoria, Entidad, Stat, Taller } from "@/lib/types";

export function EstadisticasPage() {
  const fields: FieldDef<Stat>[] = [
    { key: "value", label: "Valor", hint: "Número o texto corto, ej: 11, 2050, 60." },
    { key: "label", label: "Etiqueta", hint: "Ej: Entidades Aliadas." },
    { key: "subtext", label: "Subtítulo", type: "textarea", hint: "Línea de apoyo bajo la etiqueta." },
  ];
  return (
    <ConfigCrud<Stat>
      title="Estadísticas"
      description="Las cuatro tarjetas de indicadores que se muestran en la portada (sección de estadísticas)."
      store={collections.stats}
      empty={() => ({ id: 0, value: "", label: "", subtext: "" })}
      fields={fields}
      columns={(s) => [s.value, s.label, s.subtext]}
    />
  );
}

export function EntidadesPage() {
  const fields: FieldDef<Entidad>[] = [
    { key: "nombre", label: "Nombre de la entidad", hint: "Aparece en la lista de la red institucional." },
  ];
  return (
    <ConfigCrud<Entidad>
      title="Entidades aliadas"
      description="Las doce instituciones que conforman el arreglo institucional del ejercicio."
      store={collections.entidades}
      empty={() => ({ id: 0, nombre: "" })}
      fields={fields}
      columns={(e) => [e.nombre]}
    />
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