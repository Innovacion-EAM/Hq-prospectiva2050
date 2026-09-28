import { Link } from "react-router-dom";
import { PageHero } from "@/components/site-shell";
import { useSite } from "@/data/site-context";

/**
 * Aviso de Privacidad (Ley 1581 de 2012, Ley 1582 de 2012 y Decreto 1377 de 2013).
 *
 * Existe porque los cuatro formularios del sitio piden nombre y correo, y pedir
 * un dato personal sin decir para qué y con qué base legal es exactamente lo que
 * la ley prohíbe. La página no es adorno: es a lo que apunta el enlace de la
 * casilla de autorización, y sin ese enlace la autorización no es "informada".
 *
 * Los dos `[PENDIENTE: …]` son deliberados y hay que resolverlos antes de
 * publicar el sitio. No se inventaron a propósito: el nombre del responsable y el
 * canal para ejercer los derechos son datos que solo tiene la organización, y
 * ponerlos a mano dejaría el aviso con datos falsos, que es peor que no tenerlo.
 */
export function PrivacidadPage() {
  const { SITE } = useSite();

  return (
    <>
      <PageHero
        kicker="Aviso de privacidad"
        title="Tratamiento de datos personales"
        intro="Qué datos recogemos, para qué los usamos, cuánto tiempo los guardamos y cómo pedir su eliminación."
      />

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        {/* Aviso a la vista, no escondido en el pie: si hay algo que completar,
            se ve desde el principio. */}
        <div className="mb-10 rounded-2xl border border-[#d9b64a] bg-[#fff8e2] p-5">
          <p className="font-display text-sm font-bold text-ink">Antes de publicar: falta completar</p>
          <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-xs leading-relaxed text-body">
            <li>
              <strong>[PENDIENTE: nombre o razón social del responsable del
              tratamiento]</strong> y su identificación completa.
            </li>
            <li>
              <strong>[PENDIENTE: canal para ejercer los derechos]</strong> —correo,
              formulario o sede— donde el titular puede pedir el acceso, la
              rectificación, la eliminación o la revocación de la autorización.
            </li>
          </ul>
          <p className="mt-2 text-xs leading-relaxed text-body">
            Los dos datos son de la organización y no se pueden deducir. Mientras no
            estén, la página se publica pero <strong>no cumple la ley</strong>: el
            responsable es identificable —Horizonte Quindío 2050— pero no hay a quién
            dirigir una petición.
          </p>
        </div>

        <article className="flex flex-col gap-8 text-sm leading-relaxed text-body">
          <section>
            <h2 className="font-display text-lg font-bold text-ink">1. Quién es el responsable</h2>
            <p className="mt-2">
              Horizonte Quindío 2050 es un ejercicio de prospectiva territorial
              adelantado por catorce entidades del departamento del Quindío y
              acompañado técnicamente por la Comisión Económica para América Latina y
              el Caribe (CEPAL) a través del ILPES. La coordinación general del
              ejercicio es la Gobernación del Quindío.
            </p>
            <p className="mt-2">
              <strong>[PENDIENTE: razón social o nombre del responsable del
              tratamiento, NIT, domicilio y datos de contacto del responsable.]</strong>
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-ink">
              2. Qué datos recogemos y con qué finalidad
            </h2>
            <p className="mt-2">
              El sitio tiene cuatro formularios. Todos piden lo mismo y para lo mismo:
              poder responder a quien escribe.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-stone">
                    <th scope="col" className="py-2 pr-4 font-display font-semibold text-ink">
                      Formulario
                    </th>
                    <th scope="col" className="py-2 pr-4 font-display font-semibold text-ink">
                      Datos pedidos
                    </th>
                    <th scope="col" className="py-2 font-display font-semibold text-ink">
                      Para qué se usan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone">
                  <tr>
                    <th scope="row" className="py-2 pr-4 align-top font-medium text-ink">
                      Contacto
                    </th>
                    <td className="py-2 pr-4 align-top">
                      Nombre, correo, asunto, mensaje
                    </td>
                    <td className="py-2 align-top">Responder la consulta y dar seguimiento.</td>
                  </tr>
                  <tr>
                    <th scope="row" className="py-2 pr-4 align-top font-medium text-ink">
                      Sugerencias
                    </th>
                    <td className="py-2 pr-4 align-top">Texto de la pregunta o recomendación</td>
                    <td className="py-2 align-top">
                      Alimentar el canal abierto y el ejercicio. No se piden nombre ni
                      correo.
                    </td>
                  </tr>
                  <tr>
                    <th scope="row" className="py-2 pr-4 align-top font-medium text-ink">
                      Inscripción a talleres
                    </th>
                    <td className="py-2 pr-4 align-top">
                      Nombre, correo, taller, municipio, perfil
                    </td>
                    <td className="py-2 align-top">
                      Registrar la asistencia y leer quién participa en cada territorio.
                    </td>
                  </tr>
                  <tr>
                    <th scope="row" className="py-2 pr-4 align-top font-medium text-ink">
                      Boletín
                    </th>
                    <td className="py-2 pr-4 align-top">Correo</td>
                    <td className="py-2 align-top">Enviar las novedades del ejercicio.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              No se piden datos sensibles —salud, orientación sexual, religión,
              afiliación sindical, datos de menores— ni se usan para perfilado ni
              decisiones automatizadas. No hay cookies de seguimiento ni herramientas
              de analítica en este sitio.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-ink">
              3. Base legal y autorización
            </h2>
            <p className="mt-2">
              La base legal es el <strong>consentimiento expreso del titular</strong>{" "}
              (artículo 7 de la Ley 1581 de 2012, literales b y h): al marcar la
              casilla de cada formulario. La autorización es opcional, pero sin ella el
              formulario no se puede enviar: no hay ninguna otra forma de tratar esos
              datos.
            </p>
            <p className="mt-2">
              La autorización puede revocarse en cualquier momento, y la revocación
              es tan sencilla como concedernos un correo. Revocar el consentimiento
              detiene el tratamiento futuro, pero no afecta a lo que ya se hizo con
              esos datos —que, para los que nos escribió, consiste únicamente en
              responder el mensaje.
            </p>
            <p className="mt-2">
              El consentimiento no es una condición para acceder al sitio: se puede
              leer todo el contenido, las páginas del proyecto, los documentos y las
              noticias sin marcar ninguna casilla.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-ink">
              4. Cuánto tiempo guardamos los datos
            </h2>
            <p className="mt-2">
              Los mensajes y las inscripciones se conservan{" "}
              <strong>[PENDIENTE: plazo —por ejemplo, hasta dos años contados desde la
              última interacción]</strong> y después se eliminan. La lista de
              suscriptores al boletín se conserva mientras la suscripción esté
              vigente; cancelar el boletín implica el borrado del correo.
            </p>
            <p className="mt-2">
              Los datos agregados —por ejemplo, cuántas personas de cada municipio
              participaron en un taller— sí se conservan, porque no permiten identificar
              a nadie y son el resultado público del ejercicio.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-ink">
              5. Quiénes más acceden a los datos
            </h2>
            <p className="mt-2">
              El acceso está limitado al equipo de coordinación del ejercicio y a las
              entidades que lo adelantan, cada una únicamente para la parte del
              ejercicio que le corresponde.{" "}
              <strong>
                [PENDIENTE: confirmar el listado nominal y dejar constancia del
                acuerdo de confidencialidad, como exige el artículo 19.]
              </strong>
            </p>
            <p className="mt-2">
              No se contrata a terceros para el tratamiento de datos ni se transfieren
              datos fuera de Colombia. Si eso cambia, este aviso se actualiza antes de
              hacerlo.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-ink">
              6. Derechos del titular
            </h2>
            <p className="mt-2">
              Puede pedir, en cualquier momento y de forma gratuita: conocer qué datos
              se tienen sobre usted, corregirlos cuando estén equivocados, pedir su
              eliminación, revocar la autorización y revocar el consentimiento para
              fines distintos, y pedir una copia de los datos en un formato
              legible.
            </p>
            <p className="mt-2">
              <strong>[PENDIENTE: indicar el canal —correo, formulario o sede— y el
              plazo de respuesta, que la ley fija en diez días.]</strong>
            </p>
            <p className="mt-2">
              Si la respuesta no convence, puede reclamar ante la autoridad de protección de datos personales.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-ink">
              7. Seguridad y cambios en este aviso
            </h2>
            <p className="mt-2">
              El sitio se sirve por HTTPS y los datos de los formularios viajan
              cifrados. El acceso interno al panel de administración es con usuario y
              contraseña, y el acceso al formulario de contacto no es público.
            </p>
            <p className="mt-2">
              Este aviso se actualiza cuando cambia la finalidad o el responsable. La
              fecha de la última actualización aparece al final de la página, y
              cualquier cambio sustancial se avisa en el sitio.
            </p>
            <p className="mt-2 text-xs text-muted">
              Datos de contacto publicados en el sitio:{" "}
              <a href={`mailto:${SITE.email}`} className="text-lime-ink underline">
                {SITE.email}
              </a>
              {" · "}
              {SITE.phone}
            </p>
          </section>
        </article>

        <div className="mt-12 border-t border-stone pt-6">
          <Link
            to="/participa"
            className="inline-flex items-center gap-2 rounded-pill bg-ink px-5 py-2.5 font-display text-sm font-bold text-paper no-underline"
          >
            Volver a Participa
          </Link>
        </div>
      </section>
    </>
  );
}
