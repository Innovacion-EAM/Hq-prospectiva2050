import { Field, FormGrid, Input, TextArea } from "@/components/ui";
import type { SiteSettings } from "@/lib/types";
import { LEGAL_VACIO } from "@/lib/legal";
import { ModuloCard } from "./nav-links-editor";

/**
 * Módulo "Legal": los datos que aparecen en las páginas legales del sitio
 * (`/privacidad` y `/terminos`).
 *
 * Aquí vive **solo lo que cambia con la organización** —el responsable, su NIT,
 * el canal para los derechos ARCO, el plazo de conservación y quiénes acceden a
 * los datos—. El texto de fondo de esas páginas queda en el código, a propósito:
 * es redacción jurídica estándar y reescribirla desde el panel sería la forma
 * más fácil de romper el cumplimiento sin que nadie lo note.
 *
 * Un campo vacío significa "todavía sin definir": la página pública muestra
 * entonces un marcador visible en ese hueco, para que nadie dé el aviso por
 * completo creyendo que ya está. Por eso ningún campo bloquea el guardado: se
 * puede publicar a medias y completar después.
 */
export function ModuloLegal({
  form,
  commit,
}: {
  form: SiteSettings;
  commit: (patch: Partial<SiteSettings>) => void;
}) {
  // La fila puede no traer `legal` en instalaciones antiguas (la columna se crea
  // vacía y el seeder la rellena al arrancar), así que se cae al objeto vacío.
  const legal = form.legal ?? LEGAL_VACIO;
  const set = (campo: keyof typeof legal, valor: string) =>
    commit({ legal: { ...legal, [campo]: valor } });

  return (
    <div className="space-y-6">
      <ModuloCard
        titulo="Responsable del tratamiento"
        descripcion="Quién responde legalmente por los datos que recogen los formularios del sitio. Sale en el aviso de privacidad y en los términos de uso."
      >
        <FormGrid>
          <Field label="Nombre o razón social">
            <Input
              value={legal.responsable}
              onChange={(e) => set("responsable", e.target.value)}
              placeholder="Ej. Gobernación del Quindío"
            />
          </Field>
          <Field label="NIT">
            <Input
              value={legal.nit}
              onChange={(e) => set("nit", e.target.value)}
              placeholder="Ej. 890000000-0"
            />
          </Field>
          <Field label="Dirección">
            <Input value={legal.direccion} onChange={(e) => set("direccion", e.target.value)} />
          </Field>
          <Field label="Ciudad">
            <Input value={legal.ciudad} onChange={(e) => set("ciudad", e.target.value)} />
          </Field>
        </FormGrid>
      </ModuloCard>

      <ModuloCard
        titulo="Derechos de los titulares (ARCO)"
        descripcion="El canal por el que una persona puede pedir acceso, rectificación, cancelación u oposición sobre sus datos. Es el correo o el medio que la organización atiende de verdad."
      >
        <FormGrid>
          <Field label="Correo o canal para los derechos">
            <Input
              type="email"
              value={legal.correoArco}
              onChange={(e) => set("correoArco", e.target.value)}
              placeholder="Ej. datos@entidad.gov.co"
            />
          </Field>
        </FormGrid>
      </ModuloCard>

      <ModuloCard
        titulo="Conservación y acceso"
        descripcion="Cuánto tiempo se guardan los mensajes e inscripciones, quiénes pueden verlos y cuándo se actualizó la política. La fecha la escribe la organización cuando publica un cambio (por ejemplo, «octubre de 2026»)."
      >
        <FormGrid>
          <Field label="Tiempo de conservación">
            <Input
              value={legal.plazoConservacion}
              onChange={(e) => set("plazoConservacion", e.target.value)}
              placeholder="Ej. el tiempo del ejercicio y un año más"
            />
          </Field>
          <Field label="Última actualización">
            <Input
              value={legal.actualizado}
              onChange={(e) => set("actualizado", e.target.value)}
              placeholder="Ej. octubre de 2026"
            />
          </Field>
        </FormGrid>
        <Field label="Quiénes acceden a los datos">
          <TextArea
            rows={3}
            value={legal.quienesAcceden}
            onChange={(e) => set("quienesAcceden", e.target.value)}
            placeholder="Ej. solo el equipo técnico del ejercicio y las entidades aliadas firmantes, bajo acuerdo de confidencialidad."
          />
        </Field>
      </ModuloCard>

      <p className="rounded-2xl border border-mist bg-fog px-4 py-3 text-xs text-muted">
        Los campos que deje vacíos aparecen en la página pública como{" "}
        <strong>PENDIENTE</strong>, para que se vea lo que falta. Mientras haya
        datos pendientes, el aviso de privacidad se publica pero no cumple del
        todo la Ley 1581.
      </p>
    </div>
  );
}