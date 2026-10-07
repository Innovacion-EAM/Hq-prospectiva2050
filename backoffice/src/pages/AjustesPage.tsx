import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { Save } from "lucide-react";
import { configs, useConfig } from "@/lib/data";
import { toast } from "sonner";
import { Button, PageHeader, Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/lib/types";
import { ModuloHeader } from "./ajustes/modulo-header";
import { LINEAS_TITULAR_MAX, ModuloHome } from "./ajustes/modulo-home";
import { ModuloPendiente } from "./ajustes/modulo-pendiente";
import { ModuloProyecto } from "./ajustes/modulo-proyecto";
import { ModuloContactos } from "./ajustes/modulo-contactos";
import { ModuloFooter } from "./ajustes/modulo-footer";
import { ModuloLegal } from "./ajustes/modulo-legal";
import { PORTADA_VACIA } from "@/lib/portada";
import { LEGAL_VACIO } from "@/lib/legal";
import { problemaDeNav } from "@/lib/nav-links";

/**
 * Módulos de los ajustes del sitio. Cada uno es una pantalla aparte y todos
 * guardan en la misma fila de configuración, así que se edita uno y se pulsa
 * guardar una vez.
 *
 * **El orden es el del sitio, de arriba abajo.** Antes había tres módulos
 * ("Header", "Home" y "General") en los que "Home" editaba toda la portada y
 * "General" juntaba identidad, contacto y redes sin que nada indicara dónde se
 * ve cada cosa. "General" ya no existe y ahora hay un módulo por bloque del
 * sitio, pero **solo con los que se han implementado**.
 *
 * ⚠️ **Los módulos vacíos no se llenan moviendo lo de otros.** Cada bloque del
 * sitio tiene su módulo, y los que todavía no se han decidido muestran
 * `ModuloPendiente`. **El proyecto** sí está implementado: edita la página
 * `/proyecto` (`home.elProyecto`), no el bloque oscuro de la portada. El resto
 * de lo editable sigue donde estaba: la portada entera en **Home**, y los datos
 * de contacto y redes en **Contáctanos** y **Footer**.
 *
 * Cuando se implemente uno, se quita su `ModuloPendiente` de `PANTALLAS` y se
 * pone su componente. Eso es todo lo que hay que hacer.
 *
 * Lo que **no** va a estar en ningún módulo, y por qué:
 *
 *  - **Los títulos que encabezan cada bloque.** Los de "El proyecto", "Las
 *    cuatro dimensiones", Municipios, Documentos, Noticias y Contactos son
 *    fijos: se cambian en el código del sitio y el frontend los lee de
 *    `PORTADA` sin mirar lo que venga en la API (ver `fijoPortada` en
 *    `frontend/src/data/site-context.tsx`). No hay ningún campo para ellos en
 *    ningún módulo, y a propósito: un campo que el sitio ignora hace que alguien
 *    escriba, guarde y no vea cambio, que es peor que no ofrecerlo. **El titular
 *    del hero sí se edita**, en Home: no es un rótulo de bloque, es la columna
 *    `headline` de la fila.
 */
const MODULOS = [
  {
    id: "header",
    label: "Header",
    desc: "El encabezado: la marca, el nombre y el subtítulo que van a su lado, y el orden de los enlaces del menú. Se ve en la barra de todas las páginas.",
  },
  {
    id: "home",
    label: "Home",
    desc: "La portada entera, de arriba abajo: el titular del hero, sus imágenes, los botones y el texto de cada sección hasta antes del pie.",
  },
  {
    id: "proyecto",
    label: "El proyecto",
    desc: "La página /proyecto —no el bloque oscuro de la portada—: titular, bajada, los dos párrafos, las tres etapas y las entidades aliadas.",
  },
  {
    id: "dimensiones",
    label: "Dimensiones",
    desc: "Las dimensiones en sí, con su resumen y sus capas, se editan en Configuración → Dimensiones; el texto que las anuncia en la portada, en Home.",
  },
  {
    id: "documentos",
    label: "Documentos",
    desc: "El encabezado sobre el repositorio se edita en Home; las categorías, en Configuración → Categorías; y los documentos, en Documentos.",
  },
  {
    id: "noticias",
    label: "Noticias",
    desc: "El encabezado y los botones de la tira de noticias se editan en Home; las noticias con su categoría, en Noticias.",
  },
  {
    id: "participa",
    label: "Participa",
    desc: "Los talleres de /participa se editan en Configuración → Talleres, y los doce municipios, en Configuración → Municipios.",
  },
  {
    id: "contactos",
    label: "Contáctanos",
    desc: "Los datos con los que el sitio responde: correo, teléfono, dirección y ciudad. Se ven en la portada, en /contactos, en el pie y en el aviso de privacidad.",
  },
  {
    id: "footer",
    label: "Footer",
    desc: "El pie de página: las redes sociales, el nombre del sitio y los enlaces de «El proyecto» que se muestran en su columna.",
  },
  {
    id: "legal",
    label: "Legal",
    desc: "Los datos de las páginas legales (/privacidad y /terminos): el responsable del tratamiento, su NIT, el canal para los derechos ARCO, el plazo de conservación y quiénes acceden a los datos. Lo que deje vacío aparece como «PENDIENTE» en el sitio.",
  },
] as const;

type ModuloId = (typeof MODULOS)[number]["id"];

/** Lo que recibe cada módulo: el formulario entero y una forma de cambiarlo. */
type PropsModulo = {
  form: SiteSettings;
  commit: (patch: Partial<SiteSettings>) => void;
};

/**
 * La pantalla de cada módulo.
 *
 * Es un diccionario y no una cadena de `cond ? <A/> : <B/>` porque con nueve
 * módulos esa cadena ya era ilegible y el último `else` se llevaba el que
 * faltara por el camino. Aquí el tipo obliga a que estén **todos**: si se
 * añade un módulo a `MODULOS` y se olvida su pantalla, no compila, en vez de
 * abrir un espacio en blanco cuyo módulo dependería además de cuál viniera
 * seleccionado por defecto.
 */
const PANTALLAS: Record<ModuloId, (props: PropsModulo) => ReactNode> = {
  header: ModuloHeader,
  home: ModuloHome,
  proyecto: ModuloProyecto,
  dimensiones: () => (
    <ModuloPendiente
      bloque="las dimensiones"
      detalle="La bajada del recuadro que las anuncia se edita hoy en Home, y las dimensiones en sí, con su resumen y sus capas, en Configuración → Dimensiones."
    />
  ),
  documentos: () => (
    <ModuloPendiente
      bloque="los documentos"
      detalle="El encabezado sobre el repositorio se edita hoy en Home; las categorías, en Configuración → Categorías; y los documentos, en Documentos."
    />
  ),
  noticias: () => (
    <ModuloPendiente
      bloque="las noticias"
      detalle="El encabezado y el botón de la tira se editan hoy en Home; las noticias con su categoría, en Noticias."
    />
  ),
  participa: () => (
    <ModuloPendiente
      bloque="la participación"
      detalle="La franja con los doce municipios se edita hoy en Home; los municipios, en Configuración → Municipios; y los talleres de /participa, en Configuración → Talleres."
    />
  ),
  contactos: ModuloContactos,
  footer: ModuloFooter,
  legal: ModuloLegal,
};

/**
 * Deja una imagen de la portada como cadena, poniendo `""` si la base la tiene
 * en `null`.
 *
 * El backend guarda `null` —no `""`— cuando en el panel se pulsa «Usar la del
 * sitio», porque es el valor que sí se escribe (un campo vacío no se asigna) y
 * el que el sitio lee como "usa la imagen propia". El formulario, en cambio,
 * trabaja siempre con cadenas: es lo que espera `SelectorImagen` y lo que
 * vuelve a mandar al guardar. Sin esta normalización, `null` se colaría en los
 * campos de texto y en la vista previa.
 */
function cadena(valor: string | null | undefined): string {
  return valor ?? "";
}

/** Las tres etapas de `/proyecto`: siempre tres recuadros, aunque la base traiga menos. */
function etapasDelFormulario(valor: unknown): string[] {
  const lista = Array.isArray(valor) ? valor.map((e) => String(e ?? "")) : [];
  return [0, 1, 2].map((i) => lista[i] ?? "");
}

export function AjustesPage() {
  const { value, save, loading } = useConfig(configs.site());
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const pedido = searchParams.get("modulo");
  const modulo: ModuloId = MODULOS.some((m) => m.id === pedido)
    ? (pedido as ModuloId)
    : "header";

  function setModulo(id: ModuloId) {
    setSearchParams(id === "header" ? {} : { modulo: id }, { replace: true });
  }

  useEffect(() => {
    if (value && !form) {
      setForm({
        ...value,
        headline: [...value.headline],
        // Copia profunda de los enlaces: el editor los reordena y sin clonar el
        // arreglo movería la lista que ya está en el estado del formulario.
        navLinks: (value.navLinks ?? []).map((l) => ({ ...l })),
        // Igual que los enlaces, la portada es un objeto de objetos y el
        // formulario la edita campo a campo. Sin esta copia, los objetos del
        // formulario serían los mismos que los de `value`, y guardar un cambio
        // escribiría en la fila que se usó para pintar la pantalla.
        home: {
          ...PORTADA_VACIA,
          ...(value.home ?? {}),
          hero: {
            ...PORTADA_VACIA.hero,
            ...(value.home?.hero ?? {}),
            fondo: cadena(value.home?.hero?.fondo),
            imagen: cadena(value.home?.hero?.imagen),
          },
          proyecto: {
            ...PORTADA_VACIA.proyecto,
            ...(value.home?.proyecto ?? {}),
            fondo: cadena(value.home?.proyecto?.fondo),
          },
          elProyecto: {
            ...PORTADA_VACIA.elProyecto,
            ...(value.home?.elProyecto ?? {}),
            fondo: cadena(value.home?.elProyecto?.fondo),
            etapas: etapasDelFormulario(value.home?.elProyecto?.etapas),
            entidades: [...(value.home?.elProyecto?.entidades ?? [])],
          },
          cobertura: { ...PORTADA_VACIA.cobertura, ...(value.home?.cobertura ?? {}) },
          documentos: { ...PORTADA_VACIA.documentos, ...(value.home?.documentos ?? {}) },
          repositorio: { ...PORTADA_VACIA.repositorio, ...(value.home?.repositorio ?? {}) },
          noticias: { ...PORTADA_VACIA.noticias, ...(value.home?.noticias ?? {}) },
          contacto: { ...PORTADA_VACIA.contacto, ...(value.home?.contacto ?? {}) },
          // Copia de la lista, como con `navLinks`: el editor del pie reordena
          // y sin clonar los enlaces movería la lista que ya está en la fila.
          footer: {
            ...PORTADA_VACIA.footer,
            ...(value.home?.footer ?? {}),
            enlaces: (value.home?.footer?.enlaces ?? []).map((l) => ({ ...l })),
          },
        },
        // Los datos legales, con respaldo: instalaciones anteriores a la columna
        // traen `undefined` y el módulo Legal no puede pintar campos de un
        // objeto que no existe.
        legal: { ...LEGAL_VACIO, ...(value.legal ?? {}) },
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
        // El titular se escribe renglón a renglón en Ajustes → Home, y aquí se
        // limpia antes de mandarlo. Se limpian tres cosas y ninguna es
        // caprichosa:
        //
        //  - **Las líneas en blanco se quitan.** Pulsando Enter al final queda
        //    un renglón vacío, y `["Hola", ""]` es una línea vacía en el sitio:
        //    el titular se ve con un hueco. Con esto, el renglón en blanco se
        //    puede escribir y borrar sin que nada se guarde a medias.
        //  - **Se recortan los espacios** de cada línea, para que la lista no
        //    dependa de dónde se dejó el cursor.
        //  - **Se corta al máximo de líneas** (`@ArrayMaxSize(10)` en el
        //    backend). Sin esto, escribir la undécima línea solo se notaría
        //    cuando el guardado volviera con un `400` que no dice qué campo es.
        //
        // Quedarse sin líneas es un estado válido: el sitio muestra entonces el
        // titular que trae, que es justo lo que quiere quien lo borra todo.
        headline: form!.headline
          .map((linea) => linea.trim())
          .filter(Boolean)
          .slice(0, LINEAS_TITULAR_MAX),
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

  const Pantalla = PANTALLAS[modulo];
  // La ficha del módulo abierto: qué cambia y en qué parte del sitio se ve.
  const activo = MODULOS.find((m) => m.id === modulo) ?? MODULOS[0];

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

      {/* Qué cambia el módulo abierto y en qué parte del sitio se ve. Va aquí y
          no dentro de cada pantalla porque la necesitan también los módulos que
          todavía son un `ModuloPendiente`: entrar al panel sin saber qué se está
          tocando es justamente lo que había antes. */}
      <p className="max-w-3xl rounded-2xl border border-mist bg-fog px-4 py-3 text-xs text-muted">
        <span className="font-display text-sm font-semibold text-ink">{activo.label} · </span>
        {activo.desc}
      </p>

      <Pantalla form={form} commit={commit} />


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