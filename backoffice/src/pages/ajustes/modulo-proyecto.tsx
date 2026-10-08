import { Field, Input, TextArea } from "@/components/ui";
import type { SiteSettings } from "@/lib/types";
import { useEditarPortada } from "./editor-portada";
import { ModuloCard } from "./nav-links-editor";
import { SelectorImagen } from "./selector-imagen";

const PLACEHOLDER_ETAPAS = [
  "Diagnóstico y diseño metodológico",
  "Escenarios y visión compartida",
  "Institucionalización y observatorio",
] as const;

/**
 * Módulo «El proyecto»: el contenido de la página `/proyecto`.
 *
 * No es el bloque oscuro de la portada (ese se edita en Home). Es la página
 * del menú: el titular «Una visión compartida…», los dos párrafos y las tres
 * etapas.
 *
 * Las tarjetas de detalle (qué es, gobernanza, línea de tiempo…) siguen en su
 * pantalla: la barra lateral → El proyecto. La cobertura territorial y las
 * entidades aliadas son fijas del diseño y no se editan.
 */
export function ModuloProyecto({
  form,
  commit,
}: {
  form: SiteSettings;
  commit: (patch: Partial<SiteSettings>) => void;
}) {
  const editar = useEditarPortada(form, commit);
  const ep = form.home.elProyecto;
  const etapas = [ep.etapas[0] ?? "", ep.etapas[1] ?? "", ep.etapas[2] ?? ""];

  return (
    <div className="space-y-6">
      <ModuloCard
        titulo="Hero de la página"
        descripcion="El titular, la bajada y la imagen de fondo de /proyecto. A diferencia de los rótulos de la portada, este título sí se edita."
      >
        <div className="space-y-6">
          <div>
            <p className="mb-2 font-display text-xs font-bold text-ink">Fondo</p>
            <SelectorImagen
              valor={ep.fondo}
              onChange={(fondo) => editar("elProyecto", "fondo", fondo)}
              etiqueta="el fondo de El proyecto"
              respaldo="la imagen del sitio"
              forma="corta"
            />
          </div>

          <Field label="Titular">
            <Input
              value={ep.titulo}
              onChange={(e) => editar("elProyecto", "titulo", e.target.value)}
              placeholder="Una visión compartida para el Quindío"
              maxLength={200}
            />
          </Field>

          <Field
            label="Introducción"
            hint="La frase bajo el titular, en el recuadro del hero."
          >
            <TextArea
              rows={3}
              value={ep.intro}
              onChange={(e) => editar("elProyecto", "intro", e.target.value)}
              placeholder="Catorce entidades del departamento y la CEPAL construyen, entre 2026 y 2027, la hoja de ruta al 2050."
              maxLength={600}
            />
          </Field>
        </div>
      </ModuloCard>

      <ModuloCard
        titulo="Cuerpo"
        descripcion="Los dos párrafos que van a la izquierda de las etapas."
      >
        <div className="space-y-4">
          <Field label="Primer párrafo">
            <TextArea
              rows={4}
              value={ep.parrafoUno}
              onChange={(e) => editar("elProyecto", "parrafoUno", e.target.value)}
              maxLength={1000}
            />
          </Field>
          <Field label="Segundo párrafo">
            <TextArea
              rows={4}
              value={ep.parrafoDos}
              onChange={(e) => editar("elProyecto", "parrafoDos", e.target.value)}
              maxLength={1000}
            />
          </Field>
        </div>
      </ModuloCard>

      <ModuloCard
        titulo="Tres etapas"
        descripcion="El recuadro de la derecha. El 01, 02 y 03 los pone el diseño: aquí solo se cambia el texto de cada una."
      >
        <ol className="space-y-3">
          {etapas.map((etapa, i) => (
            <li key={i}>
              <Field label={`Etapa ${String(i + 1).padStart(2, "0")}`}>
                <Input
                  value={etapa}
                  onChange={(e) => {
                    const next = [...etapas];
                    next[i] = e.target.value;
                    editar("elProyecto", "etapas", next);
                  }}
                  placeholder={PLACEHOLDER_ETAPAS[i]}
                  maxLength={160}
                />
              </Field>
            </li>
          ))}
        </ol>
      </ModuloCard>

      <p className="text-xs text-muted">
        Lo que dejes vacío se sustituye por el texto que trae el sitio.
      </p>
    </div>
  );
}
