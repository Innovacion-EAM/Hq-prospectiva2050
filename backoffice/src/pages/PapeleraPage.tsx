import { useCallback, useEffect, useState } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { collections, type Crud } from "@/lib/data";
import { toast } from "sonner";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  PageHeader,
  Spinner,
} from "@/components/ui";
import { formatFechaLocal } from "@/lib/utils";

type ConBorradoLogico = { eliminadoAt?: string | null };

/**
 * Cada modulo expone su propia etiqueta y su funcion para sacar un titulo legible
 * del registro: las noticias y los documentos tienen un campo `titulo`, las
 * dimensiones un `title`, y asi sucesivamente. Sin esto la papelera mostraria
 * una lista de "sin nombre" imposible de distinguir.
 */
type Modulo = {
  clave: string;
  etiqueta: string;
  crud: Crud<ConBorradoLogico>;
  tituloDe: (item: ConBorradoLogico) => string;
  subtituloDe?: (item: ConBorradoLogico) => string;
};

function textoDe(item: Record<string, unknown>, ...claves: string[]): string {
  for (const clave of claves) {
    const valor = item[clave];
    if (typeof valor === "string" && valor.trim()) return valor.trim();
  }
  return "";
}

const MODULOS: Modulo[] = [
  {
    clave: "noticias",
    etiqueta: "Noticias",
    crud: collections.noticias() as Crud<ConBorradoLogico>,
    tituloDe: (i) => textoDe(i as never, "titulo"),
    subtituloDe: (i) => textoDe(i as never, "categoria", "autor"),
  },
  {
    clave: "documentos",
    etiqueta: "Documentos",
    crud: collections.documentos() as Crud<ConBorradoLogico>,
    tituloDe: (i) => textoDe(i as never, "titulo"),
    subtituloDe: (i) => textoDe(i as never, "categoria", "formato"),
  },
  {
    clave: "convocatorias",
    etiqueta: "Convocatorias",
    crud: collections.convocatorias() as Crud<ConBorradoLogico>,
    tituloDe: (i) => textoDe(i as never, "titulo"),
    subtituloDe: (i) => textoDe(i as never, "estado", "categoria"),
  },
  {
    clave: "dimensiones",
    etiqueta: "Dimensiones y bloques",
    crud: collections.dimensiones() as Crud<ConBorradoLogico>,
    tituloDe: (i) => textoDe(i as never, "title", "nombre"),
    subtituloDe: (i) => textoDe(i as never, "short"),
  },
  {
    clave: "municipios",
    etiqueta: "Municipios",
    crud: collections.municipios() as Crud<ConBorradoLogico>,
    tituloDe: (i) => textoDe(i as never, "nombre"),
    subtituloDe: (i) => textoDe(i as never, "dato"),
  },
  {
    clave: "talleres",
    etiqueta: "Talleres",
    crud: collections.talleres() as Crud<ConBorradoLogico>,
    tituloDe: (i) => textoDe(i as never, "titulo", "nombre"),
    subtituloDe: (i) => textoDe(i as never, "lugar", "fecha"),
  },
  {
    clave: "categorias",
    etiqueta: "Categorías de documentos",
    crud: collections.categorias() as Crud<ConBorradoLogico>,
    tituloDe: (i) => textoDe(i as never, "nombre"),
  },
  {
    clave: "pags",
    etiqueta: "Páginas del proyecto",
    crud: collections.paginas() as Crud<ConBorradoLogico>,
    tituloDe: (i) => textoDe(i as never, "title", "nombre"),
    subtituloDe: (i) => textoDe(i as never, "slug"),
  },
  {
    clave: "stats",
    etiqueta: "Cifras destacadas",
    crud: collections.stats() as Crud<ConBorradoLogico>,
    tituloDe: (i) => textoDe(i as never, "label", "valor"),
    subtituloDe: (i) => textoDe(i as never, "value"),
  },
];

