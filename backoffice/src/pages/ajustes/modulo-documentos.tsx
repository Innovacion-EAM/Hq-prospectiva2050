import { Field, Input, TextArea } from "@/components/ui";
import type { SiteSettings } from "@/lib/types";
import { useEditarPortada } from "./editor-portada";
import { ModuloCard } from "./nav-links-editor";
import { SelectorColor } from "./selector-color";
import { SelectorImagen } from "./selector-imagen";

/**
 * Módulo «Documentos»: el hero de la página `/documentos` y el bloque de la
 * portada que invita a las categorías.
 *
 * Hace dos cosas y las dos importan:
 *
 *  - **El hero de `/documentos`** (`home.elDocumentos`): el titular, la bajada y
 *    la imagen de fondo. Antes salían escritos en el código de la página y no
 *    había forma de cambiarlos.
 *  - **El bloque de la portada** (`home.documentos`): su texto y el color del
 *    botón «Ver más» de cada categoría. **Los mismos campos se editan también
 *    en Home**, a propósito: quien está mirando la portada los cambia ahí, y
 *    quien está trabajando el módulo de documentos los encuentra aquí. No son
 *    dos copias del dato: los dos módulos escriben en la misma sección
 *    (`home.documentos`) del mismo formulario y del mismo guardado, así que no
 *    pueden quedar distintos.
 *
 * **Lo que no está aquí, y por qué:**
 *
 *  - **Los documentos en sí** (título, autor, fecha, tipo, delimitación,
 *    formato, enlace o archivo): son una colección y se editan en la barra
 *    lateral → Documentos.
 *  - **Las categorías** (su nombre, su descripción y su icono): son otra
 *    colección, en Configuración → Categorías.
 *  - **El rótulo «Documentos y publicaciones»** del bloque: es fijo del diseño
 *    y sale del código (ver `fijoPortada` en el frontend), como el resto de
 *    rótulos de la portada.
 */
export function ModuloDocumentos({
  form,
  commit,
}: {
  form: SiteSettings;
  commit: (patch: Partial<SiteSettings>) => void;
}) {
  const editar = useEditarPortada(form, commit);
  const hero = form.home.elDocumentos;
  const bloque = form.home.documentos;

  return (
    <div className="space-y-6">
      <ModuloCard
        titulo="Hero de la página"
        descripcion="El titular, la bajada y la imagen de fondo de /documentos. A diferencia de los rótulos de la portada, este título sí se edita."
      >
        <div className="space-y-6">
          <div>
            <p className="mb-2 font-display text-xs font-bold text-ink">Fondo</p>
            <SelectorImagen
              valor={hero.fondo}
              onChange={(fondo) => editar("elDocumentos", "fondo", fondo)}
              etiqueta="el fondo de Documentos"
              respaldo="la imagen del sitio"
              forma="corta"
            />
          </div>

          <Field label="Titular">
            <Input
              value={hero.titulo}
              onChange={(e) => editar("elDocumentos", "titulo", e.target.value)}
              placeholder="Repositorio de documentos"
              maxLength={200}
            />
          </Field>

          <Field
            label="Introducción"
            hint="La frase bajo el titular, en el recuadro del hero."
          >
            <TextArea
              rows={3}
              value={hero.intro}
              onChange={(e) => editar("elDocumentos", "intro", e.target.value)}
              placeholder="Convenios, informes, memorias, boletines y piezas de socialización del proceso…"
              maxLength={600}
            />
          </Field>
        </div>
      </ModuloCard>

      <ModuloCard
        titulo="Bloque de la portada"
        descripcion="El mismo bloque que se edita en Home: el texto sobre las categorías y el color del botón «Ver más». Los dos módulos escriben en el mismo sitio."
      >
        <div className="space-y-4">
          <Field
            label="Texto"
            hint="El rótulo «Documentos y publicaciones» que va encima es fijo del diseño."
          >
            <TextArea
              rows={2}
              value={bloque.texto}
              onChange={(e) => editar("documentos", "texto", e.target.value)}
            />
          </Field>
          <SelectorColor
            etiqueta="Color del botón «Ver más»"
            hint="El mismo botón se pone en las seis tarjetas de categorías."
            valor={bloque.botonColor}
            onChange={(botonColor) => editar("documentos", "botonColor", botonColor)}
          />
        </div>
      </ModuloCard>

      <p className="text-xs text-muted">
        Lo que dejes vacío se sustituye por el texto o la imagen que trae el sitio.
        Los documentos se editan en la barra lateral → <span className="font-semibold text-ink">Documentos</span>;
        las categorías, en Configuración → <span className="font-semibold text-ink">Categorías</span>.
      </p>
    </div>
  );
}
