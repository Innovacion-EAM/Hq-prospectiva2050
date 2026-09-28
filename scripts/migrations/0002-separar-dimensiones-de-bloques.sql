-- ════════════════════════════════════════════════════════════════════════════
--  0002 — Separar las 4 dimensiones de análisis de los bloques de到一起
-- ════════════════════════════════════════════════════════════════════════════
--
--  CONTEXTO
--  El documento de arquitectura del proyecto define que el estudio tiene
--  "4 dimensiones de análisis: político-institucional, económico-productiva,
--  físico-ambiental y socio-cultural". Pero la tabla config_dimensiones
--  mezclaba esas 4 con 4 bloques que NO son dimensiones (misiones, retos,
--  iniciativas, hallazgos) y el sitio los trataba a todos igual: 8 tarjetas
--  del mismo tipo, sin que el visitante distinguiera cuáles son las
--  dimensiones reales.
--
--  QUÉ HACE
--  Añade `tipo` para poder distinguir el papel de cada fila en el sitio:
--    'dimension' → las 4 dimensiones de análisis del documento
--    'bloque'    → misiones, retos, iniciativas y hallazgos (contenido de apoyo)
--
--  Es idempotente: se puede volver a aplicar sin efectos.
-- ════════════════════════════════════════════════════════════════════════════

-- 1) La columna, si no existe.
ALTER TABLE config_dimensiones
  ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'dimension';

-- 2) Las 4 dimensiones de análisis del documento.
UPDATE config_dimensiones SET tipo = 'dimension'
 WHERE slug IN ('politico-institucional','economica-productiva','fisico-ambiental','socio-cultural');

-- 3) Los bloques de apoyo NO son dimensiones.
UPDATE config_dimensiones SET tipo = 'bloque'
 WHERE slug IN ('misiones','retos','iniciativas','hallazgos');

-- 4) Cualquier fila nueva nace como dimensión (comportamiento por defecto).
ALTER TABLE config_dimensiones ALTER COLUMN tipo SET DEFAULT 'dimension';

-- 5) Índice para filtrar por tipo sin recorrer la tabla.
CREATE INDEX IF NOT EXISTS idx_config_dimensiones_tipo
  ON config_dimensiones (tipo);

-- 6) Restringir a los dos únicos valores válidos, para que nadie meta basura.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_config_dimensiones_tipo') THEN
    ALTER TABLE config_dimensiones
      ADD CONSTRAINT ck_config_dimensiones_tipo
      CHECK (tipo IN ('dimension', 'bloque'));
  END IF;
END $$;
