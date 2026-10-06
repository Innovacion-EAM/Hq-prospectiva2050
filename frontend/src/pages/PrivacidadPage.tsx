import { Link } from "react-router-dom";
import { PageHero } from "@/components/site-shell";
import { useSite } from "@/data/site-context";

/**
 * Privacidad: una sola página con las tres piezas que la ley colombiana pide
 * cuando un sitio recoge datos personales, y con el texto de cada una separado
 * para que se lea como lo que es:
 *
 *   1. **Aviso de privacidad (Ley 1581 de 2012)** — el texto breve que debe
 *      acompañar la recogida: quién es el responsable, qué se pide, para qué,
 *      con qué base legal y cuánto se guarda. Es al aviso al que apunta el
 *      enlace de la casilla de autorización de los formularios; sin ese enlace
 *      la autorización no es "informada".
 *   2. **Política de tratamiento de datos** — el documento de fondo: quiénes
 *      pueden ver los datos, con quiénes se comparten, cómo se protegen y cómo
 *      se actualiza esta política.
 *   3. **Derechos del titular (ARCO)** — qué puede pedir quien escribe y por
 *      qué canal: acceso, rectificación, cancelación y oposición, con el plazo
 *      de respuesta que fija la ley.
 *
 * Los valores que solo conoce la organización van **entre corchetes**: el
 * nombre del responsable, el canal para ejercer los derechos, el plazo de
 * conservación y quiénes acceden a los datos. No se inventan aquí porque
 * ponerlos a mano dejaría el aviso con datos falsos, que es peor que no
 * tenerlo. La nota discreta del final lo recuerda.
 */
