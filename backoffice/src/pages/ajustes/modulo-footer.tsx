import { Field, FormGrid, Input } from "@/components/ui";
import type { SiteSettings } from "@/lib/types";
import { EnlacesPieEditor } from "./enlaces-pie-editor";
import { ModuloCard } from "./nav-links-editor";

/**
 * Módulo "Footer": el pie de página del sitio.
 *
 * Aquí viven las redes sociales y el texto de la barra inferior del pie que
 * estaban en el módulo "General" que se eliminó al partir los ajustes por
 * bloques del sitio. Las redes salen en el pie y en ningún otro sitio, y el
 * texto de derechos, solo en la barra inferior.
 *
 * Lo que **no** se edita aquí, y es a propósito:
 *
 *  - **El nombre y la frase del sitio**: ya no se muestran en ninguna parte del
 *    sitio, así que no tienen campo en el panel. Se conservan en la fila de
 *    configuración para no romper instalaciones viejas.
 *
 *  - **Las columnas fijas del pie**: la del mapa del sitio (copia del menú del
 *    encabezado), la de las dimensiones y la del aviso legal. Son el temario
 *    del sitio entero, no contenido que cambie según quien administra. La única
 *    columna que sí se elige es la de las tarjetas de «El proyecto», en la
 *    primera tarjeta de este módulo.
 *  - **El formulario de suscripción al boletín**: es el mismo formulario que el
 *    del hero y el de /participa; cambia a la vez en los tres sitios.
 *  - **El aviso de privacidad** y el enlace a él: es una página legal.
 *
 * La dirección, el teléfono y el correo no están aquí aunque también aparezcan en
 * el pie: son los datos de contacto y se editan en Contáctanos, para no
 * mantener el mismo campo en dos sitios —que es la forma segura de que los dos
 * digan cosas distintas—.
 */
export function ModuloFooter({
  form,
  commit,
}: {
  form: SiteSettings;
  commit: (patch: Partial<SiteSettings>) => void;
}) {
  // `home.footer` siempre existe en el formulario: lo arma `AjustesPage` con
  // `PORTADA_VACIA.footer` al abrir, aunque la fila de la API no lo traiga. Va
  // en una constante porque se usa en dos sitios —al leer la lista y al rearmar
  // el objeto al cambiar— y así no se repite.
  const footer = form.home.footer;

  return (
    <div className="space-y-6">
      <ModuloCard
        titulo="Enlaces de «El proyecto» en el pie"
        descripcion="La columna del pie que sí se elige desde aquí: hasta seis páginas del proyecto, en el orden en que se van a ver. Sin ninguna elegida, el pie muestra las que trae el sitio."
      >
        <EnlacesPieEditor
          value={footer.enlaces}
          onChange={(enlaces) => commit({ home: { ...form.home, footer: { ...footer, enlaces } } })}
        />
      </ModuloCard>

      <ModuloCard
        titulo="Redes sociales"
        descripcion="Los tres iconos del pie de página. Con la casilla vacía no se muestra ese icono."
      >
        <FormGrid>
          <Field label="Facebook">
            <Input
              value={form.facebook ?? ""}
              onChange={(e) => commit({ facebook: e.target.value })}
            />
          </Field>
          <Field label="Instagram">
            <Input
              value={form.instagram ?? ""}
              onChange={(e) => commit({ instagram: e.target.value })}
            />
          </Field>
          <Field label="X / Twitter">
            <Input value={form.x ?? ""} onChange={(e) => commit({ x: e.target.value })} />
          </Field>
        </FormGrid>
      </ModuloCard>

      <ModuloCard
        titulo="Texto de derechos del pie"
        descripcion="Lo que aparece en la barra de abajo del pie, a la izquierda de los enlaces legales. Si se deja vacío, el sitio muestra «Horizonte Quindío 2050 — Todos los derechos reservados»."
      >
        <Field label="Texto de la barra inferior">
          <Input
            value={footer.copyright}
            onChange={(e) =>
              commit({ home: { ...form.home, footer: { ...footer, copyright: e.target.value } } })
            }
            placeholder="Horizonte Quindío 2050 — Todos los derechos reservados"
          />
        </Field>
      </ModuloCard>

      <ModuloCard titulo="Lo que no se cambia aquí">
        <ul className="space-y-2 text-xs text-muted">
          <li>
            <span className="font-semibold text-ink">Las columnas fijas del
            pie.</span> La del mapa del sitio (la copia del menú), la de las
            dimensiones y la del aviso legal son el temario del sitio entero y
            no se eligen desde aquí.
          </li>
          <li>
            <span className="font-semibold text-ink">El formulario del
            boletín.</span> Es el mismo que aparece en el hero y en /participa.
          </li>
          <li>
            <span className="font-semibold text-ink">El aviso de
            privacidad.</span> Es una página legal aparte.
          </li>
          <li>
            <span className="font-semibold text-ink">Correo, teléfono y
            dirección.</span> Aparecen aquí también, pero se editan en{" "}
            Contáctanos: tenerlos en dos sitios es la forma segura de que acaben
            diciendo cosas distintas.
          </li>
        </ul>
      </ModuloCard>
    </div>
  );
}
