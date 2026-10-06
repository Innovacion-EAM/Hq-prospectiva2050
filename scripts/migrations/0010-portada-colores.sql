-- Colores de los botones de la portada, editables desde Ajustes → Home.
--
-- Antes de este script el color solo era cosa del botón del hero; el resto de
-- botones de la portada iba con el color escrito en el código del frontend
-- (`bg-lime` en casi todos, tinta en el bloque de contacto). Con esto, cada
-- botón tiene su campo y quien edita elige de una lista cerrada.
--
-- No hace falta `ALTER TABLE`: `home` ya es una columna `jsonb`, así que un campo
-- nuevo es una clave nueva dentro del objeto. Por eso este script solo rellena.
--
-- Los valores de abajo **no son una elección**, son los colores con los que los
-- botones estaban escritos en el código, para que al abrir el panel no se cambie
-- nada de lo que se ve sin que nadie lo haya pedido. Y por eso `contacto` va en
-- `tinta` y no en `lima` como los demás.
--
-- Idempotente, sección por sección: cada `UPDATE` solo escribe los campos que
-- **no** existen (`jsonb_strip_nulls` se queda lo que sí estaba), así que
-- aplicarla dos veces no pisa lo que se haya cambiado desde el panel y aplicarla
-- sobre una portada ya guardada deja los colores que ya tuviera.
--
-- Una sentencia por sección y no una sola con siete `jsonb_set` anidados porque
-- anidados hay que contarlos de derecha a izquierda y no se puede ver de un
-- vistazo qué campo escribe cuál. Y `jsonb_set` sobre una sección que no exista
-- no hace nada (no crea los niveles intermedios), mientras que
-- `jsonb_set("home", '{contacto}', NULL)` sí deja la clave creada y vacía: por eso
-- cada sección va en su propia sentencia, y solo sobre secciones que existen.
--
-- Si una sección no estuviera en la fila, su color tampoco se añade. Tampoco pasa
-- nada: el frontend resuelve cada color por separado y cae al del sitio.

-- Hero: el color del «Enviar» de la caja de sugerencias.
-- Es el único que **no** puede ser lima, porque la caja es lima.
UPDATE config_site
SET "home" = jsonb_set(
      "home",
      '{hero}',
      "home" -> 'hero' || jsonb_strip_nulls(
        jsonb_build_object(
          'cajaBotonColor', CASE
            WHEN ("home" #>> '{hero,cajaBotonColor}') IS NULL THEN '"verde"'::jsonb
          END
        )
      )
    )
WHERE ("home" #>> '{hero,cajaBotonColor}') IS NULL;

-- El proyecto: el «Explorar más» de cada tarjeta del carrusel.
UPDATE config_site
SET "home" = jsonb_set(
      "home",
      '{proyecto}',
      "home" -> 'proyecto' || jsonb_strip_nulls(
        jsonb_build_object(
          'botonColor', CASE
            WHEN ("home" #>> '{proyecto,botonColor}') IS NULL THEN '"lima"'::jsonb
          END
        )
      )
    )
WHERE ("home" #>> '{proyecto,botonColor}') IS NULL;

-- Documentos: el «Ver más» de cada categoría.
UPDATE config_site
SET "home" = jsonb_set(
      "home",
      '{documentos}',
      "home" -> 'documentos' || jsonb_strip_nulls(
        jsonb_build_object(
          'botonColor', CASE
            WHEN ("home" #>> '{documentos,botonColor}') IS NULL THEN '"lima"'::jsonb
          END
        )
      )
    )
WHERE ("home" #>> '{documentos,botonColor}') IS NULL;

-- Noticias: dos botones, y van por separado porque no se parecen —«Ver todas» es
-- un botón de la página y el «Ver más» va encima de la foto de la noticia.
UPDATE config_site
SET "home" = jsonb_set(
      "home",
      '{noticias}',
      "home" -> 'noticias' || jsonb_strip_nulls(
        jsonb_build_object(
          'botonColor', CASE
            WHEN ("home" #>> '{noticias,botonColor}') IS NULL THEN '"lima"'::jsonb
          END,
          'tarjetaBotonColor', CASE
            WHEN ("home" #>> '{noticias,tarjetaBotonColor}') IS NULL THEN '"lima"'::jsonb
          END
        )
      )
    )
WHERE ("home" #>> '{noticias,botonColor}') IS NULL
   OR ("home" #>> '{noticias,tarjetaBotonColor}') IS NULL;

-- Contacto: el botón del teléfono y el «Enviar» del formulario. Los dos en tinta,
-- que es el color con el que estaban escritos (`bg-[#0c272e]`).
UPDATE config_site
SET "home" = jsonb_set(
      "home",
      '{contacto}',
      "home" -> 'contacto' || jsonb_strip_nulls(
        jsonb_build_object(
          'botonColor', CASE
            WHEN ("home" #>> '{contacto,botonColor}') IS NULL THEN '"tinta"'::jsonb
          END,
          'enviarColor', CASE
            WHEN ("home" #>> '{contacto,enviarColor}') IS NULL THEN '"tinta"'::jsonb
          END
        )
      )
    )
WHERE ("home" #>> '{contacto,botonColor}') IS NULL
   OR ("home" #>> '{contacto,enviarColor}') IS NULL;
