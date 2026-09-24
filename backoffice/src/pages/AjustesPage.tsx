import { useEffect, useState } from "react";
import { Save, Settings } from "lucide-react";
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
import type { SiteSettings } from "@/lib/types";

export function AjustesPage() {
  const { value, save, loading } = useConfig(configs.site());
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (value && !form) setForm({ ...value, headline: [...value.headline] });
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
    setSaving(true);
    try {
      await save(form!);
      toast.success("Ajustes guardados");
    } catch {
      toast.error("No se pudieron guardar los ajustes");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ajustes del sitio"
        description="Datos generales y de contacto que se muestran en el encabezado, pie y página de contactos."
        actions={
          <Button variant="lime" onClick={saveNow} disabled={saving}>
            <Save className="size-4" /> {saving ? "Guardando…" : "Guardar ajustes"}
          </Button>
        }
      />

      <Card>
        <CardBody className="space-y-6">
          <Divider label="Identidad" />
          <FormGrid>
            <Field label="Nombre del sitio">
              <Input value={form.nombre} onChange={(e) => commit({ nombre: e.target.value })} />
            </Field>
            <Field label="Tagline">
              <Input value={form.tagline} onChange={(e) => commit({ tagline: e.target.value })} />
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
              <Input type="email" value={form.email} onChange={(e) => commit({ email: e.target.value })} />
            </Field>
            <Field label="Teléfono (visible)">
              <Input value={form.telefono} onChange={(e) => commit({ telefono: e.target.value })} />
            </Field>
            <Field label="Teléfono (enlace tel:)" hint="Prefijo tel: con el número en formato internacional.">
              <Input value={form.telefonoHref} onChange={(e) => commit({ telefonoHref: e.target.value })} />
            </Field>
            <Field label="Dirección">
              <Input value={form.direccion} onChange={(e) => commit({ direccion: e.target.value })} />
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
              <Input value={form.facebook} onChange={(e) => commit({ facebook: e.target.value })} />
            </Field>
            <Field label="Instagram">
              <Input value={form.instagram} onChange={(e) => commit({ instagram: e.target.value })} />
            </Field>
            <Field label="X / Twitter">
              <Input value={form.x} onChange={(e) => commit({ x: e.target.value })} />
            </Field>
          </FormGrid>
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <Button variant="lime" onClick={saveNow} disabled={saving}>
          <Settings className="size-4" /> {saving ? "Guardando…" : "Guardar ajustes"}
        </Button>
      </div>
    </div>
  );
}