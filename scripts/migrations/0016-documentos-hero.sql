-- El hero de la página «Documentos» (/documentos), editable desde
-- Ajustes → Documentos.
--
-- Antes, la página mostraba textos escritos en el código del frontend: el
-- titular «Repositorio de documentos» y la bajada «Convenios, informes…»
-- salían del código y no había forma de cambiarlos desde el panel. Ahora viven
-- en `home.elDocumentos`:
--
--   - `fondo`: la imagen que encabeza la página. `null` = la que trae el sitio,
--     por el mismo criterio que el resto de la portada (ver `VacioEnPortada` en
--     el backend).
--   - `titulo` e `intro`: el titular y la bajada del hero. Aquí **sí** se
--     editan, a diferencia de los rótulos fijos de la portada: son el
--     encabezado de la página, no parte del diseño.
--
-- Como en 0009, 0010 y 0011: `home` ya es columna `jsonb`, así que no hay
-- `ALTER TABLE`; el script solo rellena. Es idempotente —solo escribe donde
-- `elDocumentos` aún no existe—, así que aplicarla dos veces no pisa lo que se
-- haya cambiado desde el panel, y una base recién sembrada ya lo trae en la
-- semilla (`SEED_HOME.elDocumentos`).

UPDATE config_site
SET "home" = jsonb_set(
  "home",
  '{elDocumentos}',
  jsonb_build_object(
    'fondo', NULL,
    'titulo', 'Repositorio de documentos',
    'intro', 'Convenios, informes, memorias, boletines y piezas de socialización del proceso, con autor, alcance territorial y formato de cada documento.'
  )
)
WHERE ("home" #>> '{elDocumentos}') IS NULL
   OR ("home" #>> '{elDocumentos}') = '';
