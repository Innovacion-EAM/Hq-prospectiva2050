import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { PageHero } from "@/components/site-shell";
import { useSite } from "@/data/site-context";

/**
 * Privacidad: las piezas que la ley colombiana pide cuando un sitio recoge datos
 * personales, con el texto de cada una separado para que se lea como lo que es:
 *
 *   1. **Aviso de privacidad (Ley 1581 de 2012)** — el texto breve que debe
 *      acompañar la recogida: quién es el responsable, qué se pide, para qué,
 *      con qué base legal y cuánto se guarda. Es al aviso al que apunta el
 *      enlace de la casilla de autorización de los formularios; sin ese enlace
 *      la autorización no es "informada".
 *   2. **Política de tratamiento de datos** — el documento de fondo: quiénes
 *      pueden ver los datos, con quiénes se comparten, cómo se protegen y cómo
 *      se actualiza esta política.
 *   3. **Cookies y terceros** — qué servicios externos carga el sitio (Google
 *      Fonts y Google Maps) y qué implican para quien navega.
 *   4. **Derechos del titular (ARCO)** — qué puede pedir quien escribe y por
 *      qué canal: acceso, rectificación, cancelación y oposición, con el plazo
 *      de respuesta que fija la ley.
 *
 * Los datos que solo conoce la organización (responsable, NIT, canal para los
 * derechos, plazo de conservación y quiénes acceden) **no** están escritos aquí:
 * se editan en **Ajustes → Legal** y llegan por `/api/site`. Mientras sigan sin
 * llenarse, la página muestra un marcador visible en cada hueco para que nadie
 * dé por completo el aviso sin estarlo.
 */