export function PrivacidadPage() {
  const { SITE } = useSite();

  return (
    <>
      <PageHero
        kicker="Privacidad"
        title="Tratamiento de datos personales"
        intro="El aviso, la política y tus derechos como titular: qué datos recogemos, para qué, cuánto tiempo los guardamos y cómo pedir su eliminación."
      />

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <article className="flex flex-col gap-10 text-sm leading-relaxed text-body">
          {/* ---------------------------------------------------------------
              1. Aviso de privacidad
          ---------------------------------------------------------------- */}
          <section>
            <h2 className="font-display text-lg font-bold text-ink">
              1. Aviso de privacidad (Ley 1581 de 2012)
            </h2>

            <h3 className="mt-4 font-display text-sm font-semibold text-ink">
              Quién es el responsable
            </h3>
            <p className="mt-2">
              Horizonte Quindío 2050 es un ejercicio de prospectiva territorial
              adelantado por entidades del departamento del Quindío y acompañado
              técnicamente por la Comisión Económica para América Latina y el
              Caribe (CEPAL) a través del ILPES.
            </p>
            <p className="mt-2">
              El responsable del tratamiento de los datos que se recogen en este
              sitio es{" "}
              <strong>
                [NOMBRE O RAZÓN SOCIAL DEL RESPONSABLE — NIT]
              </strong>
              , con domicilio en{" "}
              <strong>[CIUDAD Y DIRECCIÓN DEL RESPONSABLE]</strong>.
            </p>

            <h3 className="mt-4 font-display text-sm font-semibold text-ink">
              Qué datos recogemos y con qué finalidad
            </h3>
            <p className="mt-2">
              El sitio tiene cuatro formularios, y cada uno pide nada más lo que
              necesita para cumplir lo que ofrece:
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
                    <td className="py-2 align-top">Responder la consulta y darle seguimiento.</td>
                  </tr>
                  <tr>
                    <th scope="row" className="py-2 pr-4 align-top font-medium text-ink">
                      Sugerencias
                    </th>
                    <td className="py-2 pr-4 align-top">Texto de la pregunta o recomendación</td>
                    <td className="py-2 align-top">
                      Alimentar el canal abierto del ejercicio. No se piden nombre ni
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
              afiliación sindical, datos de menores— ni se usan los datos para
              perfilado ni para decisiones automatizadas. No hay cookies de
              seguimiento ni herramientas de analítica en este sitio.
            </p>

            <h3 className="mt-4 font-display text-sm font-semibold text-ink">
              Base legal y autorización
            </h3>
            <p className="mt-2">
              La base legal es el <strong>consentimiento expreso del titular</strong>{" "}
              (artículo 7 de la Ley 1581 de 2012, literales b y h): al marcar la
              casilla de cada formulario. La autorización es opcional, pero sin
              ella el formulario no se puede enviar, porque no hay ninguna otra
              forma de tratar esos datos.
            </p>
            <p className="mt-2">
              El consentimiento no es condición para acceder al sitio: se puede
              leer todo el contenido —las páginas del proyecto, los documentos y
              las noticias— sin marcar ninguna casilla.
            </p>

            <h3 className="mt-4 font-display text-sm font-semibold text-ink">
              Cuánto tiempo guardamos los datos
            </h3>
            <p className="mt-2">
              Los mensajes y las inscripciones se conservan durante{" "}
              <strong>[PLAZO DE CONSERVACIÓN]</strong> y después se eliminan. La
              lista del boletín se conserva mientras la suscripción esté vigente;
              cancelar la suscripción implica el borrado del correo.
            </p>
            <p className="mt-2">
              Los datos agregados —por ejemplo, cuántas personas de cada municipio
              participaron en un taller— sí se conservan: no permiten identificar
              a nadie y son el resultado público del ejercicio.
            </p>
          </section>

          {/* ---------------------------------------------------------------
              2. Política de tratamiento de datos
          ---------------------------------------------------------------- */}
          <section>
            <h2 className="font-display text-lg font-bold text-ink">
              2. Política de tratamiento de datos
            </h2>

            <h3 className="mt-4 font-display text-sm font-semibold text-ink">
              Quiénes más acceden a los datos
            </h3>
            <p className="mt-2">
              El acceso está limitado a{" "}
              <strong>
                [QUIÉNES ACCEDEN A LOS DATOS — PUESTOS O ENTIDADES, Y SU ACUERDO
                DE CONFIDENCIALIDAD]
              </strong>
              . Cada persona o entidad accede únicamente a la parte del ejercicio
              que le corresponde.
            </p>
            <p className="mt-2">
              No se contrata a terceros para el tratamiento de los datos ni se
              transfieren datos fuera de Colombia. Si eso cambia, esta política se
              actualiza antes de hacerlo.
            </p>

            <h3 className="mt-4 font-display text-sm font-semibold text-ink">
              Seguridad
            </h3>
            <p className="mt-2">
              El sitio se sirve por HTTPS y los datos de los formularios viajan
              cifrados. El acceso interno al panel de administración es con
              usuario y contraseña, y los mensajes que llegan por los
              formularios no son de acceso público.
            </p>

            <h3 className="mt-4 font-display text-sm font-semibold text-ink">
              Cambios en esta política
            </h3>
            <p className="mt-2">
              Esta política se actualiza cuando cambia la finalidad del
              tratamiento o el responsable. La fecha de la última actualización
              aparece al final de la página, y cualquier cambio sustancial se
              avisa en el sitio antes de aplicarlo.
            </p>
          </section>

          {/* ---------------------------------------------------------------
              3. Derechos del titular (ARCO)
          ---------------------------------------------------------------- */}
          <section>
            <h2 className="font-display text-lg font-bold text-ink">
              3. Derechos del titular (ARCO)
            </h2>
            <p className="mt-2">
              Como titular de los datos puede pedir, en cualquier momento y de
              forma gratuita, los derechos ARCO que reconoce la Ley 1581:
            </p>
            <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5">
              <li>
                <strong>Acceso:</strong> conocer qué datos suyos se tienen y
                para qué se usan.
              </li>
              <li>
                <strong>Rectificación:</strong> actualizar o corregir los datos
                que estén equivocados o incompletos.
              </li>
              <li>
                <strong>Cancelación:</strong> pedir la eliminación de los datos
                cuando ya no se necesiten para la finalidad con la que se pidieron.
              </li>
              <li>
                <strong>Oposición:</strong> revocar la autorización y pedir que
                no se sigan tratando los datos.
              </li>
            </ul>
            <p className="mt-3">
              Revocar la autorización detiene el tratamiento futuro, pero no
              afecta a lo que ya se hizo con esos datos —que, para quien nos
              escribió, consiste únicamente en responder el mensaje—.
            </p>

            <h3 className="mt-4 font-display text-sm font-semibold text-ink">
              Cómo ejercer los derechos
            </h3>
            <p className="mt-2">
              La solicitud se presenta por{" "}
              <strong>[CORREO O CANAL PARA EJERCER LOS DERECHOS]</strong> y se
              responde en un plazo máximo de diez días hábiles, prorrogable por
              cinco más cuando la respuesta lo exija, como establece el
              artículo 14 del Decreto 1377 de 2013.
            </p>
            <p className="mt-2">
              Si la respuesta no convence, puede reclamar ante la autoridad de
              protección de datos personales (Superintendencia de Industria y
              Comercio), que es la instancia que vigila el cumplimiento de la
              Ley 1581.
            </p>
          </section>
        </article>

        {/* La nota va al final y discreta, no en un recuadro amarillo a la
            vista: lo que falta son datos que solo tiene la organización, y el
            recordatorio alcanza con que esté en la página cuando alguien la
            lea antes de publicar. */}
        <p className="mt-10 rounded-2xl border border-stone bg-fog p-4 text-xs leading-relaxed text-muted">
          Los datos entre corchetes de esta página los completa la organización
          responsable antes de publicar: el nombre o razón social, el canal para
          ejercer los derechos, el plazo de conservación y quiénes acceden a los
          datos. Mientras estén entre corchetes, la página se publica pero{" "}
          <strong>no cumple la ley</strong>.
        </p>

        <div className="mt-6 text-xs text-muted">
          Datos de contacto publicados en el sitio:{" "}
          <a href={`mailto:${SITE.email}`} className="underline">
            {SITE.email}
          </a>
          {" · "}
          {SITE.phone}
        </div>

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