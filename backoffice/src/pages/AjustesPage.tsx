import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { configs, useConfig } from "@/lib/data";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardBody,
  Divider,
  Field,
  FormGrid,
  Input,
  PageHeader,
  Spinner,
  StringsEditor,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/lib/types";
import { ModuloHeader } from "./ajustes/modulo-header";
import { problemaDeNav } from "@/lib/nav-links";

/**
 * Módulos de los ajustes del sitio. Cada uno es una pantalla aparte y todos
 * guardan en la misma fila de configuración, así que se edita uno y se pulsa
 * guardar una vez.
 *
 * "Header" va el primero porque es el más visible: la marca y el menú se ven en
 * todas las páginas.
 */
const MODULOS = [
  { id: "header", label: "Header" },
  { id: "general", label: "General" },
] as const;

type ModuloId = (typeof MODULOS)[number]["id"];

export function AjustesPage() {
  const { value, save, loading } = useConfig(configs.site());
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [modulo, setModulo] = useState<ModuloId>("header");

  useEffect(() => {
    if (value && !form) {
      setForm({
        ...value,
        headline: [...value.headline],
        // Copia profunda de los enlaces: el editor los reordena y sin clonar el
        // arreglo movería la lista que ya está en el estado del formulario.
        navLinks: (value.navLinks ?? []).map((l) => ({ ...l })),
      });
    }
  }, [value, form]);

  if (loading || !form) {
    return (
      <div className="p-14">
        <Spinner />
      </div>
    );
  }

  function commit(patch: Partial<SiteSettings>) {
    setForm((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  async function saveNow() {
    // Se comprueba el menú antes de pedir nada al backend. El backend responde
    // `400` diciendo qué campo falla pero no cuál de los enlaces, y con siete
    // filas en pantalla eso obligaría a contarlas a mano.
    const problema = problemaDeNav(form!.navLinks);
    if (problema) {
      toast.error(problema);
      setModulo("header");
      return;
    }

    setSaving(true);
    try {
      await save({
        ...form!,
        // Cadena vacía y `null` significan lo mismo para el backend (sin logo),
        // pero se manda siempre la cadena para que el valor guardado no dependa
        // de cómo se llegó a él. El `?.` es necesario: la base devuelve `null`
        // cuando no hay imagen, que es el estado de partida.
        logoUrl: form!.logoUrl?.trim() ?? "",
      });
      toast.success("Ajustes guardados");
    } catch (e) {
      // Se enseña lo que dice el servidor, no un "no se pudo" genérico. Un
      // guardado que falla en silencio es lo que dejó pasar meses sin
      // enterarse de que ningún ajuste se estaba guardando: el aviso decía una
      // cosa, el servidor otra, y no había forma de saber cuál.
      toast.error(
        e instanceof Error && e.message
          ? `No se pudieron guardar los ajustes: ${e.message}`
          : "No se pudieron guardar los ajustes",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ajustes del sitio"
        description="Los cambios que se ven en todo el sitio. Cada módulo guarda en la misma configuración, así que se edita y se guarda una vez."
        actions={
          <Button variant="lime" onClick={saveNow} disabled={saving}>
            <Save className="size-4" /> {saving ? "Guardando…" : "Guardar ajustes"}
          </Button>
        }
      />

      <nav aria-label="Módulos de los ajustes">
        <ul className="flex flex-wrap gap-1.5">
          {MODULOS.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => setModulo(m.id)}
                aria-current={modulo === m.id ? "true" : undefined}
                className={cn(
                  "rounded-pill px-4 py-2 font-display text-xs font-semibold transition-colors",
                  modulo === m.id
                    ? "bg-ink text-paper"
                    : "border border-mist bg-paper text-muted hover:text-ink",
                )}
              >
                {m.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {modulo === "header" ? (
        <ModuloHeader form={form} commit={commit} />
      ) : (
        <div className="space-y-6">
          <Card>
            <CardBody className="space-y-6">
              <Divider label="Identidad" />
              <FormGrid>
                <Field label="Nombre del sitio">
                  <Input
                    value={form.nombre}
                    onChange={(e) => commit({ nombre: e.target.value })}
                  />
                </Field>
                <Field label="Tagline">
                  <Input
                    value={form.tagline}
                    onChange={(e) => commit({ tagline: e.target.value })}
                  />
                </Field>
              </FormGrid>
              <StringsEditor
                label="Titular del hero (por líneas)"
                value={form.headline}
                onChange={(headline) => commit({ headline })}
                hint="Cada elemento es una línea del titular animado de la portada."
                placeholder="Línea del titular"
              />
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-6">
              <Divider label="Contacto" />
              <FormGrid>
                <Field label="Correo">
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => commit({ email: e.target.value })}
                  />
                </Field>
                <Field label="Teléfono (visible)">
                  <Input
                    value={form.telefono}
                    onChange={(e) => commit({ telefono: e.target.value })}
                  />
                </Field>
                <Field
                  label="Teléfono (enlace tel:)"
                  hint="Prefijo tel: con el número en formato internacional."
                >
                  <Input
                    value={form.telefonoHref}
                    onChange={(e) => commit({ telefonoHref: e.target.value })}
                  />
                </Field>
                <Field label="Dirección">
                  <Input
                    value={form.direccion}
                    onChange={(e) => commit({ direccion: e.target.value })}
                  />
                </Field>
                <Field label="Ciudad">
                  <Input value={form.ciudad} onChange={(e) => commit({ ciudad: e.target.value })} />
                </Field>
              </FormGrid>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-6">
              <Divider label="Redes sociales" />
              <FormGrid>
                <Field label="Facebook">
                  <Input
                    value={form.facebook}
                    onChange={(e) => commit({ facebook: e.target.value })}
                  />
                </Field>
                <Field label="Instagram">
                  <Input
                    value={form.instagram}
                    onChange={(e) => commit({ instagram: e.target.value })}
                  />
                </Field>
                <Field label="X / Twitter">
                  <Input value={form.x} onChange={(e) => commit({ x: e.target.value })} />
                </Field>
              </FormGrid>
            </CardBody>
          </Card>
        </div>
      )}

      {/* El mismo guardado que el de arriba. Se repite al final porque la lista
          de enlaces es larga y al desplazarse el botón de arriba se sale de la
          vista; es el mismo patrón que usan las demás páginas del panel. */}
      <div className="flex justify-end">
        <Button variant="lime" onClick={saveNow} disabled={saving}>
          <Save className="size-4" /> {saving ? "Guardando…" : "Guardar ajustes"}
        </Button>
      </div>
    </div>
  );
}