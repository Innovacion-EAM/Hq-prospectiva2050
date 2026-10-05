-- Encabezado del sitio configurable desde Ajustes → Header.
--
-- Hasta ahora el logo (los textos al lado y el orden de los enlaces de
-- navegación) estaba escrito en el código del frontend. Pasa a la fila de
-- configuración del sitio, que es la que el backoffice ya editaba.
--
-- Las cuatro columnas van en `config_site` y no en una tabla aparte a propósito:
-- esa fila se siembra siempre (aunque la base esté vacía a propósito), así que el
-- encabezado nunca puede desaparecer por un borrado de contenido. Sin ella el
-- sitio se quedaría sin navegación, y no hay forma de arreglarlo desde el
-- backoffice porque no se puede entrar a él.

ALTER TABLE config_site ADD COLUMN IF NOT EXISTS logoUrl text NULL;
ALTER TABLE config_site ADD COLUMN IF NOT EXISTS logoTitulo varchar(200) NOT NULL DEFAULT '';
ALTER TABLE config_site ADD COLUMN IF NOT EXISTS logoSubtitulo varchar(300) NOT NULL DEFAULT '';
ALTER TABLE config_site ADD COLUMN IF NOT EXISTS "navLinks" jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Rellenar lo que ya existiera. Es idempotente: solo escribe donde el valor
-- está vacío, así que volver a aplicarla no pisa lo que se haya cambiado desde el
-- backoffice. El `NULLIF` de la lista evita meter un array vacío en una fila que
-- ya tenía enlaces, que dejaría el sitio sin navegación.
UPDATE config_site SET logoTitulo = 'Horizonte Quindío' WHERE logoTitulo = '';
UPDATE config_site SET logoSubtitulo = 'Prospectiva 2050' WHERE logoSubtitulo = '';
UPDATE config_site
SET "navLinks" = '[
  {"label":"Inicio","href":"/"},
  {"label":"El proyecto","href":"/proyecto"},
  {"label":"Dimensiones","href":"/dimensiones"},
  {"label":"Documentos","href":"/documentos"},
  {"label":"Noticias","href":"/noticias"},
  {"label":"Participa","href":"/participa"},
  {"label":"Contáctanos","href":"/contactos"}
]'::jsonb
WHERE "navLinks" = '[]'::jsonb OR "navLinks" IS NULL;