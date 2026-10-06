import { Field, FormGrid, Input } from "@/components/ui";
import type { SiteSettings } from "@/lib/types";
import { EnlacesPieEditor } from "./enlaces-pie-editor";
import { ModuloCard } from "./nav-links-editor";

/**
 * Módulo "Footer": el pie de página del sitio.
 *
 * Aquí viven las redes sociales, el nombre y la frase del sitio, que estaban en
 * el módulo "General" que se eliminó al partir los ajustes por bloques del
 * sitio. Las redes salen en el pie y en ningún otro sitio, y el nombre y la
 * frase, en el aviso legal y en el pie.
 *
 * Lo que **no** se edita aquí, y es a propósito:
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
        titulo="Identidad del sitio"
        descripcion="El nombre y la frase que salen en el pie y en el aviso de privacidad."
      >
        <FormGrid>
          <Field label="Nombre del sitio">
            <Input
              value={form.nombre}
              onChange={(e) => commit({ nombre: e.target.value })}
            />
          </Field>
          <Field label="Frase">
            <Input
              value={form.tagline}
              onChange={(e) => commit({ tagline: e.target.value })}
            />
          </Field>
        </FormGrid>
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