export function PrivacidadPage() {
  const { SITE, LEGAL } = useSite();

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
              liderado por entidades del departamento del Quindío, con el
              acompañamiento técnico de CEPAL/ILPES. El responsable del
              tratamiento de los datos personales que se recogen en este sitio
              es:
            </p>
            <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5">
              <li>
                <strong>Responsable:</strong>{" "}
                <DatoLegal valor={LEGAL.responsable} pendiente="nombre o razón social" />
              </li>
              <li>
                <strong>NIT:</strong>{" "}
                <DatoLegal valor={LEGAL.nit} pendiente="NIT del responsable" />
              </li>
              <li>
                <strong>Domicilio:</strong>{" "}
                <DatoLegal
                  valor={[LEGAL.direccion, LEGAL.ciudad].filter(Boolean).join(", ")}
                  pendiente="dirección y ciudad"
                />
              </li>
            </ul>

            <h3 className="mt-4 font-display text-sm font-semibold text-ink">
              Qué datos recogemos y para qué
            </h3>
            <p className="mt-2">
              Este sitio recoge datos personales solo en cuatro formularios, y
              cada uno pide lo mínimo para cumplir su finalidad:
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone text-left">
                    <th className="py-2 pr-3 font-display font-semibold text-ink">Formulario</th>
                    <th className="py-2 pr-3 font-display font-semibold text-ink">Datos que pide</th>
                    <th className="py-2 font-display font-semibold text-ink">Para qué</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-stone/60 align-top">
                    <td className="py-2 pr-3 font-semibold text-ink">Contacto</td>
                    <td className="py-2 pr-3">Nombre, correo, asunto y mensaje.</td>
                    <td className="py-2">Responder la solicitud y hacer seguimiento.</td>
                  </tr>
                  <tr className="border-b border-stone/60 align-top">
                    <td className="py-2 pr-3 font-semibold text-ink">Sugerencias</td>
                    <td className="py-2 pr-3">
                      Pregunta o recomendación, y <strong>correo (opcional)</strong>.
                    </td>
                    <td className="py-2">
                      Alimentar el canal abierto del ejercicio. El correo solo se
                      usa si la persona pide que le respondan.
                    </td>
                  </tr>
                  <tr className="border-b border-stone/60 align-top">
                    <td className="py-2 pr-3 font-semibold text-ink">Inscripción a talleres</td>
                    <td className="py-2 pr-3">Nombre, correo, municipio, perfil y taller.</td>
                    <td className="py-2">Registrar y gestionar la participación en los talleres.</td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-2 pr-3 font-semibold text-ink">Boletín</td>
                    <td className="py-2 pr-3">Correo.</td>
                    <td className="py-2">Enviar el canal de noticias del ejercicio.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              No se piden datos sensibles ni de menores de edad. En los
              formularios de <strong>Sugerencias</strong> y <strong>Contacto</strong>{" "}
              el texto libre es opcional y su envío no depende de él.
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
              Finalidad del tratamiento
            </h3>
            <p className="mt-2">
              Los datos se usan <strong>únicamente</strong> para las finalidades
              descritas en la tabla anterior: responder mensajes, gestionar la
              participación en talleres y enviar el boletín. No se usan para
              publicidad de terceros ni se venden ni se ceden con fines distintos
              a los aquí informados.
            </p>

            <h3 className="mt-4 font-display text-sm font-semibold text-ink">
              Quién más puede acceder
            </h3>
            <p className="mt-2">
              <DatoLegal
                valor={LEGAL.quienesAcceden}
                pendiente="quiénes acceden a los datos (puestos o entidades aliadas)"
              />
            </p>

            <h3 className="mt-4 font-display text-sm font-semibold text-ink">
              Tiempo de conservación
            </h3>
            <p className="mt-2">
              Los mensajes e inscripciones se conservan durante{" "}
              <DatoLegal
                valor={LEGAL.plazoConservacion}
                pendiente="plazo de conservación de los mensajes e inscripciones"
              />{" "}
              y después se eliminan. Los correos del boletín se conservan mientras
              la suscripción siga vigente; quien la cancele puede pedir el borrado
              de su correo.
            </p>
            <p className="mt-2">
              Los datos agregados —por ejemplo, cuántas personas de cada municipio
              participaron en un taller— sí se conservan: no permiten identificar
              a nadie y son el resultado público del ejercicio.
            </p>

            <h3 className="mt-4 font-display text-sm font-semibold text-ink">
              Seguridad
            </h3>
            <p className="mt-2">
              Este sitio se sirve por HTTPS y los datos de los formularios viajan
              cifrados. El acceso interno a los datos está restringido al personal
              autorizado del ejercicio.
            </p>

            <h3 className="mt-4 font-display text-sm font-semibold text-ink">
              Vigencia y cambios
            </h3>
            <p className="mt-2">
              Esta política rige desde su publicación. Cualquier cambio sustancial
              se avisa en el sitio antes de aplicarlo. Última actualización:{" "}
              <strong>{LEGAL.actualizado.trim() || "por definir"}</strong>.
            </p>
          </section>

          {/* ---------------------------------------------------------------
              3. Cookies y terceros
          ---------------------------------------------------------------- */}
          <section>
            <h2 className="font-display text-lg font-bold text-ink">
              3. Cookies y terceros
            </h2>
            <p className="mt-2">
              Este sitio <strong>no instala cookies propias</strong> ni usa
              herramientas de analítica, publicidad o seguimiento. Sin embargo,
              carga dos servicios de Google que pueden recibir la dirección IP de
              quien navega:
            </p>
            <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5">
              <li>
                <strong>Google Fonts:</strong> las tipografías del sitio se
                cargan desde los servidores de Google en todas las páginas.
              </li>
              <li>
                <strong>Google Maps:</strong> el mapa de la página{" "}
                <Link to="/contactos" className="underline">
                  Contáctanos
                </Link>{" "}
                es un mapa incrustado de Google. Se carga solo al abrir esa página
                y aparece con un aviso junto al mapa.
              </li>
            </ul>
            <p className="mt-3">
              Estos servicios se rigen por la política de privacidad de Google,
              disponible en{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                policies.google.com/privacy
              </a>
              . Si prefieres no cargarlos, puedes bloquear las cookies de terceros
              en tu navegador; el contenido del sitio seguirá siendo accesible.
            </p>
          </section>

          {/* ---------------------------------------------------------------
              4. Derechos del titular (ARCO)
          ---------------------------------------------------------------- */}
          <section>
            <h2 className="font-display text-lg font-bold text-ink">
              4. Derechos del titular (ARCO)
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
              <DatoLegal
                valor={LEGAL.correoArco}
                pendiente="correo o canal para ejercer los derechos"
              />{" "}
              y se responde en un plazo máximo de diez días hábiles, prorrogable
              por cinco más cuando la respuesta lo exija, como establece el
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

        {/* La nota va al final y discreta: lo que falta son datos que solo tiene
            la organización, y se completan desde Ajustes → Legal del panel. */}
        <p className="mt-10 rounded-2xl border border-stone bg-fog p-4 text-xs leading-relaxed text-muted">
          Los datos marcados como <strong>PENDIENTE</strong> de esta página los
          completa la organización responsable en el panel de administración
          (Ajustes → Legal): el nombre o razón social, el NIT, el canal para
          ejercer los derechos, el plazo de conservación y quiénes acceden a los
          datos. Mientras sigan sin llenarse, la página se publica pero{" "}
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

        <div className="mt-12 flex flex-wrap gap-3 border-t border-stone pt-6">
          <Link
            to="/terminos"
            className="inline-flex items-center gap-2 rounded-pill border border-mist px-5 py-2.5 font-display text-sm font-bold text-ink no-underline"
          >
            Términos y condiciones
          </Link>
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

/**
 * Un dato legal que la organización completa desde Ajustes → Legal.
 *
 * Si está lleno, se muestra en negrita. Si no, se muestra un marcador visible
 * —y no un texto inventado—: un aviso incompleto es peor que uno que se ve a
 * medias, porque nadie se da cuenta de que falta.
 */
function DatoLegal({ valor, pendiente }: { valor: string; pendiente: string }): ReactNode {
  if (valor.trim()) return <strong>{valor}</strong>;
  return (
    <strong className="rounded bg-lime/40 px-1 font-semibold text-ink">
      [PENDIENTE: {pendiente}]
    </strong>
  );
}