-- Aviso de privacidad (Ley 1581 de 2012): los cuatro formularios públicos del
-- sitio piden nombre y correo, así que el backend ahora exige una autorización
-- expresa. Esta columna es la evidencia de que se pidió: los DTOs de
-- `forms.controller.ts` rechazan la petición si la casilla no vino marcada, así
-- que una fila con `true` llegó con autorización.
--
-- El `DEFAULT false` es deliberado: las filas que ya estaban en la bandeja se
-- recogieron antes de que existiera el aviso, y marcarlas como autorizadas sería
-- inventar una evidencia que no tenemos.
ALTER TABLE mensajes ADD COLUMN IF NOT EXISTS consentimiento boolean NOT NULL DEFAULT false;

-- Las imágenes se guardaban con la URL absoluta del servidor
-- (`http://host/api/uploads/archivo.jpg`), calculada con req.protocol +
-- req.get('host'). Eso ata el contenido al dominio por el que se subió: cambiar
-- de host, dominio o protocolo obligaba a reescribir cada fila a mano. A partir
-- de ahora se guarda la ruta relativa y el frontend la resuelve contra su
-- `API_BASE`, que es lo que ya se hace con el resto del sitio.
--
-- Este UPDATE es idempotente: la condición `LIKE` solo alcanza a las filas con
-- la forma antigua, así que volver a aplicarlo no daña nada.
UPDATE media
   SET url = '/uploads/' || split_part(url, '/', -1)
 WHERE url LIKE 'http%/api/uploads/%';
