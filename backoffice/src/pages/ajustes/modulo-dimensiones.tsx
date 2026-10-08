import { Field, Input, TextArea } from "@/components/ui";
import type { SiteSettings } from "@/lib/types";
import { useEditarPortada } from "./editor-portada";
import { ModuloCard } from "./nav-links-editor";

/**
 * Módulo «Dimensiones»: el hero de la página `/dimensiones`.
 *
 * No es el bloque del home (ese se edita en Home) ni las dimensiones en sí
 * (esas son una colección y se editan en la barra lateral → Dimensiones). Aquí
 * solo van el titular y la bajada que encabezan `/dimensiones`.
 *
 * Las **series de las gráficas** de cada dimensión tampoco se editan aquí: van
 * en Configuración → Estadísticas, para separar el contenido de los datos.
 */
export function ModuloDimensiones({
  form,
  commit,
}: {
  form: SiteSettings;
  commit: (patch: Partial<SiteSettings>) => void;
}) {
  const editar = useEditarPortada(form, commit);
  const ed = form.home.elDimensiones;

  return (
    <div className="space-y-6">
      <ModuloCard
        titulo="Hero de la página"
        descripcion="El titular y la bajada de /dimensiones. A diferencia de los rótulos de la portada, este título sí se edita."
      >
        <div className="space-y-4">
          <Field label="Titular">
            <Input
              value={ed.titulo}
              onChange={(e) => editar("elDimensiones", "titulo", e.target.value)}
              placeholder="Las cuatro dimensiones del territorio"
              maxLength={200}
            />
          </Field>

          <Field
            label="Introducción"
            hint="La frase bajo el titular, en el recuadro del hero."
          >
            <TextArea
              rows={3}
              value={ed.intro}
              onChange={(e) => editar("elDimensiones", "intro", e.target.value)}
              placeholder="Cuatro lecturas del Quindío que articulan el diagnóstico, los escenarios y los acuerdos del Horizonte 2050."
              maxLength={600}
            />
          </Field>
        </div>
      </ModuloCard>

      <p className="text-xs text-muted">
        Lo que dejes vacío se sustituye por el texto que trae el sitio. Las
        dimensiones en sí se editan en la barra lateral → Dimensiones, y sus
        gráficas en Configuración → Estadísticas.
      </p>
    </div>
  );
}