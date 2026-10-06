import { Field, Input } from "@/components/ui";
import type { SiteSettings } from "@/lib/types";
import { ModuloCard, NavLinksEditor } from "./nav-links-editor";
import { SelectorImagen } from "./selector-imagen";

/**
 * Módulo "Header": la marca y los textos del encabezado, y el orden de los
 * enlaces del menú.
 *
 * Antes esto estaba escrito en el código del frontend, así que cambiar el orden
 * del menú o el nombre del logo era cosa de tocar el repositorio y volver a
 * compilar. Ahora es una fila de la configuración del sitio, y este módulo es su
 * pantalla.
 */
export function ModuloHeader({
  form,
  commit,
}: {
  form: SiteSettings;
  commit: (patch: Partial<SiteSettings>) => void;
}) {
  return (
    <div className="space-y-6">
      <ModuloCard
        titulo="Marca"
        descripcion="La imagen que se ve arriba a la izquierda. Si no subes ninguna, se usa la marca propia del sitio."
      >
        {/* El logo sí usa `object-contain` y no `object-cover`: se muestra sin
            deformar y sin pasarse de la altura de la barra, así que conviene una
            imagen apaisada y con fondo transparente. Por eso el selector tiene
            dos formas y aquí va la "ancha". */}
        <SelectorImagen
          valor={form.logoUrl ?? ""}
          onChange={(logoUrl) => commit({ logoUrl })}
          etiqueta="el logo"
          respaldo="la marca propia del sitio"
        />
      </ModuloCard>

      <ModuloCard titulo="Textos al lado del logo">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre">
            <Input
              value={form.logoTitulo}
              onChange={(e) => commit({ logoTitulo: e.target.value })}
              placeholder="Horizonte Quindío"
            />
          </Field>
          <Field
            label="Subtítulo"
            hint="Si lo dejas vacío se muestra el texto que trae el sitio por defecto."
          >
            <Input
              value={form.logoSubtitulo}
              onChange={(e) => commit({ logoSubtitulo: e.target.value })}
              placeholder="Prospectiva 2050"
            />
          </Field>
        </div>
      </ModuloCard>

      <ModuloCard
        titulo="Enlaces del menú"
        descripcion="El orden de esta lista es el orden en que se ven, de izquierda a derecha. Con las flechas se sube o se baja cada enlace."
      >
        <NavLinksEditor
          value={form.navLinks}
          onChange={(navLinks) => commit({ navLinks })}
        />
      </ModuloCard>
    </div>
  );
}