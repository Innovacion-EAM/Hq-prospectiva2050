/**
 * Los doce municipios del departamento del Quindío.
 *
 * El documento de arquitectura pide que la participación sea representativa de
 * todo el departamento, no solo de Armenia. La lista es cerrada y vive aquí,
 * en un solo sitio, para que el formulario de participación y la sección de
 * cobertura territorial nunca se desincronicen.
 *
 * Orden alfabético, que es como se leen los listados oficiales.
 */
export const MUNICIPIOS_QUINDIO = [
  "Armenia",
  "Buenavista",
  "Calarcá",
  "Circasia",
  "Córdoba",
  "Filandia",
  "Génova",
  "La Tebaida",
  "Montenegro",
  "Pijao",
  "Quimbaya",
  "Salento",
] as const;

export type MunicipioQuindio = (typeof MUNICIPIOS_QUINDIO)[number];
