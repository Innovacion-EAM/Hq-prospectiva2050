import { Link } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useSite } from "@/data/site-context";
import { postForm } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export function HomeHero() {
  const { SITE } = useSite();
  return (
    <section className="relative isolate overflow-hidden bg-ink text-paper pb-24 sm:pb-32 lg:pb-40">
      {/* Background aerial city image */}
      <img
        src="/images/hero-city.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-45 grayscale"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/90 via-ink/80 to-ink lg:bg-gradient-to-r lg:from-ink lg:via-ink/85 lg:to-ink/40" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[0.88fr_1.12fr] lg:py-16">
        {/* Left hero headline */}
        <div className="relative z-10 max-w-xl text-left">
          <h1 className="font-display text-hero leading-[1.1] font-extrabold tracking-tight text-paper">
            {SITE.headline.map((line, index) => (
              <span
                key={line}
                className={cn(
                  "block",
                  index === SITE.headline.length - 1 ? "text-lime" : ""
                )}
              >
                {line}
              </span>
            ))}
          </h1>
          <div className="mt-8 flex justify-start">
            <Link
              to="/proyecto"
              className="inline-flex items-center gap-1.5 rounded-pill bg-lime px-6 py-3.5 font-display text-sm font-bold text-lime-fg no-underline tap-scale hover:bg-lime-deep shadow-lg transition-transform"
            >
              Explorar más »
            </Link>
          </div>
        </div>

        {/* Right column: People image centered perfectly over green circle ring */}
        <div className="relative mx-auto w-full max-w-md sm:max-w-lg lg:max-w-none">
          <div className="relative flex items-center justify-center py-4">
            {/* Green Ring Graphic centered behind people */}
            <div
              aria-hidden="true"
              className="absolute top-[48%] left-[50%] size-[16rem] sm:size-[22rem] lg:size-[27rem] -translate-x-1/2 -translate-y-1/2 rounded-full border-[20px] sm:border-[28px] lg:border-[34px] border-lime shadow-[0_0_50px_rgba(143,203,50,0.35)] pointer-events-none"
            />

            {/* Perfectly aligned people image container */}
            <div
              className="relative z-10 mx-auto w-full overflow-hidden rounded-2xl"
              style={{
                WebkitMaskImage: "radial-gradient(ellipse 85% 85% at 50% 50%, black 60%, transparent 100%)",
                maskImage: "radial-gradient(ellipse 85% 85% at 50% 50%, black 60%, transparent 100%)",
              }}
            >
              <img
                src="/images/hero-people.jpg"
                alt="Talento local del Quindío: jóvenes profesionales del territorio"
                className="w-full h-[18rem] sm:h-[22rem] lg:h-[26rem] object-cover object-[center_20%]"
                style={{
                  filter: "brightness(1.08) contrast(1.05)",
                }}
              />
            </div>

            {/* La caja de sugerencias flota sobre la esquina inferior derecha de
                la foto de las personas. Como está anclada por abajo (`absolute
                -bottom-*`), bajarla es la única forma de que tape menos: con
                `-bottom-6` tapaba casi dos tercios del alto de la imagen (que en lg
                mide 26rem = 416px) y le caía encima de la cara a alguien.

                Ahora cuelga 160px bajo la foto en lg y solo tapa el 27% de abajo:
                el borde superior de la tarjeta queda a 304px de los 416px, muy
                por debajo de la altura de la cara.

                Para llegar aquí hubo que agrandar la sección, no solo estirar el
                `-bottom-`: el `lg:pb-24` original se quedó sin margen y con el
                `overflow-hidden` de la sección la tarjeta se recortaba. Ese
                padding creció con el `-bottom-` a la par, y es lo que sostiene el
                hueco. Hoy de la base de la foto al borde del hero hay 240px en lg
                (192 en sm, 144 en móvil) contra los 160/128/112px que sobresale, así
                que la caja sigue entera dentro de la sección —el `rotate-2` suma
                ~10px de envolvente—.

                Bajar más ya no es posible sin romper algo: la tarjeta no puede
                pasar del borde inferior de la sección o aparecería recortada. Si
                hay que bajarla otro tramo, el siguiente paso es moverla fuera de
                la foto (por ejemplo al lado del titular en escritorio), no un
                `-bottom-` mayor. */}
            <div className="absolute -bottom-28 right-0 z-30 w-64 sm:-bottom-32 sm:right-2 sm:w-72 lg:-bottom-40">
              <SuggestForm rotated inputId="sugerencia-hero" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Caja «¿Tienes alguna pregunta o quieres darnos una recomendación?» del hero.
 *
 * Es anónima: no pide nombre. Lo único que cambia frente a como estaba es que
 * ahora admite un **correo opcional**, porque sin un canal no hay manera de
 * devolverle una respuesta a quien escribió, y eso convertía la caja en un
 * buzón de un solo sentido. Quien no deje correo sigue pudiendo escribir igual;
 * el backend guarda `null` y el backoffice lo muestra como «Sin contacto», sin
 * inventarse una dirección.
 *
 * El sistema no envía correos (eso requiere SMTP/hosting). Quien administer
 * responde por el canal que dejó la persona y anota qué hizo en el campo de
 * seguimiento del mensaje.
 */
export function SuggestForm({
  rotated,
  inputId = "sugerencia",
  emailId = "sugerencia-email",
}: {
  rotated: boolean;
  inputId?: string;
  emailId?: string;
}) {
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  // Aunque el formulario sea anónimo, el backend exige la autorización igual:
  // el texto libre puede contener datos personales que quien escribe no repara en
  // poner. Se le pide lo mismo que en los demás formularios, en una sola línea para
  // no romper la caja.
  const [consentimiento, setConsentimiento] = useState(false);

  // Se valida en el cliente para no gastar un viaje de ida y vuelta en un correo
  // mal escrito, pero el backend también lo valida (@IsEmail): esta comprobación
  // es por cortesía, no la barrera real.
  const correoMalFormateado = email.trim() !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const puedeEnviar = text.trim().length >= 5 && consentimiento && !correoMalFormateado && !sending;

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!puedeEnviar) return;
    setSending(true);
    try {
      await postForm("sugerencias", {
        nombre: "Ciudadanía",
        // Vacío y no `undefined`: se manda explícitamente la ausencia de canal.
        email: email.trim() || undefined,
        sugerencia: text.trim(),
        consentimiento: true,
      });
      toast.success(
        email.trim()
          ? "Gracias. Te responderemos a ese correo."
          : "Gracias. Recibimos tu pregunta o recomendación.",
      );
      setText("");
      setEmail("");
      setConsentimiento(false);
    } catch {
      toast.error("No pudimos recibir tu mensaje. Inténtalo de nuevo más tarde.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={send}
      className={cn(
        "rounded-2xl bg-lime p-3.5 text-lime-fg shadow-[var(--shadow-float)] border border-paper/20 sm:p-4 backdrop-blur-xs",
        rotated && "origin-bottom-right rotate-2 hover:rotate-0 transition-transform duration-200",
      )}
    >
      <label htmlFor={inputId} className="font-display text-xs leading-snug font-extrabold sm:text-sm">
        ¿Tienes alguna pregunta o quieres darnos una recomendación?
      </label>
      {/* Antes era un `<input>` de una línea con el placeholder "escribe tu res...",
          que además estaba cortado a la mitad. Una recomendación no cabe en una
          línea, así que ahora es un área de texto de tres renglones. */}
      <textarea
        id={inputId}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Escribe tu pregunta o recomendación…"
        className="mt-2.5 w-full resize-y rounded-2xl bg-paper px-3 py-2 text-xs leading-relaxed text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-ink/20"
      />
      <label htmlFor={emailId} className="mt-2.5 block text-[0.6rem] font-semibold leading-tight text-ink-mid">
        ¿Quieres que te respondamos? Deja aquí tu correo (opcional)
      </label>
      <input
        id={emailId}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@correo.com"
        autoComplete="email"
        aria-invalid={correoMalFormateado || undefined}
        aria-describedby={correoMalFormateado ? `${emailId}-error` : undefined}
        className="mt-1 h-7 w-full rounded-pill bg-paper px-3 text-xs text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-ink/20"
      />
      {correoMalFormateado ? (
        <p id={`${emailId}-error`} role="alert" className="mt-1 text-[0.6rem] leading-tight text-ink">
          Revisa el correo: no parece una dirección válida.
        </p>
      ) : null}
      <label className="mt-2.5 flex items-start gap-1.5 text-[0.6rem] leading-tight text-ink-mid">
        <input
          type="checkbox"
          required
          checked={consentimiento}
          onChange={(e) => setConsentimiento(e.target.checked)}
          className="mt-px size-3 shrink-0 accent-[var(--color-lime-btn)]"
        />
        <span>
          Autorizo el tratamiento de mis datos.{" "}
          <Link to="/privacidad" className="font-semibold underline">
            Aviso de privacidad
          </Link>
          .
        </span>
      </label>
      <Button
        type="submit"
        variant="hot"
        size="sm"
        className="mt-2 w-full text-xs py-1.5 font-bold uppercase tracking-wider"
        disabled={!puedeEnviar}
      >
        {sending ? "Enviando…" : "Enviar"}
      </Button>
    </form>
  );
}