type Estado = { cargando: boolean; items: ConBorradoLogico[]; error: string | null };

export default function PapeleraPage() {
  const [porModulo, setPorModulo] = useState<Record<string, Estado>>({});
  const [restaurando, setRestaurando] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const resultados = await Promise.all(
      MODULOS.map(async (modulo) => {
        try {
          const items = (await modulo.crud.trashed?.()) ?? [];
          return [modulo.clave, { cargando: false, items, error: null }] as const;
        } catch (error) {
          const mensaje =
            error instanceof Error ? error.message : "No se pudo consultar la papelera";
          return [modulo.clave, { cargando: false, items: [], error: mensaje }] as const;
        }
      }),
    );
    setPorModulo(Object.fromEntries(resultados));
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const restaurar = useCallback(
    async (modulo: Modulo, item: ConBorradoLogico) => {
      const id = (item as unknown as { id: number }).id;
      setRestaurando(`${modulo.clave}-${id}`);
      try {
        await modulo.crud.restore?.(id);
        toast.success(`Restaurado en ${modulo.etiqueta.toLowerCase()}`);
        await cargar();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "No se pudo restaurar");
      } finally {
        setRestaurando(null);
      }
    },
    [cargar],
  );

  const total = MODULOS.reduce(
    (suma, modulo) => suma + (porModulo[modulo.clave]?.items.length ?? 0),
    0,
  );
  const cargandoAlgo = MODULOS.some((m) => porModulo[m.clave]?.cargando);
  const hayCarga = Object.keys(porModulo).length === 0 || cargandoAlgo;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Papelera"
        description="Nada se borra de forma definitiva: lo que se elimina desde el panel queda aquí y se puede devolver al sitio. Los archivos de la galería sí se borran del disco."
      />

      {hayCarga ? (
        <div className="py-16">
          <Spinner />
        </div>
      ) : total === 0 ? (
        <EmptyState
          title="La papelera está vacía"
          description="Cuando elimines una noticia, un documento o una dimensión, aparecerá aquí para poder restaurarlo."
        />
      ) : (
        <p className="text-sm text-muted">
          {total} {total === 1 ? "registro dado de baja" : "registros dados de baja"}.
        </p>
      )}

      <div className="space-y-5">
        {MODULOS.filter((modulo) => (porModulo[modulo.clave]?.items.length ?? 0) > 0).map(
          (modulo) => {
            const estado = porModulo[modulo.clave];
            const items = estado?.items ?? [];
            return (
              <Card key={modulo.clave}>
                <CardBody className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Trash2 className="size-4 text-muted" />
                    <h2 className="font-display text-sm font-bold text-ink">
                      {modulo.etiqueta}
                    </h2>
                    <Badge tone="rose">{items.length}</Badge>
                  </div>

                  {estado?.error ? (
                    <p className="text-xs text-rose-700">{estado.error}</p>
                  ) : null}

                  <ul className="divide-y divide-fog">
                    {items.map((item) => {
                      const id = (item as unknown as { id: number }).id;
                      const claveCargando = `${modulo.clave}-${id}`;
                      const titulo = modulo.tituloDe(item) || `Registro #${id}`;
                      const subtitulo = modulo.subtituloDe?.(item);
                      return (
                        <li
                          key={claveCargando}
                          className="flex flex-wrap items-center justify-between gap-3 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-ink">{titulo}</p>
                            <p className="text-xs text-muted">
                              {subtitulo ? `${subtitulo} · ` : ""}
                              Baja: {item.eliminadoAt ? formatFechaLocal(item.eliminadoAt) : "sin fecha"}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={restaurando === claveCargando}
                            onClick={() => void restaurar(modulo, item)}
                          >
                            <RotateCcw className="size-4" />
                            {restaurando === claveCargando ? "Restaurando…" : "Restaurar"}
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                </CardBody>
              </Card>
            );
          },
        )}
      </div>
    </div>
  );
}
