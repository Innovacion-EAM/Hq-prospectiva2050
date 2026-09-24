import { HomeContact } from "@/components/shared-sections";
import { PageHero } from "@/components/site-shell";
import { useSite } from "@/data/site-context";

export function ContactosPage() {
  const { ENTITIES, SITE } = useSite();
  return (
    <>
      <PageHero
        kicker="Contáctanos"
        title="Hablemos del horizonte"
        intro="Sede en Armenia, canal de correo y un formulario para entidades y ciudadanía."
      />
      <HomeContact />
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-stone">
          <iframe
            title="Mapa de Armenia, Quindío"
            className="h-80 w-full grayscale"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://maps.google.com/maps?q=Armenia%20Quindio%20Colombia&t=&z=13&ie=UTF8&iwloc=&output=embed"
          />
        </div>
        <p className="mt-4 text-sm text-muted">
          {SITE.address}, {SITE.city}. Atención de lunes a viernes, 8:00 a. m. a 5:00 p. m.
        </p>
        <h2 className="mt-12 font-display text-xl font-bold text-ink">Red institucional</h2>
        <ul className="mt-4 columns-1 gap-2 text-sm text-body sm:columns-2 lg:columns-3">
          {ENTITIES.map((e) => (
            <li key={e} className="break-inside-avoid py-1">
              {e}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
