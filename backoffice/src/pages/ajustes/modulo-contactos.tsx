import { Field, FormGrid, Input } from "@/components/ui";
import type { SiteSettings } from "@/lib/types";
import { ModuloCard } from "./nav-links-editor";
import { CampoTelefono } from "./campo-telefono";

/**
 * Módulo "Contáctanos": los datos con los que el sitio responde.
 *
 * Aquí viven el correo, el teléfono y la dirección, que estaban en el módulo
 * "General" que se eliminó al partir los ajustes por bloques del sitio. Encajan
 * aquí porque son los datos con los que alguien escribe: el bloque de la
 * portada, la página `/contactos`, el pie de página y el aviso de privacidad
 * los muestran.
 *
 * **El bloque de contacto de la portada no está aquí, salvo el correo, el
 * teléfono, la dirección y la ciudad.** Su bajada, el rótulo de su formulario y
 * el color de sus dos botones son de la portada y se editan en **Home**, junto
 * al resto de bloques. Lo que se repite es el correo, el teléfono y la
 * dirección, porque se piden los dos sitios: quien edita está viendo el bloque
 * de la portada y quien busca "a quién le escribo" está aquí.
 *
 * Repetirlos no es tener dos copias del dato: los dos módulos escriben en las
 * mismas columnas de la configuración, leen del mismo formulario y se ven en la
 * misma pantalla de guardado, así que no pueden quedar distintos. Lo que **no**
 * se hace es inventar un segundo sitio para un dato que solo aparece en un
 * bloque.
 *
 * El teléfono se escribe sin espacios: el campo los pone solo mientras se
 * escribe, y el `tel:` del enlace —lo que marca el botón de llamar— sale del
 * propio número, sin un segundo campo que pueda quedarse con el valor viejo.
 */
export function ModuloContactos({
  form,
  commit,
}: {
  form: SiteSettings;
  commit: (patch: Partial<SiteSettings>) => void;
}) {
  return (
    <div className="space-y-6">
      <ModuloCard
        titulo="Los datos de contacto"
        descripcion="Con los que responde el sitio: aparecen en el bloque, en /contactos, en el pie de página y en el aviso de privacidad. También están en Home, que es donde se ven en la portada; se editan en cualquiera de los dos y el cambio sale en todo el sitio."
      >
        <FormGrid>
          <Field label="Correo">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => commit({ email: e.target.value })}
            />
          </Field>
          <Field label="Dirección">
            <Input
              value={form.direccion}
              onChange={(e) => commit({ direccion: e.target.value })}
            />
          </Field>
          <CampoTelefono
            valor={form.telefono}
            hrefActual={form.telefonoHref}
            onChange={(telefono, telefonoHref) => commit({ telefono, telefonoHref })}
          />
          <Field label="Ciudad">
            <Input
              value={form.ciudad}
              onChange={(e) => commit({ ciudad: e.target.value })}
            />
          </Field>
        </FormGrid>
      </ModuloCard>
    </div>
  );
}