import { Field, FormGrid, Input, LinkBtn, ParagraphEditor, TextArea } from "@/components/ui";
import { ListChecks } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { ModuloCard } from "./nav-links-editor";
import { SelectorImagen } from "./selector-imagen";
import { SelectorColor, SelectorColorSobreLima } from "./selector-color";
import { useEditarPortada } from "./editor-portada";
import { CampoTelefono } from "./campo-telefono";

/**
 * Tope de renglones del titular del hero. Tiene que coincidir con
 * `@ArrayMaxSize(10)` en `SiteConfigDto.headline`: sin él, quien escriba la
 * undécima línea se enteraría de un `400` que no dice qué campo sobra.
 */
export const LINEAS_TITULAR_MAX = 10;

/**
 * Módulo "Home": el hero de la portada y todo lo que va desde ahí hasta antes
 * del pie de página.
 *
 * Hasta ahora esto estaba escrito en el código del frontend, así que cambiar el
 * titular, una imagen de fondo o el texto de un botón era cosa de tocar el
 * repositorio y volver a compilar. Ahora es una parte de la misma fila de
 * configuración que el resto de ajustes, y este módulo es su pantalla.
 *
 * **Aquí está todo lo editable de la portada**, aunque la lista de módulos de
 * arriba tenga uno por bloque del sitio. Los módulos siguientes se van llenando
 * según lo que haga falta; mientras tanto no se les quita nada de aquí, porque
 * mientras el sitio funcione como hasta ahora, es aquí donde está.
 *
 * Las secciones van en el mismo orden en que se ven en la portada, para que
 * quien edita no tenga que saltar de arriba abajo. Lo que **no** está aquí, y es
 * a propósito:
 *
 *  - **Las cifras** (las cuatro tarjetas con números): viven en su propia
 *    pantalla, Configuración → Estadísticas, porque son datos y no rótulos. Al
 *    final de este módulo hay un enlace directo para no tener que buscarla.
 *  - **Las Municipalidades** (la lista de los doce municipios): igual, en
 *    Configuración → Municipios.
 *  - **Las categorías de documentos**: Configuración → Categorías.
 *  - **Las noticias**: son contenido, se editan en Noticias.
 *  - **Las dimensiones**: Configuración → Dimensiones.
 *
 * Aquí solo están los textos y las imágenes propios de la portada.
 *
 * **Los rótulos que encabezan cada bloque no están aquí porque son fijos**: los
 * títulos de "El proyecto", "Las cuatro dimensiones", Municipios, Documentos,
 * Noticias y Contactos. Son parte del diseño de la portada, se cambian en el
 * código del sitio y no son cosas que se ajustan desde el panel. Por eso tampoco
 * hay ningún campo aquí que los toque: ofrecer un campo que luego el sitio
 * ignora sería peor que no ofrecerlo, porque alguien escribiría, guardaría y no
 * vería ningún cambio. Lo que sí se edita en cada bloque es la bajada, los
 * rótulos de botón y las imágenes.
 *
 * **El titular del hero sí se edita** —es el primer campo del módulo— y no vive
 * en `home`: va renglón por renglón porque cada línea tiene su color, y está en
 * la columna propia `headline` de la configuración, la misma que ya existía
 * antes de este módulo. Por eso el campo escribe con `commit` y no con `editar`.
 *
 * **Del color hay un campo por botón, y no uno solo para la portada**, porque los
 * botones no se parecen entre sí: el del hero va sobre una foto oscura, el «Ver
 * más» de cada noticia va **encima** de la foto de la noticia, y el «Enviar» de la
 * caja de sugerencias va sobre un fondo lima. Con un solo color habría que
 * decidir cuál de los dos lados de cada botón se enteraba. Todos eligen de la
 * misma lista cerrada —salvo el de la caja lima, que va en la corta porque sobre
 * lima se fundiría— y ninguno admite un color libre: cada uno de la lista ya
 * viene con el texto que contrasta con él.
 */
