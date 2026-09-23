import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PageHero } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { WORKSHOPS } from "@/data/site";
import { postForm } from "@/lib/api-client";
import { fetchConvocatorias, formatFecha, type ApiConvocatoria } from "@/lib/api";
import { cn } from "@/lib/utils";

export function ParticipaPage() {
  const [convocatorias, setConvocatorias] = useState<ApiConvocatoria[]>([]);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    municipio: "",
    perfil: "Ciudadanía",
    mensaje: "",
  });

  useEffect(() => {
    fetchConvocatorias()
      .then(setConvocatorias)
      .catch(() => setConvocatorias([]));
  }, []);

  async function send(e: FormEvent) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      await postForm("inscripciones", {
        taller: form.mensaje,
        nombre: form.nombre,
        email: form.correo,
        adicional: `Perfil: ${form.perfil} — Municipio: ${form.municipio}`,
      });
      toast.success("Inscripción recibida. Te escribiremos con los próximos pasos.");
      setForm({ nombre: "", correo: "", municipio: "", perfil: "Ciudadanía", mensaje: "" });
    } catch {
      toast.error("No pudimos registrar tu inscripción. Inténtalo de nuevo más tarde.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <PageHero
        kicker="Participa"
        title="El futuro del Quindío se construye con su gente"
        intro="Talleres, convocatorias y un canal abierto para preguntas y recomendaciones."
      />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">Agenda de talleres</h2>
            <ul className="mt-6 flex flex-col gap-3">
              {WORKSHOPS.map((w) => (
                <li
                  key={w.title}
                  className="flex flex-col gap-2 rounded-2xl border border-stone p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-display font-semibold text-ink">{w.title}</p>
                    <p className="text-sm text-muted">
                      {w.date} · {w.place}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "self-start rounded-pill px-3 py-1 font-display text-xs font-semibold",
                      w.status === "Abierto"
                        ? "bg-lime text-lime-fg"
                        : w.status === "Realizado"
                          ? "bg-stone text-muted"
                          : "bg-fog text-ink",
                    )}
                  >
                    {w.status}
                  </span>
                </li>
              ))}
            </ul>
            <h2 className="mt-12 font-display text-xl font-bold text-ink">Convocatorias</h2>
            <div className="mt-4 grid gap-4">
              {convocatorias.length === 0 ? (
                <p className="rounded-2xl border border-stone p-5 text-sm text-muted">
                  No hay convocatorias abiertas en este momento.
                </p>
              ) : (
                convocatorias.map((c) => (
                  <article key={c.id} className="rounded-2xl border border-stone p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-display font-bold text-ink">{c.titulo}</h3>
                      {c.fecha ? (
                        <span className="rounded-pill bg-lime px-3 py-1 font-display text-xs font-semibold text-lime-fg">
                          {formatFecha(c.fecha)}
                        </span>
                      ) : null}
                    </div>
                    {c.descripcion ? <p className="mt-2 text-sm text-muted">{c.descripcion}</p> : null}
                    {c.enlace ? (
                      <a
                        href={c.enlace}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex rounded-pill bg-ink px-4 py-2 font-display text-xs font-semibold text-paper no-underline hover:bg-ink-mid"
                      >
                        Inscribirme
                      </a>
                    ) : (
                      <p className="mt-3 text-xs text-muted">
                        Para inscribirte, completa el formulario.
                      </p>
                    )}
                  </article>
                ))
              )}
            </div>
          </div>
          <form onSubmit={send} className="rounded-3xl bg-fog p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-ink">Inscribirme a un taller</h2>
            <p className="mt-2 text-sm text-muted">
              Cuéntanos quién eres y cómo quieres sumarte. El equipo confirma cupo por correo.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <input
                required
                placeholder="Nombre"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="h-11 rounded-pill border border-mist bg-paper px-4 text-sm outline-none focus:ring-2 focus:ring-lime"
              />
              <input
                required
                type="email"
                placeholder="Correo"
                value={form.correo}
                onChange={(e) => setForm({ ...form, correo: e.target.value })}
                className="h-11 rounded-pill border border-mist bg-paper px-4 text-sm outline-none focus:ring-2 focus:ring-lime"
              />
              <input
                required
                placeholder="Municipio"
                value={form.municipio}
                onChange={(e) => setForm({ ...form, municipio: e.target.value })}
                className="h-11 rounded-pill border border-mist bg-paper px-4 text-sm outline-none focus:ring-2 focus:ring-lime"
              />
              <select
                value={form.perfil}
                onChange={(e) => setForm({ ...form, perfil: e.target.value })}
                className="h-11 rounded-pill border border-mist bg-paper px-4 text-sm outline-none focus:ring-2 focus:ring-lime"
              >
                <option>Ciudadanía</option>
                <option>Academia</option>
                <option>Empresa / gremio</option>
                <option>Entidad pública</option>
                <option>Organización social</option>
              </select>
              <textarea
                required
                rows={4}
                placeholder="¿En qué taller o convocatoria te interesa participar?"
                value={form.mensaje}
                onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                className="rounded-xl border border-mist bg-paper px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-lime"
              />
              <Button type="submit" variant="ink" disabled={sending}>
                {sending ? "Enviando…" : "Enviar inscripción"}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
