import { Link } from "react-router-dom";
import {
  BookOpen,
  FileBarChart,
  FileText,
  Mail,
  MapPin,
  Newspaper,
  Presentation,
  ScrollText,
} from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import type { DocCategory } from "@/data/site";
import { useSite } from "@/data/site-context";
import { postForm } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { ConsentCheckbox } from "./consent-checkbox";
import { adornoBoton, clasesBoton } from "./portada-colores";
import { Button } from "./ui/button";

/**
 * Un bloque de titular y párrafo de la portada.
 *
 * Se resuelve campo a campo en `pickPortada`, así que aquí solo hay que imprimir.
 */
function TituloSeccion({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <>
      <h2 className="font-display text-section font-bold text-ink">{titulo}</h2>
      <p className="mt-3 max-w-xs text-xs leading-relaxed text-muted sm:text-sm">{texto}</p>
    </>
  );
}

export function HomeStats() {
  const { STATS } = useSite();
  return (
    <section className="border-y border-stone bg-paper px-4 py-10 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center rounded-2xl border border-stone/70 bg-fog/70 p-6 text-center shadow-xs transition-transform hover:-translate-y-0.5"
          >
            <span className="font-display text-3xl font-extrabold text-lime-ink sm:text-4xl">
              {stat.value}
            </span>
            <span className="mt-2 font-display text-sm font-bold text-ink">
              {stat.label}
            </span>
            <span className="mt-1 text-xs text-muted">{stat.subtext}</span>
          </div>
        ))}
      </div>
    </section>
  );
}


const DOC_ICONS: Record<DocCategory["icon"], typeof FileText> = {
  file: FileText,
  chart: FileBarChart,
  scroll: ScrollText,
  news: Newspaper,
  presentation: Presentation,
  book: BookOpen,
};

