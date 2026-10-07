import type { LegalSettings } from "./types";

/**
 * Datos legales en blanco, para arrancar el formulario del módulo "Legal".
 *
 * La fila de configuración puede llegar sin `legal` (instalaciones anteriores a
 * que existiera la columna) o con campos sueltos a `null`. Este objeto da a los
 * `Input` un valor de cadena con el que trabajar, igual que `PORTADA_VACIA` hace
 * con la portada.
 *
 * Todos los valores son cadenas vacías y ese vacío es un estado con significado:
 * en el sitio público se ve como un marcador <PENDIENTE>, no como texto en
 * blanco. No es lo mismo que un campo «sin rellenar por error».
 */
export const LEGAL_VACIO: LegalSettings = {
  responsable: "",
  nit: "",
  direccion: "",
  ciudad: "",
  correoArco: "",
  plazoConservacion: "",
  quienesAcceden: "",
  actualizado: "",
};