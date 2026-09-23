import { Link } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { SITE } from "@/data/site";
import { postForm } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-paper pb-16 sm:pb-20 lg:pb-24">
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

            {/* Suggestion box floating over bottom-right of hero image */}
            <div className="absolute -bottom-6 right-0 sm:right-2 z-30 w-64 sm:w-72">
              <SuggestForm rotated inputId="sugerencia-hero" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SuggestForm({
  rotated,
  inputId = "sugerencia",
}: {
  rotated: boolean;
  inputId?: string;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await postForm("sugerencias", {
        nombre: "Ciudadanía",
        email: undefined,
        sugerencia: text.trim(),
      });
      toast.success("Gracias. Recibimos tu pregunta o recomendación.");
      setText("");
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
      <p className="font-display text-xs leading-snug font-extrabold sm:text-sm">
        ¿Tienes alguna Pregunta O quieres darnos Alguna recomendación?
      </p>
      <label htmlFor={inputId} className="sr-only">
        Escribe tu respuesta
      </label>
      <input
        id={inputId}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="escribe tu res..."
        aria-label="Tu pregunta o recomendación"
        className="mt-2.5 h-8.5 w-full rounded-pill bg-paper px-3 text-xs text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-ink/20"
      />
      <Button
        type="submit"
        variant="hot"
        size="sm"
        className="mt-2.5 w-full text-xs py-1.5 font-bold uppercase tracking-wider"
        disabled={sending}
      >
        {sending ? "Enviando…" : "Enviar"}
      </Button>
    </form>
  );
}
