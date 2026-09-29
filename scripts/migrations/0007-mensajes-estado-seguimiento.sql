-- Estado y seguimiento de los mensajes recibidos desde el sitio.
-- La caja del hero pasa a permitir correo opcional: las sugerencias anónimas
-- guardan email como NULL. Las columnas de atención son para llevar trazabilidad
-- interna (qué se hizo con cada mensaje) sin inventar un canal de respuesta por correo.
ALTER TABLE mensajes ADD COLUMN IF NOT EXISTS estado varchar(20) NOT NULL DEFAULT 'nuevo';
ALTER TABLE mensajes ADD COLUMN IF NOT EXISTS seguimiento text NULL;
ALTER TABLE mensajes ALTER COLUMN email DROP NOT NULL;
ALTER TABLE mensajes ALTER COLUMN email DROP DEFAULT; -- evita default heredado

-- Normalizar valores previos por si acaso (idempotente)
UPDATE mensajes SET estado = 'nuevo' WHERE estado IS NULL OR estado NOT IN ('nuevo','en_revision','respondido','archivado');
UPDATE mensajes SET email = NULL WHERE email = '' OR email = 'anonimo@prospectiva.local';
