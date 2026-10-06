import { useLayoutEffect, useRef } from "react";
import { Field, Input } from "@/components/ui";
import { formatearTelefono, hrefDeTelefono } from "@/lib/telefono";

/**
 * El campo de teléfono de los ajustes.
 *
 * Antes, para que el número se viera como el resto de la página —`+57 310 565
 * 6351` y no `+573105656351`— había que **meterse los espacios a mano**, y
 * además los dígitos no eran el único lugar donde estaba el número: había un
 * segundo campo para el `tel:` del enlace y había que acordarse de cambiarlo a
 * la vez.
 *
 * Este campo hace las dos cosas por quien edita:
 *
 *  - el número se agrupa solo mientras se escribe (las reglas están en
 *    `lib/telefono.ts` y no tocan ni un dígito), y
 *  - con cada cambio entrega también el `telefonoHref` del mismo número, ya
 *    formado, para que no haya manera de cambiar uno y dejar el otro viejo.
 *
 * El cursor se deja tras el mismo número de dígitos que había al teclear: el
 * formateo mueve los espacios, y sin aviso el navegador mandaría el cursor al
 * final del campo.
 */
export function CampoTelefono({
  valor,
  hrefActual,
  onChange,
  etiqueta = "Teléfono",
  hint,
}: {
  valor: string;
  hrefActual: string;
  onChange: (telefono: string, telefonoHref: string) => void;
  etiqueta?: string;
  hint?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  // Cuántos dígitos había delante del cursor cuando se tecleó. Se mira tras el
  // render para devolver el cursor a su sitio una vez el formateo ya tocó el
  // valor; `null` = no hay nada que corregir.
  const digitosTrasElCursor = useRef<number | null>(null);

  useLayoutEffect(() => {
    const pendiente = digitosTrasElCursor.current;
    digitosTrasElCursor.current = null;
    const nodo = ref.current;
    if (pendiente === null || !nodo) return;

    // Buscar la posición que deja delante el mismo número de dígitos que había
    // al teclear: si quien edita estaba tras el quinto dígito, que siga ahí.
    let pos: number;
    if (pendiente === 0) {
      // El cursor estaba antes de cualquier dígito: se deja tras el signo `+`
      // si lo hay, no delante de él.
      pos = 0;
      while (pos < nodo.value.length && !/\d/.test(nodo.value[pos])) pos++;
    } else {
      pos = nodo.value.length;
      let vistos = 0;
      for (let i = 0; i < nodo.value.length; i++) {
        if (/\d/.test(nodo.value[i])) vistos++;
        if (vistos === pendiente) {
          pos = i + 1;
          break;
        }
      }
    }
    if (nodo.selectionStart !== pos) nodo.setSelectionRange(pos, pos);
  });

  return (
    <Field label={etiqueta} hint={hint}>
      <Input
        ref={ref}
        value={valor}
        inputMode="tel"
        autoComplete="tel"
        placeholder="+57 310 565 6351"
        onChange={(e) => {
          const el = e.currentTarget;
          const formateado = formatearTelefono(el.value);
          // Si el formateo no cambió nada, el campo ya está como debe y el
          // navegador dejó el cursor donde corresponde; no hay nada que enviar.
          if (formateado !== valor) {
            digitosTrasElCursor.current = el.value
              .slice(0, el.selectionStart ?? el.value.length)
              .replace(/\D/g, "").length;
            onChange(formateado, hrefDeTelefono(formateado, hrefActual));
          }
        }}
      />
    </Field>
  );
}