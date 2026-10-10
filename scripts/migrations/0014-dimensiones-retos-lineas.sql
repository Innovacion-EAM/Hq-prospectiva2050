-- ════════════════════════════════════════════════════════════════════════════
--  0014 — Repartir el texto de las dimensiones en análisis / retos / líneas
-- ════════════════════════════════════════════════════════════════════════════
--
--  CONTEXTO
--  En algunas bases, el texto de cada dimensión quedó pegado dentro de `body`
--  como párrafos planos: el análisis, el rótulo «RETOS PRINCIPALES» con sus
--  viñetas «•», el rótulo «LÍNEAS DE TRABAJO» y sus viñetas. El sitio no usa
--  `body` para todo eso: pinta `body` como análisis, `steps` como retos y
--  `layers` como líneas de trabajo, así que el contenido terminaba mostrándose
--  como texto corrido (y duplicado en la ficha).
--
--  QUÉ HACE
--  1) Para cada fila cuyo `body` todavía tenga los rótulos, reparte su contenido
--     en los tres campos que sí usa el sitio:
--       body   → los párrafos previos al rótulo de retos (el análisis)
--       steps  → las viñetas entre «RETOS PRINCIPALES» y «LÍNEAS DE TRABAJO»
--       layers → las viñetas posteriores a «LÍNEAS DE TRABAJO»
--     Las viñetas pierden el «•» inicial.
--  2) Corrige `tipo`: misiones, retos, iniciativas y hallazgos son bloques de
--     apoyo, no dimensiones de análisis (venían como 'dimension' de una carga
--     vieja; la migración 0002 no llegó a ejecutarse en producción).
--
--  Es idempotente: solo actúa sobre filas que aún tienen el rótulo dentro de
--  `body`; después de correrla, `body` ya no los contiene.
-- ════════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  r        RECORD;
  elems    text[];
  e        text;
  c        text;
  fase     int;
  analisis text[] := ARRAY[]::text[];
  retos    text[] := ARRAY[]::text[];
  lineas   text[] := ARRAY[]::text[];
BEGIN
  FOR r IN
    SELECT id, body
    FROM config_dimensiones
    WHERE eliminado_at IS NULL
      AND EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(body) AS x
            WHERE upper(btrim(x, E' \t\n\r')) = 'RETOS PRINCIPALES'
          )
      AND EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(body) AS x
            WHERE upper(btrim(x, E' \t\n\r')) = 'LÍNEAS DE TRABAJO'
          )
  LOOP
    SELECT array_agg(value ORDER BY ord)
      INTO elems
      FROM jsonb_array_elements_text(r.body) WITH ORDINALITY AS t(value, ord);

    IF elems IS NULL THEN
      CONTINUE;
    END IF;

    analisis := ARRAY[]::text[];
    retos    := ARRAY[]::text[];
    lineas   := ARRAY[]::text[];
    fase     := 0;

    FOREACH e IN ARRAY elems LOOP
      c := upper(btrim(e, E' \t\n\r'));

      IF c = 'RETOS PRINCIPALES' THEN
        fase := 1;
        CONTINUE;
      ELSIF c = 'LÍNEAS DE TRABAJO' THEN
        fase := 2;
        CONTINUE;
      END IF;

      IF fase = 0 THEN
        analisis := analisis || btrim(e, E' \t\n\r');
      ELSIF fase = 1 THEN
        retos := retos || btrim(ltrim(e, E' \t\n\r•·-–—'), E' \t\n\r');
      ELSE
        lineas := lineas || btrim(ltrim(e, E' \t\n\r•·-–—'), E' \t\n\r');
      END IF;
    END LOOP;

    UPDATE config_dimensiones
    SET body = to_jsonb(analisis),
        layers = to_jsonb(lineas),
        steps = COALESCE(
          (
            SELECT jsonb_agg(
                     jsonb_build_object('n', lpad(rn::text, 2, '0'), 'title', t)
                     ORDER BY rn
                   )
            FROM unnest(retos) WITH ORDINALITY AS u(t, rn)
          ),
          '[]'::jsonb
        )
    WHERE id = r.id;
  END LOOP;
END $$;

-- Los bloques de apoyo no son dimensiones de análisis.
UPDATE config_dimensiones
SET tipo = 'bloque'
WHERE tipo <> 'bloque'
  AND slug IN ('misiones', 'retos', 'iniciativas', 'hallazgos');
