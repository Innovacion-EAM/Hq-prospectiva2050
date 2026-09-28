-- El documento de contenido exige que cada noticia registre su autor.
ALTER TABLE noticias ADD COLUMN IF NOT EXISTS autor varchar(160);
