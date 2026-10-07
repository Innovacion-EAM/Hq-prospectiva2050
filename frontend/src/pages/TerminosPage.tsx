import { Link } from "react-router-dom";
import { PageHero } from "@/components/site-shell";
import { useSite } from "@/data/site-context";

/**
 * Términos y condiciones de uso.
 *
 * No es una página que exija la Ley 1581 (esa es la de privacidad), pero sí es
 * la que cubre dos cosas que el sitio hace y conviene dejar por escrito:
 *
 *  - **Qué se puede hacer con el contenido.** El repositorio reúne documentos
 *    de muchas entidades distintas; aquí se dice que la mayoría no son de este
 *    proyecto y que el uso es informativo y de consulta.
 *  - **Los enlaces externos.** El repositorio enlaza a fuentes ajenas (Drive de
 *    cada entidad, sitios oficiales). El sitio no controla ni responde por lo
 *    que haya al otro lado de esos enlaces.
 */
export function TerminosPage() {
  const { LEGAL } = useSite();

  return (
    <>
      <PageHero
        kicker="Legal"
        title="Términos y condiciones de uso"
        intro="Las condiciones para usar este sitio y su repositorio, y una nota sobre los derechos de los documentos y los enlaces externos."
      />

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <article className="flex flex-col gap-10 text-sm leading-relaxed text-body">
          <section>
            <h2 className="font-display text-lg font-bold text-ink">1. Aceptación</h2>
            <p className="mt-2">
              El acceso y uso de este sitio implican la aceptación de estos
              términos. Si no está de acuerdo con ellos, le pedimos no utilizarlo.
            </p>
            <p className="mt-2">
              El sitio es una publicación informativa del ejercicio de prospectiva
              territorial Horizonte Quindío 2050. El responsable es{" "}
              <DatoLegal valor={LEGAL.responsable} pendiente="nombre o razón social" />
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-ink">
              2. Uso del contenido
            </h2>
            <p className="mt-2">
              Los textos, el diseño y los materiales de socialización producidos
              por el proyecto pueden consultarse libremente con fines
              informativos, educativos y no comerciales, siempre citando la fuente.
              Para usos comerciales o masivos se requiere autorización previa.
            </p>
            <p className="mt-2">
              El contenido de los talleres, las noticias y las fichas publicadas
              refleja el estado del proceso en la fecha de su publicación y puede
              actualizarse sin aviso previo.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-ink">
              3. Repositorio de documentos y propiedad intelectual
            </h2>
            <p className="mt-2">
              El <Link to="/repositorio" className="underline">repositorio</Link>{" "}
              reúne y enlaza documentos de planeación, informes, estudios y piezas
              de socialización producidos por múltiples entidades del departamento
              y del orden nacional. <strong>La mayoría de esos documentos no son
              producidos por el proyecto</strong>: los derechos morales y
              patrimoniales pertenecen a sus autores originales.
            </p>
            <p className="mt-2">
              El repositorio los enlaza a la fuente original o a una copia
              publicada por su autor, con el único fin de facilitar su consulta.
              La consulta no transfiere ningún derecho sobre esos documentos ni
              autoriza su reproducción más allá de lo que la ley permita.
            </p>
            <p className="mt-2">
              Si usted es titular de un documento y considera que un enlace o un
              uso no corresponde, escríbanos y lo revisaremos a la mayor brevedad.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-ink">
              4. Enlaces a otros sitios
            </h2>
            <p className="mt-2">
              Este sitio enlaza a fuentes externas, como los repositorios de las
              entidades aliadas o servicios de mapas. No controlamos su contenido
              ni sus políticas, y no respondemos por ellos. Cada enlace externo se
              rige por sus propios términos.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-ink">
              5. Limitación de responsabilidad
            </h2>
            <p className="mt-2">
              Procuramos que la información publicada sea veraz y esté actualizada,
              pero el sitio se ofrece "tal cual". No garantizamos la ausencia de
              interrupciones o errores, ni la exactitud de datos de terceros a los
              que se remite. El uso de la información es responsabilidad de quien
              la consulta.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-ink">
              6. Datos personales
            </h2>
            <p className="mt-2">
              El tratamiento de datos personales que recoge el sitio —formularios
              de contacto, sugerencias, inscripción a talleres y boletín— se rige
              por la{" "}
              <Link to="/privacidad" className="font-semibold text-ink underline">
                Política de privacidad y tratamiento de datos
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-ink">
              7. Cambios en los términos
            </h2>
            <p className="mt-2">
              Estos términos pueden actualizarse cuando cambie el funcionamiento
              del sitio. La fecha de la última actualización aparece más abajo, y
              cualquier cambio sustancial se avisa antes de aplicarlo.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-ink">8. Contacto</h2>
            <p className="mt-2">
              Para dudas sobre estos términos, escriba a{" "}
              <DatoLegal
                valor={LEGAL.correoArco}
                pendiente="correo de contacto"
              />
              .
            </p>
          </section>
        </article>

        <p className="mt-10 text-xs text-muted">
          Última actualización:{" "}
          <strong>{LEGAL.actualizado.trim() || "[PENDIENTE: fecha de actualización]"}</strong>
        </p>

        <div className="mt-12 flex flex-wrap gap-3 border-t border-stone pt-6">
          <Link
            to="/privacidad"
            className="inline-flex items-center gap-2 rounded-pill border border-mist px-5 py-2.5 font-display text-sm font-bold text-ink no-underline"
          >
            Política de privacidad
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-pill bg-ink px-5 py-2.5 font-display text-sm font-bold text-paper no-underline"
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    </>
  );
}

/** Un dato legal editable en Ajustes → Legal, o un marcador visible si falta. */
function DatoLegal({ valor, pendiente }: { valor: string; pendiente: string }) {
  if (valor.trim()) return <strong>{valor}</strong>;
  return (
    <strong className="rounded bg-lime/40 px-1 font-semibold text-ink">
      [PENDIENTE: {pendiente}]
    </strong>
  );
}