export function HomeDocuments() {
  const { DOC_CATEGORIES, PORTADA } = useSite();
  return (
    <section className="bg-paper px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-display text-section font-bold text-ink">
          {PORTADA.documentos.titulo}
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-center text-xs leading-relaxed text-muted sm:text-sm">
          {PORTADA.documentos.texto}
        </p>
        {/* La barra por fin tiene aire por dentro. Antes las 6 celdas iban de
            borde a borde del contenedor oscuro con px-4: el texto de la primera
            y de la última quedaba pegado a la orilla redondeada, y en pantallas
            grandes 6 columnas dejaban cada tarjeta angostísima (títulos como
            «publicaciones y artículos» se rompían a dos líneas). Ahora el
            contenedor padea y las tarjetas son baldosas con borde suave, en
            2 filas de 3. */}
        <div className="mt-10 rounded-3xl bg-[#0c272e] p-3 text-paper shadow-lg sm:p-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {DOC_CATEGORIES.map((cat) => {
              const Icon = DOC_ICONS[cat.icon];
              return (
                <article
                  key={cat.slug}
                  className="flex flex-col items-start gap-3 rounded-2xl border border-paper/10 bg-paper/5 px-5 py-6"
                >
                  <span className="grid size-10 place-items-center rounded-full bg-lime text-ink">
                    <Icon className="size-4" />
                  </span>
                  <h3 className="font-display text-xs font-bold leading-snug">{cat.title}</h3>
                  <p className="flex-1 text-[0.72rem] leading-relaxed text-mist">
                    {cat.description}
                  </p>
                  {/* El color sale de la lista cerrada con su texto ya
                      emparejado (ver `portada-colores.ts`), no de un color
                      libre. Se edita en Ajustes → Home. */}
                  <Link
                    to={`/documentos/${cat.slug}`}
                    className={cn(
                      "rounded-pill px-3 py-1 font-display text-[0.68rem] font-semibold no-underline",
                      clasesBoton(PORTADA.documentos.botonColor),
                    )}
                  >
                    Ver más
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

const FALLBACK_NEWS = [
  {
    slug: "noticias-y-comunicados",
    title: "Noticias y comunicados",
    category: "Noticias y comunicados",
    date: "24 mar 2026",
    image: "/images/news-ciudad.jpg",
  },
  {
    slug: "eventos-y-talleres",
    title: "Eventos y Talleres",
    category: "Eventos y Talleres",
    date: "8 may 2026",
    image: "/images/news-eventos.jpg",
  },
  {
    slug: "convocatorias-abiertas",
    title: "Únete a una sesión para la muestra del 6 de marzo",
    category: "Convocatorias",
    date: "12 a 18 de oct",
    image: "/images/news-convocatoria.jpg",
    overlay: "convoca" as const,
  },
];

export function HomeNews({ news }: { news?: { slug: string; title: string; category: string; date: string; image: string; overlay?: "convoca" }[] }) {
  const { PORTADA } = useSite();
  const items = (news && news.length > 0 ? news : FALLBACK_NEWS).slice(0, 3);

  return (
    <section className="relative overflow-hidden bg-paper px-4 pt-14 pb-16 sm:px-6 sm:pt-20">
      <div className="pointer-events-none absolute -left-20 top-4 h-56 w-56 rounded-full border border-stone/60" />
      <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[0.6fr_1.8fr]">
        <div>
          <TituloSeccion titulo={PORTADA.noticias.titulo} texto={PORTADA.noticias.texto} />
          <Link
            to="/noticias"
            className={cn(
              "mt-4 inline-flex rounded-pill px-4 py-2 font-display text-sm font-semibold no-underline",
              clasesBoton(PORTADA.noticias.botonColor),
            )}
          >
            {PORTADA.noticias.botonTexto}
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {items.map((n) => (
            <Link
              key={n.slug}
              to={`/noticias/${n.slug}`}
              className="relative h-72 w-56 shrink-0 overflow-hidden rounded-2xl no-underline sm:w-64"
            >
              <img src={n.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
              {n.overlay === "convoca" ? (
                <div className="absolute inset-0 bg-convoca/65 p-4 flex flex-col justify-start">
                  <span className="self-start rounded-sm bg-lime px-2 py-0.5 text-[0.65rem] font-bold text-ink uppercase">
                    Convocatoria
                  </span>
                  <p className="mt-4 font-display text-sm leading-tight font-extrabold text-paper">
                    {n.title}
                  </p>
                  <p className="mt-2 text-[0.65rem] font-bold text-lime">{n.date}</p>
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent" />
              )}
              <div className="absolute inset-x-3 bottom-3 rounded-xl bg-[#0c272e]/90 p-3 text-paper backdrop-blur-xs">
                <h3 className="font-display text-xs font-bold text-paper">{n.category}</h3>
                {/* Va **encima** de la foto, así que tiene color propio: el
                    mismo que se lea bien sobre el papel no siempre se lee bien
                    sobre una imagen. Por eso `noticias` tiene dos colores y no
                    uno (ver `NoticiasPortada`). */}
                <span
                  className={cn(
                    "mt-2 inline-flex items-center gap-1 rounded-pill px-3 py-1 font-display text-[0.68rem] font-semibold",
                    clasesBoton(PORTADA.noticias.tarjetaBotonColor),
                  )}
                >
                  Ver más {">"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}



export function HomeContact() {
  const { SITE, PORTADA } = useSite();
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    asunto: "",
    mensaje: "",
  });
  const [consentimiento, setConsentimiento] = useState(false);

  async function send(e: FormEvent) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      await postForm("contacto", {
        nombre: form.nombre,
        email: form.correo,
        asunto: form.asunto || undefined,
        mensaje: form.mensaje,
        consentimiento: true,
      });
      toast.success("Mensaje enviado. Te contactaremos pronto.");
      setForm({ nombre: "", correo: "", asunto: "", mensaje: "" });
      // Se desmarca sola: el consentimiento es para ESTE envío. Dejarla marcada
      // haría que el siguiente mensaje saliera con una autorización que nadie
      // volvió a dar.
      setConsentimiento(false);
    } catch {
      toast.error("No pudimos enviar tu mensaje. Inténtalo de nuevo más tarde.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="bg-fog px-4 py-14 sm:px-6 sm:py-18">
      <div className="mx-auto grid max-w-6xl gap-10 rounded-3xl bg-paper p-6 shadow-sm sm:p-10 lg:grid-cols-2">
        <div>
          <TituloSeccion titulo={PORTADA.contacto.titulo} texto={PORTADA.contacto.texto} />
          <ul className="mt-6 flex flex-col gap-3 text-xs text-muted sm:text-sm">
            <li className="flex items-center gap-3">
              <IconBubble>
                <Mail className="size-4 text-lime-ink" />
              </IconBubble>
              <a href={`mailto:${SITE.email}`} className="text-muted no-underline hover:text-ink">
                {SITE.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <IconBubble>
                <MapPin className="size-4 text-lime-ink" />
              </IconBubble>
              <span>
                {SITE.address} — {SITE.city}
              </span>
            </li>
          </ul>

          {/* Este botón es un enlace `tel:`, no un "enviar": por eso lleva
              color propio y no comparte el del formulario. */}
          <a
            href={SITE.phoneHref}
            className={cn(
              "mt-6 inline-flex items-center gap-2 rounded-pill px-5 py-2.5 font-display text-sm font-bold no-underline shadow-xs",
              clasesBoton(PORTADA.contacto.botonColor),
            )}
          >
            {/* El círculo del icono se pone del color contrario al del botón:
                si no, elegir `lima` para el botón lo dejaba lima sobre lima y
                el icono desaparecía. */}
            <span
              className={cn(
                "grid size-5 place-items-center rounded-full text-xs font-extrabold",
                adornoBoton(PORTADA.contacto.botonColor),
              )}
            >
              📱
            </span>
            {SITE.phone}
          </a>
        </div>

        <form onSubmit={send} className="flex flex-col gap-3">
          <p className="font-display text-base font-bold text-ink sm:text-lg">
            {PORTADA.contacto.formTitulo}
          </p>
          <Field
            label="Nombre"
            value={form.nombre}
            onChange={(v) => setForm({ ...form, nombre: v })}
          />
          <Field
            label="Correo"
            type="email"
            value={form.correo}
            onChange={(v) => setForm({ ...form, correo: v })}
          />
          <Field
            label="Asunto"
            value={form.asunto}
            onChange={(v) => setForm({ ...form, asunto: v })}
          />
          <label className="block">
            <span className="sr-only">Mensaje</span>
            <textarea
              required
              rows={4}
              placeholder="Mensaje"
              value={form.mensaje}
              onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
              className="w-full resize-y rounded-2xl border border-stone bg-paper px-4 py-3 text-xs text-ink outline-none placeholder:text-muted focus:border-lime focus:ring-1 focus:ring-lime"
            />
          </label>
          <ConsentCheckbox
            id="contacto-consentimiento"
            checked={consentimiento}
            onChange={setConsentimiento}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="pintado"
              size="sm"
              // Sin color en la variante: el fondo, el texto y el hover los pone
              // `clasesBoton` con el color que se elige en Ajustes → Home.
              className={cn("px-6", clasesBoton(PORTADA.contacto.enviarColor))}
              // Sin la casilla no se envía. Deshabilitarlo explica el motivo en
              // la propia pantalla; dejarlo activo convertiría cada intento en
              // un 400 del servidor.
              disabled={sending || !consentimiento}
            >
              {sending ? "Enviando…" : "Enviar"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <input
        required
        type={type}
        placeholder={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-2xl border border-stone bg-paper px-4 text-xs text-ink outline-none placeholder:text-muted focus:border-lime focus:ring-1 focus:ring-lime"
      />
    </label>
  );
}

function IconBubble({ children }: { children: ReactNode }) {
  return (
    <span className="grid size-7 place-items-center rounded-full border border-stone bg-paper">
      {children}
    </span>
  );
}
