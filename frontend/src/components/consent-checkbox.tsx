import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * Casilla de autorización para el tratamiento de datos personales.
 *
 * Los cuatro formularios públicos del sitio (contacto, sugerencias del hero,
 * inscripción a talleres y boletín) piden nombre y correo. Eso es tratamiento de
 * datos personales, así que la Ley 1581 de 2012 exige una autorización expresa
 * del titular, informada, y el derecho a saber quién trata los datos y cómo
 * pedir su eliminación (artículos 4, 6 y 11).
 *
 * Dos decisiones que conviene no deshacer:
 *
 * 1. **No es un adorno.** El backend exige el campo igual, así que la casilla es
 *    una obligación real. El botón se deshabilita mientras no esté marcada, para
 *    que quien llena el formulario sepa por qué no se envía, en vez de descubrirlo
 *    leyendo un error 400 del servidor.
 *
 * 2. **El texto enlaza al Aviso de Privacidad.** Una autorización sin acceso al
 *    aviso al que dice autorizarse no cumple el requisito de "informada": el
 *    titular tiene que poder leer qué va a pasar con sus datos antes de marcar la
 *    casilla, no después.
 */
export function ConsentCheckbox({
  checked,
  onChange,
  /** Id del `<fieldset>` o del formulario, para que la etiqueta se asocie bien. */
  id,
  className,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-2.5", className)}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        // `required` sí va: para quien llegue por teclado sin pasar por el botón,
        // el navegador bloquea el envío con su propio mensaje. La validación real
        // es la del backend, esto solo evita un viaje de ida y vuelta.
        required
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-[var(--color-lime-ink)]"
      />
      <label htmlFor={id} className="text-[0.7rem] leading-snug text-muted sm:text-xs">
        Autorizo el tratamiento de mis datos personales para la finalidad
        descrita en el{" "}
        <Link to="/privacidad" className="font-semibold text-lime-ink underline">
          Aviso de Privacidad
        </Link>
        . Entiendo que puedo solicitar su eliminación en cualquier momento.
      </label>
    </div>
  );
}