export function ModuloHome({
  form,
  commit,
}: {
  form: SiteSettings;
  commit: (patch: Partial<SiteSettings>) => void;
}) {
  const editar = useEditarPortada(form, commit);

  const { hero, proyecto, cobertura, documentos, repositorio, noticias, contacto } = form.home;

  return (
    <div className="space-y-6">
      {/* El titular es lo primero porque es lo primero que se ve en la portada.
          Escribe en `headline` (columna de la fila) y no en `home`, así que va
          con `commit` directo y no con `editar` de la portada. */}
      <ModuloCard
        titulo="Titular del hero"
        descripcion="El texto grande de la portada, sobre la foto de fondo. Una línea por renglón: el último renglón sale en color lima. Si se deja sin líneas, el sitio muestra el titular que trae por defecto."
      >
        <ParagraphEditor
          label="Renglones del titular"
          hint="El sitio admite hasta 10. Las líneas en blanco no se guardan."
          value={form.headline}
          onChange={(headline) => commit({ headline })}
        />
      </ModuloCard>

      <ModuloCard titulo="Hero: imágenes y botón">
        <div className="space-y-6">
          <div>
            <p className="mb-2 font-display text-xs font-bold text-ink">Fondo del hero</p>
            <SelectorImagen
              valor={hero.fondo}
              onChange={(fondo) => editar("hero", "fondo", fondo)}
              etiqueta="el fondo del hero"
              respaldo="la imagen del sitio"
              forma="corta"
            />
            <p className="mt-1 text-xs text-muted">
              Se ve al 45% de opacidad y en escala de grises, para que el titular
              en blanco se lea encima. Conviene una imagen apaisada.
            </p>
          </div>

          <div>
            <p className="mb-2 font-display text-xs font-bold text-ink">Foto de las personas</p>
            <SelectorImagen
              valor={hero.imagen}
              onChange={(imagen) => editar("hero", "imagen", imagen)}
              etiqueta="la foto de las personas"
              respaldo="la foto del sitio"
              forma="corta"
            />
            <p className="mt-1 text-xs text-muted">
              Va en la derecha, con el anillo verde detrás. El encuadre se recorta
              en sí misma, así que conviene una foto vertical o de personas de pie.
            </p>
          </div>

          <FormGrid>
            <Field label="Texto del botón">
              <Input
                value={hero.botonTexto}
                onChange={(e) => editar("hero", "botonTexto", e.target.value)}
                placeholder="Explorar más »"
              />
            </Field>
            <SelectorColor
              etiqueta="Color del botón"
              hint="Solo los colores de la lista: cada uno ya viene con el texto que contrasta con él."
              valor={hero.botonColor}
              onChange={(botonColor) => editar("hero", "botonColor", botonColor)}
            />
          </FormGrid>

          <div className="space-y-4 rounded-2xl border border-mist bg-fog p-4">
            <Field
              label="Rótulo de la caja de preguntas"
              hint="El texto de la tarjeta lima que dice «¿Tienes alguna pregunta…?». El formulario en sí no se cambia."
            >
              <Input
                value={hero.cajaTitulo}
                onChange={(e) => editar("hero", "cajaTitulo", e.target.value)}
                placeholder="¿Tienes alguna pregunta o quieres darnos una recomendación?"
              />
            </Field>
            <SelectorColorSobreLima
              etiqueta="Color del «Enviar» de esa caja"
              hint="Menos opciones a propósito: la caja es lima, y un botón lima encima de una caja lima no se vería."
              valor={hero.cajaBotonColor}
              onChange={(cajaBotonColor) => editar("hero", "cajaBotonColor", cajaBotonColor)}
            />
          </div>
        </div>
      </ModuloCard>

      <ModuloCard
        titulo="Sección del proyecto"
        descripcion="El bloque oscuro con la imagen de fondo, el carrusel y las dimensiones."
      >
        <div className="space-y-6">
          <div>
            <p className="mb-2 font-display text-xs font-bold text-ink">Fondo de la sección</p>
            <SelectorImagen
              valor={proyecto.fondo}
              onChange={(fondo) => editar("proyecto", "fondo", fondo)}
              etiqueta="el fondo del proyecto"
              respaldo="la imagen del sitio"
              forma="corta"
            />
          </div>

          <FormGrid>
            <Field label="Texto del botón de las tarjetas">
              <Input
                value={proyecto.tarjetaBoton}
                onChange={(e) => editar("proyecto", "tarjetaBoton", e.target.value)}
                placeholder="Explorar más >>"
              />
            </Field>
            <SelectorColor
              etiqueta="Color de ese botón"
              valor={proyecto.botonColor}
              onChange={(botonColor) => editar("proyecto", "botonColor", botonColor)}
            />
          </FormGrid>

          <Field label="Bajada">
            <TextArea
              rows={2}
              value={proyecto.texto}
              onChange={(e) => editar("proyecto", "texto", e.target.value)}
            />
          </Field>

          <div className="rounded-2xl border border-mist bg-paper p-4">
            <p className="mb-4 font-display text-xs font-bold text-ink">
              Las cuatro dimensiones
            </p>
            <Field
              label="Rótulo del recuadro de bloques"
              hint="El que dice «Del diagnóstico a la acción», encima de misiones, retos e iniciativas."
            >
              <Input
                value={proyecto.accionTitulo}
                onChange={(e) => editar("proyecto", "accionTitulo", e.target.value)}
                placeholder="Del diagnóstico a la acción"
              />
            </Field>
            <Field label="Texto">
              <TextArea
                rows={2}
                value={proyecto.dimsTexto}
                onChange={(e) => editar("proyecto", "dimsTexto", e.target.value)}
              />
            </Field>
            <p className="mt-2 text-xs text-muted">
              Las cuatro dimensiones en sí, con su resumen y sus capas, se editan
              en Configuración → Dimensiones.
            </p>
          </div>
        </div>
      </ModuloCard>

      <ModuloCard
        titulo="Municipios"
        descripcion="La franja con los nombres de los doce municipios. Los municipios en sí, en Configuración → Municipios."
      >
        <Field label="Texto">
          <Input
            value={cobertura.texto}
            onChange={(e) => editar("cobertura", "texto", e.target.value)}
            placeholder="La visión del 2050 se construye para el Quindío completo…"
          />
        </Field>
      </ModuloCard>

      <ModuloCard
        titulo="Documentos"
        descripcion="El texto sobre las categorías y el botón de cada una. Las categorías en sí, en Configuración → Categorías."
      >
        <div className="space-y-4">
          <Field label="Texto">
            <TextArea
              rows={2}
              value={documentos.texto}
              onChange={(e) => editar("documentos", "texto", e.target.value)}
            />
          </Field>
          <SelectorColor
            etiqueta="Color del botón «Ver más»"
            hint="El mismo botón se pone en las seis tarjetas de categorías."
            valor={documentos.botonColor}
            onChange={(botonColor) => editar("documentos", "botonColor", botonColor)}
          />
        </div>
      </ModuloCard>

      <ModuloCard
        titulo="Repositorio de información"
        descripcion="El bloque oscuro que invita a entrar al repositorio (/repo). Los documentos en sí, con su importador y sus estadísticas, se administran en Repositorio."
      >
        <div className="space-y-4">
          <Field label="Título">
            <Input
              value={repositorio.titulo}
              onChange={(e) => editar("repositorio", "titulo", e.target.value)}
              placeholder="El inventario documental del territorio"
            />
          </Field>
          <Field
            label="Texto"
            hint="Puedes escribir {total} y el sitio pondrá el número real de documentos del repositorio, así no se queda desactualizado."
          >
            <TextArea
              rows={3}
              value={repositorio.texto}
              onChange={(e) => editar("repositorio", "texto", e.target.value)}
            />
          </Field>
          <FormGrid>
            <Field label="Texto del botón del dashboard">
              <Input
                value={repositorio.dashboardBoton}
                onChange={(e) => editar("repositorio", "dashboardBoton", e.target.value)}
                placeholder="Dashboard del repositorio"
              />
            </Field>
            <SelectorColor
              etiqueta="Color de ese botón"
              valor={repositorio.dashboardColor}
              onChange={(dashboardColor) =>
                editar("repositorio", "dashboardColor", dashboardColor)
              }
            />
          </FormGrid>
          <Field
            label="Texto del botón del catálogo"
            hint="Es el botón secundario de contorno, por eso no lleva color propio."
          >
            <Input
              value={repositorio.catalogoBoton}
              onChange={(e) => editar("repositorio", "catalogoBoton", e.target.value)}
              placeholder="Explorar al catálogo"
            />
          </Field>
        </div>
      </ModuloCard>

      <ModuloCard
        titulo="Noticias"
        descripcion="El texto y los dos botones de la tira. Las noticias en sí, en Noticias."
      >
        <div className="space-y-4">
          <FormGrid>
            <Field label="Texto del botón «Ver todas»">
              <Input
                value={noticias.botonTexto}
                onChange={(e) => editar("noticias", "botonTexto", e.target.value)}
                placeholder="Ver todas"
              />
            </Field>
            <SelectorColor
              etiqueta="Color de «Ver todas»"
              valor={noticias.botonColor}
              onChange={(botonColor) => editar("noticias", "botonColor", botonColor)}
            />
          </FormGrid>
          <SelectorColor
            etiqueta="Color del «Ver más» de cada tarjeta"
            hint="Va aparte del de «Ver todas» porque este va encima de la foto de la noticia, y el color que se lee bien sobre el papel no siempre se lee bien sobre una imagen."
            valor={noticias.tarjetaBotonColor}
            onChange={(tarjetaBotonColor) =>
              editar("noticias", "tarjetaBotonColor", tarjetaBotonColor)
            }
          />
          <Field label="Texto">
            <TextArea
              rows={2}
              value={noticias.texto}
              onChange={(e) => editar("noticias", "texto", e.target.value)}
            />
          </Field>
        </div>
      </ModuloCard>

      <ModuloCard
        titulo="Contactos"
        descripcion="El texto del bloque, el rótulo del formulario, el correo, el teléfono y la dirección. Los últimos son del sitio entero: en cuanto cambian, el valor nuevo sale en el pie de página, en la página de contacto y en el aviso de privacidad."
      >
        <div className="space-y-4">
          <Field label="Correo">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => commit({ email: e.target.value })}
              placeholder="contacto@horizontequindio.com"
            />
          </Field>
          <CampoTelefono
            valor={form.telefono}
            hrefActual={form.telefonoHref}
            onChange={(telefono, telefonoHref) => commit({ telefono, telefonoHref })}
          />
          <FormGrid>
            <Field label="Dirección">
              <Input
                value={form.direccion}
                onChange={(e) => commit({ direccion: e.target.value })}
                placeholder="Calle 24 # 12 - 34"
              />
            </Field>
            <Field label="Ciudad">
              <Input
                value={form.ciudad}
                onChange={(e) => commit({ ciudad: e.target.value })}
                placeholder="Armenia, Quindío, Colombia"
              />
            </Field>
          </FormGrid>

          <Field label="Rótulo del formulario">
            <Input
              value={contacto.formTitulo}
              onChange={(e) => editar("contacto", "formTitulo", e.target.value)}
              placeholder="Escríbenos para más información"
            />
          </Field>
          <Field label="Texto">
            <TextArea
              rows={2}
              value={contacto.texto}
              onChange={(e) => editar("contacto", "texto", e.target.value)}
            />
          </Field>

          <FormGrid>
            <SelectorColor
              etiqueta="Color del botón del teléfono"
              valor={contacto.botonColor}
              onChange={(botonColor) => editar("contacto", "botonColor", botonColor)}
            />
            <SelectorColor
              etiqueta="Color del «Enviar» del formulario"
              valor={contacto.enviarColor}
              onChange={(enviarColor) => editar("contacto", "enviarColor", enviarColor)}
            />
          </FormGrid>

          <p className="text-xs text-muted">
            El correo, el teléfono, la dirección y la ciudad son columnas sueltas
            de la configuración, no parte de este bloque: por eso el cambio sale
            en todo el sitio sin tocar nada más. Aparecen aquí porque es donde se
            ven en la portada, y son los datos que también están en el módulo
            Contáctanos —los dos escriben en el mismo sitio, así que no pueden
            quedar distintos—. El teléfono se agrupa solo mientras se escribe, y
            el enlace por el que se llama sale de él solo, sin campos a medio
            llenar.
          </p>
        </div>
      </ModuloCard>

      <ModuloCard
        titulo="Cifras de la portada"
        descripcion="Las cuatro tarjetas con números (11, 2050, 3 y 60). Son datos y no rótulos, así que viven en su propia pantalla: ahí se cambia el número, el título y el enunciado de cada una, y el cambio se ve enseguida en la portada."
      >
        <LinkBtn to="/configuracion/estadisticas" variant="outline" size="sm">
          <ListChecks className="size-4" /> Abrir Configuración → Estadísticas
        </LinkBtn>
      </ModuloCard>

      <p className="text-xs text-muted">
        Lo que dejes vacío se sustituye por el texto que trae el sitio. Es a
        propósito: una sección con el texto en blanco se ve rota.
      </p>
    </div>
  );
}
