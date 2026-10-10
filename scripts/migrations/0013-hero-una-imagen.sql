-- El hero de la portada pasa de dos imágenes (fondo + «foto de las personas») a
-- una sola: la imagen única del héroe, que trae en una pieza el fondo y las
-- personas (el respaldo `PORTADA.hero.fondo` del frontend, `/images/hero-banner.jpg`).
--
-- La clave `hero.imagen` deja de existir en el modelo, en el panel y en el sitio.
-- Esta migración borra la que hubieran guardado las filas viejas (la 0009 la
-- escribía al sembrar `home` vacío) para no dejar un campo muerto en el `jsonb`.
--
-- `hero.fondo` solo se toca si todavía vale el valor por defecto **anterior**, el
-- fondo de ciudad que sembraba la 0009 y que ya no es el del sitio. Si alguien
-- subió una imagen propia del hero desde el panel, esa se respeta: no se toca.
--
-- Idempotente: repetirla no cambia nada. Una sentencia por cambio, y solo sobre
-- secciones que existen, para que `jsonb_set` no cree niveles de más.

-- 1) Fuera la clave de la foto de personas, si alguna fila la tiene.
UPDATE config_site
SET "home" = jsonb_set("home", '{hero}', ("home" -> 'hero') - 'imagen')
WHERE "home" #> '{hero}' IS NOT NULL
  AND ("home" -> 'hero') ? 'imagen';

-- 2) Si el fondo seguía siendo el de por defecto viejo, se deja en `null` para que
--    el sitio use su imagen de respaldo (el banner), igual que en la semilla.
UPDATE config_site
SET "home" = jsonb_set("home", '{hero,fondo}', 'null'::jsonb)
WHERE "home" #>> '{hero,fondo}' = '/images/hero-city.jpg';
