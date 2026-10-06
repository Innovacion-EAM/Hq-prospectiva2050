-- Contenido de la portada editable desde Ajustes → Home.
--
-- El hero y las secciones que van desde ahí hasta antes del pie de página estaban
-- escritos en el código del frontend: el titular, las dos imágenes del hero, el
-- texto y el color de su botón, el fondo y los rótulos de cada sección. Pasan a la
-- fila de configuración del sitio, que es la que el backoffice ya editaba.
--
-- Una sola columna jsonb, no seis. Las secciones son objetos (textos e imágenes
-- agrupados), y aplanarlas en columnas saldría con una tabla ilegible. Y el panel
-- guarda todo el sitio con un solo botón, así que partirlo en seis filas solo
-- añadiría la posibilidad de que dos se escribieran a la vez y se pisaran.
--
-- Va en `config_site` y no en una tabla aparte por lo mismo que la migración 0008:
-- esa fila se siembra siempre, aunque la base esté vacía a propósito, así que la
-- portada no puede desaparecer por un borrado de contenido. Sin ella la portada
-- se quedaría sin titular, y no hay forma de arreglarlo desde el panel porque no
-- se puede entrar a él.

ALTER TABLE config_site ADD COLUMN IF NOT EXISTS "home" jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Rellenar lo que ya existiera. Idempotente: solo escribe donde el objeto está
-- vacío, así que volver a aplicarla no pisa lo que se haya cambiado desde el
-- panel. Sin esto, una base con la fila 1 ya creada se quedaría con `home = {}` y
-- la portada quedaría sin textos hasta que alguien abriera el panel.
UPDATE config_site
SET "home" = '{
  "hero": {
    "fondo": "/images/hero-city.jpg",
    "imagen": "/images/hero-people.jpg",
    "botonTexto": "Explorar más »",
    "botonColor": "lima",
    "cajaTitulo": "¿Tienes alguna pregunta o quieres darnos una recomendación?"
  },
  "proyecto": {
    "fondo": "/images/city-aerial.jpg",
    "titulo": "El proyecto",
    "texto": "Un ejercicio participativo con catorce entidades y la CEPAL para construir la visión de largo plazo del departamento.",
    "tarjetaBoton": "Explorar más >>",
    "dimsTitulo": "Las cuatro dimensiones",
    "dimsTexto": "Cuatro lecturas del territorio que estructuran la lectura del Quindío. Toca una para desplegar su resumen.",
    "accionTitulo": "Del diagnóstico a la acción"
  },
  "cobertura": {
    "titulo": "Todo el departamento participa",
    "texto": "La visión del 2050 se construye para el Quindío completo, no solo para Armenia."
  },
  "documentos": {
    "titulo": "Documentos y publicaciones",
    "texto": "Acceso público a los documentos del proceso: convenios, informes, memorias, boletines y piezas de socialización. Explora cada categoría del repositorio."
  },
  "noticias": {
    "titulo": "Noticias",
    "texto": "Comunicados, talleres, convocatorias y avances del ejercicio de prospectiva territorial.",
    "botonTexto": "Ver todas"
  },
  "contacto": {
    "titulo": "Contactos",
    "texto": "Escríbenos para más información sobre el ejercicio de prospectiva, los talleres o las convocatorias abiertas del departamento.",
    "formTitulo": "Escríbenos para más información"
  }
}'::jsonb
WHERE "home" IS NULL OR "home" = '{}'::jsonb;