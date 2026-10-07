import { ArrowRight, FolderSearch, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { HomeRepo } from "@/components/home-repo";
import { HomeDocuments } from "@/components/shared-sections";
import { PageHero } from "@/components/site-shell";

/**
 * La página «Repositorio» del sitio.
 *
 * Antes el menú llevaba directo a la app del repositorio (`/repo`), una
 * aplicación aparte. Al pulsarla sin recargar, el enrutador del sitio pintaba un
 * 404. En vez de mandar a la persona fuera del sitio, aquí se junta lo de
 * siempre con lo nuevo:
 *
 *  - `HomeDocuments`: las categorías documentales que ya vivían en el sitio
 *    (convenios, informes, memorias, boletines…), con su buscador por categoría.
 *  - `HomeRepo`: el resumen del repositorio interactivo (totales por dimensión,
 *    documentos con y sin enlace) y los accesos al panel y al catálogo de `/repo`.
 *
 * El cierre lleva a las dos formas de consultar: la lista completa del sitio y el
 * catálogo filtrable de la app.
 */
export function RepositorioPage() {
  return (
    <>
      <PageHero
        kicker="Archivo"
        title="Repositorio de información"
        intro="Convenios, informes, memorias, boletines y piezas de socialización del proceso, con autor, alcance territorial y formato de cada documento. La ficha completa y el catálogo de consulta viven en el repositorio interactivo."
      />

      <HomeRepo />

      <HomeDocuments />

      <section className="bg-fog px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-6 rounded-3xl border border-stone bg-paper p-8 sm:grid-cols-[1.4fr_1fr] sm:items-center sm:p-10">
          <div>
            <h2 className="font-display text-section font-bold text-ink">
              ¿Buscas un documento concreto?
            </h2>
            <p className="mt-3 max-w-xl text-xs leading-relaxed text-muted sm:text-sm">
              Puedes recorrerlo de dos maneras: la lista completa del sitio, con el
              buscador por título, autor y alcance territorial; o el catálogo del
              repositorio, que filtra por dimensión, tipo, formato y año.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <Link
              to="/documentos"
              className="inline-flex items-center justify-center gap-2 rounded-pill bg-lime px-5 py-2.5 font-display text-sm font-semibold text-lime-fg no-underline hover:bg-lime-deep"
            >
              <FolderSearch className="size-4" />
              Ver todos los documentos
            </Link>
            <a
              href="/repo/catalogo"
              className="inline-flex items-center justify-center gap-2 rounded-pill border border-stone px-5 py-2.5 font-display text-sm font-semibold text-ink no-underline hover:bg-fog"
            >
              <LayoutDashboard className="size-4" />
              Abrir el catálogo
              <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}