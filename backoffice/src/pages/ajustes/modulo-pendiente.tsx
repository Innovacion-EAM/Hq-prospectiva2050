import { ModuloCard } from "./nav-links-editor";

/**
 * Pantalla de un módulo que todavía no edita nada.
 *
 * Los módulos de Ajustes se fueron abriendo de uno en uno, y en varios casos
 * queda por decidir qué se edita en ellos. Este componente es el sitio donde
 * dejar esa pregunta escrita en la pantalla en vez de dejar un espacio vacío:
 * un módulo sin nada dentro parece roto o olvidado, y quien lo abra no sabe si
 * se perdió algo o si nunca hubo nada.
 *
 * Mientras tanto **lo editable sigue en su sitio**, en el módulo que lo tenía
 * (Home, y los datos de contacto y redes en Contáctanos y Footer). Nada se saca
 * de un módulo que funciona para meterlo en uno vacío.
 *
 * Cuando toque implementarlo, se borra esto y se llama al componente real desde
 * `PANTALLAS` en `AjustesPage`.
 */
export function ModuloPendiente({
  bloque,
  detalle,
}: {
  /** El bloque del sitio al que corresponde, para situarlo. */
  bloque: string;
  /** Qué se edita en ese bloque del sitio, y por qué no hay campos aquí. */
  detalle: string;
}) {
  return (
    <div className="space-y-6">
      <ModuloCard titulo={bloque}>
        <p className="text-sm text-muted">
          Este módulo todavía no edita nada: está reservado para{" "}
          <span className="font-semibold text-ink">{bloque}</span> y queda por
          decidir qué se cambia desde aquí.
        </p>
        <p className="text-xs text-muted">{detalle}</p>
        <p className="text-xs text-muted">
          Mientras tanto, lo que sí se editaba de este bloque sigue donde
          estaba, en el módulo <span className="font-semibold text-ink">Home</span>.
          No se movió nada: un módulo vacío no es razón para vaciar otro.
        </p>
      </ModuloCard>
    </div>
  );
}
