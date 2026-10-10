-- ════════════════════════════════════════════════════════════════════════════
--  0015 — Rótulos editables para las listas «retos» y «líneas» de cada fila
-- ════════════════════════════════════════════════════════════════════════════
--
--  CONTEXTO
--  En el sitio, `steps` y `layers` se pintaban siempre con dos rótulos fijos:
--  «Retos principales» y «Líneas de trabajo». Eso vale para las 4 dimensiones
--  de análisis, pero no para los bloques de apoyo: en «Misiones del proceso»
--  los `steps` son las misiones, y en «Retos priorizados» los `steps` son los
--  criterios con los que se priorizan. Resultado: contenido que se editaba en
--  el backoffice aparecía bajo un encabezado que no le correspondía.
--
--  QUÉ HACE
--  1) Añade dos columnas de texto (`steps_label`, `layers_label`) para que cada
--     fila nombre sus propias listas. Las edita la barra lateral → Dimensiones.
--  2) Rellena con un rótulo que encaja con el contenido actual de producción.
--     Solo toca filas sin rótulo, así que no pisa ediciones hechas a mano.
--
--  Es idempotente: `ADD COLUMN IF NOT EXISTS` y los `UPDATE` van condicionados
--  a `IS NULL`, por lo que se puede correr las veces que haga falta.
-- ════════════════════════════════════════════════════════════════════════════

ALTER TABLE config_dimensiones ADD COLUMN IF NOT EXISTS steps_label  text;
ALTER TABLE config_dimensiones ADD COLUMN IF NOT EXISTS layers_label text;

-- Bloques de apoyo del home (contenido real en producción):
UPDATE config_dimensiones SET steps_label  = 'Misiones'
  WHERE steps_label  IS NULL AND slug = 'misiones';
UPDATE config_dimensiones SET layers_label = 'Fases del proceso'
  WHERE layers_label IS NULL AND slug = 'misiones';

UPDATE config_dimensiones SET steps_label  = 'Criterios de priorización'
  WHERE steps_label  IS NULL AND slug = 'retos';
UPDATE config_dimensiones SET layers_label = 'Tipos de retos'
  WHERE layers_label IS NULL AND slug = 'retos';

UPDATE config_dimensiones SET steps_label  = 'Ciclo de la iniciativa'
  WHERE steps_label  IS NULL AND slug = 'iniciativas';
UPDATE config_dimensiones SET layers_label = 'Frentes de trabajo'
  WHERE layers_label IS NULL AND slug = 'iniciativas';

UPDATE config_dimensiones SET steps_label  = 'Ruta del análisis'
  WHERE steps_label  IS NULL AND slug = 'hallazgos';
UPDATE config_dimensiones SET layers_label = 'Escalas'
  WHERE layers_label IS NULL AND slug = 'hallazgos';
