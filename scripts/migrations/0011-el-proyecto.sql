-- La página «El proyecto» (/proyecto), editable desde Ajustes → El proyecto.
--
-- Antes, la página mostraba textos escritos en el código del frontend: el
-- titular «Una visión compartida para el Quindío», el hero, los dos párrafos y
-- las tres etapas salían del código; la caja lima de CEPAL estaba fija al final
-- y la lista de aliadas venía de su propia tabla (`config_entidades`) con una
-- pantalla aparte en el panel. Todo eso pasa a `home.elProyecto`:
--
--   - `fondo`, `titulo`, `intro`, `parrafoUno` y `parrafoDos`: el hero y el
--     cuerpo de la página, iguales a los que ya mostraba la página.
--   - `etapas`: las tres etapas del diseño, en orden (el «01/02/03» lo pone el
--     diseño, no el dato).
--   - `entidades`: la lista que hoy sale de `config_entidades` (sin las
--     borradas, en el orden que ya tenía la pantalla) **más** la caja lima de
--     CEPAL, que deja de estar escrita en el código y pasa a ser un ítem más de
--     la lista —siempre al final aquí, que es donde estaba—. `/contactos`
--     muestra la misma lista como «Red institucional».
--
-- Como en 0009 y 0010: `home` ya es columna `jsonb`, así que no hay `ALTER
-- TABLE`; el script solo rellena. Es idempotente —solo escribe donde
-- `elProyecto` aún no existe—, así que aplicarla dos veces no pisa lo que se
-- haya cambiado desde el panel, y una base recién sembrada ya lo trae en la
-- semilla (`SEED_HOME.elProyecto`), para la que una portada vieja de más de
-- treinta entradas hereda la lista real y no una inventada.

UPDATE config_site
SET "home" = jsonb_set(
  "home",
  '{elProyecto}',
  jsonb_build_object(
    -- `null` = la imagen que trae el sitio (mismo criterio que el resto de la
    -- portada, ver `VacioEnPortada` en el backend).
    'fondo', NULL,
    'titulo', 'Una visión compartida para el Quindío',
    'intro', 'Catorce entidades del departamento y la CEPAL construyen, entre 2026 y 2027, la hoja de ruta al 2050.',
    'parrafoUno', 'Horizonte Quindío es un ejercicio de prospectiva territorial. No predice el futuro: lo acuerda. Parte del diagnóstico de capacidades, construye escenarios con la gente del departamento e institucionaliza un observatorio para que la visión sobreviva a los ciclos políticos.',
    'parrafoDos', 'El 24 de marzo de 2026 se presentó en la Universidad del Quindío, con el acompañamiento del ILPES-CEPAL. Es el primer ejercicio de este tipo en el departamento en más de veinte años.',
    'etapas', jsonb_build_array(
      'Diagnóstico y diseño metodológico',
      'Escenarios y visión compartida',
      'Institucionalización y observatorio'
    ),
    'entidades', COALESCE(
      (SELECT jsonb_agg(nombre ORDER BY id) FROM config_entidades WHERE eliminado_at IS NULL),
      '[]'::jsonb
    ) || '["CEPAL — ILPES (acompañamiento técnico)"]'::jsonb
  )
)
WHERE ("home" #>> '{elProyecto}') IS NULL
   OR ("home" #>> '{elProyecto}') = '';