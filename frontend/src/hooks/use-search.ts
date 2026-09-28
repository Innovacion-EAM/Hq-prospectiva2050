import { useCallback, useEffect, useState } from "react";
import { fetchDocumentos, fetchNoticias, type ApiDocumento, type ApiNoticia } from "@/lib/api";
import type { SearchHit } from "@/data/site";
import { useSite } from "@/data/site-context";

export type SearchKind = "Noticia" | "Documento" | "Proyecto" | "Dimensión" | "Documentos" | "Taller";

type Hit = Omit<SearchHit, "kind"> & { kind: SearchKind };

/** Normaliza para comparar sin tildes ni mayúsculas: "Diagnostico" debe hallar
 *  "Diagnóstico", que es como lo escribe la gente en el buscador. */
function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function coincide(campos: (string | null | undefined)[], q: string): boolean {
  return campos.some((c) => (c ? normalizar(c).includes(q) : false));
}

const LIMITE = 15;

/**
 * Búsqueda interna del sitio.
 *
 * Antes solo buscaba sobre el bundle del sitio (páginas, dimensiones, categorías
 * y talleres), así que las noticias y los documentos —que son el contenido
 * principal— no aparecían nunca. El documento de arquitectura pide que la
 * búsqueda abarque noticias y documentos.
 */
export function useSearch() {
  const site = useSite();
  const [noticias, setNoticias] = useState<ApiNoticia[]>([]);
  const [documentos, setDocumentos] = useState<ApiDocumento[]>([]);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    let vivo = true;
    // Se traen una sola vez y se cachean: el buscador no debe pegar a la API
    // en cada tecla.
    Promise.all([
      fetchNoticias({ perPage: 200 }).then((r) => r.data).catch(() => []),
      fetchDocumentos().then((r) => r.data).catch(() => []),
    ])
      .then(([n, d]) => {
        if (!vivo) return;
        setNoticias(n);
        setDocumentos(d);
        setCargado(true);
      })
      .catch(() => {
        if (vivo) setCargado(true);
      });
    return () => {
      vivo = false;
    };
  }, []);

  return useCallback(function buscar(texto: string): Hit[] {
    const q = normalizar(texto.trim());
    if (q.length < 2) return [];

    const terminos = q.split(/\s+/).filter(Boolean);
    const cumple = (campos: (string | null | undefined)[]) =>
      terminos.every((t) => normalizar(campos.filter(Boolean).join(" ")).includes(t));

    const salida: Hit[] = [];

    for (const n of noticias) {
      if (
        cumple([
          n.titulo,
          n.resumen,
          n.categoria,
          n.autor,
          ...(n.etiquetas ?? []),
          ...(Array.isArray(n.contenido) ? n.contenido : []),
        ])
      ) {
        salida.push({
          href: `/noticias/${n.slug}`,
          title: n.titulo,
          kind: "Noticia",
          excerpt: n.resumen || n.categoria,
        });
      }
    }

    for (const d of documentos) {
      if (cumple([d.titulo, d.autor, d.tipo, d.delimitacion, d.formato])) {
        salida.push({
          href: `/documento/${d.id}`,
          title: d.titulo,
          kind: "Documento",
          excerpt: [d.autor, d.tipo, d.formato].filter(Boolean).join(" · "),
        });
      }
    }

    for (const h of site.searchSite(texto)) {
      salida.push(h as Hit);
    }

    // Noticias y documentos primero: son lo que la gente suele buscar.
    const peso: Record<SearchKind, number> = {
      Noticia: 0,
      Documento: 1,
      Proyecto: 2,
      Dimensión: 3,
      Documentos: 4,
      Taller: 5,
    };
    return salida
      .sort((a, b) => (peso[a.kind] ?? 9) - (peso[b.kind] ?? 9))
      .slice(0, LIMITE);
  }, [noticias, documentos, site]);
}

export function useSearchShortcut(onOpen: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const enCampo =
        e.target instanceof HTMLElement &&
        (e.target.tagName === "INPUT" ||
          e.target.tagName === "TEXTAREA" ||
          e.target.isContentEditable);
      // "/" abre el buscador, como en la mayoría de sitios de documentación.
      if (e.key === "/" && !enCampo) {
        e.preventDefault();
        onOpen();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpen]);
}
