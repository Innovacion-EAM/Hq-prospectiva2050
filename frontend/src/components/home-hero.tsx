import { Link } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useSite } from "@/data/site-context";
import { postForm } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { clasesBoton } from "./portada-colores";
import { Button } from "./ui/button";

export function HomeHero() {
  const { SITE, PORTADA } = useSite();
  return (
    <section className="relative isolate overflow-hidden bg-ink text-paper">
      {/* Imagen única del héroe. Antes eran dos piezas —la foto de fondo de
          ciudad y la foto de las personas— y ahora es una sola imagen que trae
          el conjunto completo. Se ve a plena imagen; el degradado de abajo solo
          oscurece el lado izquierdo, donde va el titular, para que se lea.
          Editable en Ajustes → Home. */}
      <img
        src={PORTADA.hero.fondo}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/90 via-ink/60 to-ink/80 lg:bg-gradient-to-r lg:from-ink lg:via-ink/55 lg:to-transparent" />

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
            {/* El color sale de una lista cerrada con su texto ya emparejado, no
                de un color libre: ver `COLOR_BOTON` en `portada-colores.ts`. */}
            <Link
              to="/proyecto"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-pill px-6 py-3.5 font-display text-sm font-bold no-underline tap-scale shadow-lg transition-transform",
                clasesBoton(PORTADA.hero.botonColor),
              )}
            >
              {PORTADA.hero.botonTexto}
            </Link>
          </div>

          {/* La caja de sugerencias va debajo del titular, en la mitad izquierda
              oscura: la foto de las personas sobre la que flotaba antes ahora es
              parte de la imagen única del héroe, así que ya no hay dónde apoyarla. */}
          <div className="mt-10 max-w-xs sm:max-w-sm">
            <SuggestForm rotated inputId="sugerencia-hero" />
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
  const { PORTADA } = useSite();
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
        {PORTADA.hero.cajaTitulo}
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
        variant="pintado"
        size="sm"
        // `variant="pintado"` no pone ningún color a propósito: el fondo, el texto
        // y el hover los pone `clasesBoton`, que es lo que se elige en Ajustes →
        // Home. El color sale de `cajaBotonColor`, cuya lista es corta porque esta
        // caja es lima y un botón lima encima de una caja lima no se vería.
        className={cn(
          "mt-2 w-full px-6 py-1.5 text-xs font-bold uppercase tracking-wider",
          clasesBoton(PORTADA.hero.cajaBotonColor),
        )}
        disabled={!puedeEnviar}
      >
        {sending ? "Enviando…" : "Enviar"}
      </Button>
    </form>
  );
}
