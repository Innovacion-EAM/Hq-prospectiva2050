/**
 * Cómo se ven los teléfonos escritos en el panel.
 *
 * Existe porque antes había que **meter los espacios a mano** para que el número
 * se viera como el resto de la página: se escribía `+573105656351` y había que
 * ir poniendo espacios en los huecos para que saliera `+57 310 565 6351`. Se
 * cambia una letra y había que acordarse de dejar los espacios donde estaban.
 * Ahora el número se agrupa solo mientras se escribe.
 *
 * La regla es **no tocar ni un dígito**: el formato solo decide dónde van los
 * espacios y si va o no el `+`. Quitar o añadir dígitos sería inventar datos —
 * desaparecería un cero de un número de país, o aparecería— y el sitio
 * mostraría algo distinto de lo que se marcó. Los dígitos que salen son
 * exactamente los que se escribieron.
 */

/** Dígitos de un número, sin nada que no sea un dígito. */
function soloDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

/**
 * El número con los espacios ya puestos.
 *
 * Los tres formatos que se pueden encontrar, y por qué cada uno:
 *
 *  - `+57 310 565 6351` — `+57` seguido de diez dígitos (el móvil de ejemplo del
 *    sitio). El `57` se separa del resto porque el `+` delante dice que es
 *    código de país.
 *  - `310 565 6351` — diez dígitos sin prefijo, tal cual se marcan aquí.
 *  - `601 1234` — siete dígitos, un fijo en la región.
 *
 * Todo lo demás se agrupa de tres en tres desde la izquierda, y si el último
 * grupo se queda con un solo dígito se le da el anterior: sin eso, `3105656351`
 * saldría `310 565 635 1` en lugar de `310 565 6351`. Esas dos reglas solas son
 * las que producen los tres formatos de arriba; no hay una lista de casos.
 *
 * El `+57` se reconoce también sin el `+` cuando el número tiene exactamente
 * doce o nueve dígitos, que es la única manera de que `57` al principio de un
 * número colombiano sea el país y no parte del número.
 */
export function formatearTelefono(valor: string): string {
  const empezabaConMas = /^\s*\+/.test(valor);
  const digitos = soloDigitos(valor);

  // El `57` solo se separa si ahí sigue: ver arriba. Se mira `length > 2` para
  // que escribiendo `+57` delante ya se abra hueco, sin esperar a los diez.
  const esPais57 =
    digitos.startsWith("57") &&
    (digitos.length === 9 || digitos.length === 12 || (empezabaConMas && digitos.length > 2));

  let prefijo = "";
  let cuerpo = digitos;
  if (esPais57) {
    prefijo = "+57 ";
    cuerpo = digitos.slice(2);
  } else if (empezabaConMas) {
    // Un `+` de un país que no es el 57. El signo no es un dígito, pero es la
    // diferencia entre `tel:120255501234` y `tel:+120255501234`: sin él se
    // marca como número local.
    prefijo = "+";
  }

  if (!cuerpo) return prefijo.trimEnd();

  const grupos: string[] = [];
  for (let i = 0; i < cuerpo.length; i += 3) grupos.push(cuerpo.slice(i, i + 3));

  // Se acaba de comprobar que hay al menos dos grupos y que el último tiene un
  // solo dígito, así que `pop` no puede venir vacío; el `?? ""` es solo para
  // que TypeScript no discuta.
  if (grupos.length > 1 && grupos[grupos.length - 1].length === 1) {
    const suelto = grupos.pop() ?? "";
    grupos[grupos.length - 1] += suelto;
  }

  return prefijo + grupos.join(" ");
}

/**
 * El `tel:` del mismo número: los dígitos con el `+` si lo traía puesto.
 *
 * Los dos campos existían porque lo que se **ve** y lo que se **marca** no tienen
 * por qué escribirse igual —`+57 310 565 6351` a la vista, `tel:+573105656351`
 * en el enlace—. Pero con el formato resuelto automáticamente, el segundo ya no
 * es algo que haya que teclear: es el primero sin espacios. Tenlo aparte y el
 * error de siempre, que es cambiar uno y no el otro, y quedarse con el número
 * viejo marcando.
 *
 * `hrefActual` se devuelve tal cual si el teléfono no tiene **ningún dígito**.
 * `tel:` solo no marca nada y rompería el botón; un teléfono vacío ya es un
 * problema, pero no hace falta empeorarlo con un enlace a ninguna parte.
 */
export function hrefDeTelefono(telefono: string, hrefActual: string): string {
  const digitos = soloDigitos(telefono);
  if (!digitos) return hrefActual;
  return `tel:${telefono.trimStart().startsWith("+") ? "+" : ""}${digitos}`;
}
