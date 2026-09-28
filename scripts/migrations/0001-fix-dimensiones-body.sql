-- Migración 0001 · Corrige el tipo de config_dimensiones.body
--
-- Problema: la entidad Dimension declaraba `body` como TEXT, pero el seeder
-- (backend/src/seed-data.ts), el backoffice y el frontend público lo usan como
-- lista de párrafos (string[]). TypeORM serializaba el array JS con el
-- serializador de `pg`, que escribe un literal de array de PostgreSQL
-- ({"a","b"}) en la columna de texto. El frontend hacía `dim.body.map(...)`
-- y las 8 páginas /dimensiones/:slug lanzaban TypeError -> pantalla en blanco.
--
-- La entidad ya declara `body: string[]` con tipo jsonb, así que en dev/docker
-- (DB_SYNCHRONIZE=true) el `synchronize` de TypeORM altera la columna, pero NO
-- convierte el contenido. En producción (DB_SYNCHRONIZE=false) hay que correr
-- este script a mano:  make db-migrate
--
-- Es idempotente: si la columna ya es jsonb no hace nada.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'config_dimensiones'
      AND column_name = 'body'
      AND data_type <> 'jsonb'
  ) THEN
    -- Las filas guardadas contienen un literal de array de PostgreSQL, que no es
    -- JSON válido ("a","b" en vez de ["a","b"]), por eso el cast es a text[].
    EXECUTE 'ALTER TABLE config_dimensiones ALTER COLUMN body DROP DEFAULT';
    EXECUTE 'ALTER TABLE config_dimensiones ALTER COLUMN body TYPE jsonb USING to_json(body::text[])';
    EXECUTE 'ALTER TABLE config_dimensiones ALTER COLUMN body SET DEFAULT ''[]''::jsonb';
    RAISE NOTICE 'config_dimensiones.body convertida a jsonb';
  ELSE
    RAISE NOTICE 'config_dimensiones.body ya es jsonb, nada que hacer';
  END IF;
END $$;
