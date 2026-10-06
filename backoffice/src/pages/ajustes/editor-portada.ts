import type { PortadaSettings, SiteSettings } from "@/lib/types";

/**
 * Cómo se edita un campo suelto de la portada desde un módulo.
 *
 * `home` es un objeto de objetos: cambiar el fondo del hero tiene que rearmar
 * `home.hero` entero y devolverlo, o el resto de secciones se quedarían sin
 * guardar al pulsar el botón. Esa/arreglo con los mismos objetos del formulario
 * es justo lo que hace `editar()` con su `[seccion]: { ...form.home[seccion] }`.
 *
 * Vive en su propio archivo porque lo usan **todos** los módulos de la portada
 * —hero, proyecto, dimensiones, documentos, noticias, participa y contactos— y
 * por la forma del objeto no sale de uno solo.
 *
 * El tipo genérico obliga a que la clave y el campo sean los mismos a la vez: si
 * se pasa `editar("proyecto", "fondo")` sigue compilando, pero
 * `editar("hero", "proyectoTexto")` no, que es el error que el compilador
 * atrapa en vez de mandar un campo que el backend rechaza.
 */
export type EditarPortada = <C extends keyof PortadaSettings>(
  seccion: C,
  campo: keyof PortadaSettings[C],
  valor: PortadaSettings[C][typeof campo],
) => void;

export function useEditarPortada(
  form: SiteSettings,
  commit: (patch: Partial<SiteSettings>) => void,
): EditarPortada {
  return function editar<C extends keyof PortadaSettings>(
    seccion: C,
    campo: keyof PortadaSettings[C],
    valor: PortadaSettings[C][typeof campo],
  ) {
    commit({
      home: {
        ...form.home,
        [seccion]: { ...form.home[seccion], [campo]: valor },
      },
    });
  };
}
