-- El enlace «Repositorio» del menú pasa a apuntar a una página del sitio.
--
-- Antes apuntaba a `/repo`, la aplicación del repositorio, que es otra app
-- servida por Traefik en su propio contenedor. Al pulsarla sin recargar, el
-- enrutador del sitio no encontraba ninguna ruta `/repo` y pintaba un 404; solo
-- al recargar (F5) el navegador volvía a pedirla al servidor y entonces sí
-- entraba. Para quitarnos ese salto, el menú lleva a la página nueva
-- `/repositorio` del propio sitio, que resume el repositorio y da los accesos a
-- la app y al catálogo.
--
-- Es idempotente: solo reescribe el elemento cuyo href es exactamente `/repo`, y
-- una vez reescrito no queda ninguno, así que volver a aplicarla no hace nada.
-- Respeta los enlaces que se hayan cambiado desde Ajustes → Header.

UPDATE config_site
SET "navLinks" = (
  SELECT COALESCE(
    jsonb_agg(
      CASE
        WHEN elem->>'href' = '/repo'
          THEN jsonb_set(elem, '{href}', '"/repositorio"'::jsonb)
        ELSE elem
      END
    ),
    '[]'::jsonb
  )
  FROM jsonb_array_elements("navLinks") AS elem
)
WHERE "navLinks" @> '[{"href":"/repo"}]'::jsonb;