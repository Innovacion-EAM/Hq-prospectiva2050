-- Borrado lógico: el documento de arquitectura pide que eliminar contenido no
-- lo destruya, solo lo Retire de la vista pública y permita recuperarlo.
-- Se usa una columna de fecha: NULL = activo, con fecha = dado de baja.
ALTER TABLE noticias                ADD COLUMN IF NOT EXISTS eliminado_at timestamptz;
ALTER TABLE documentos              ADD COLUMN IF NOT EXISTS eliminado_at timestamptz;
ALTER TABLE convocatorias           ADD COLUMN IF NOT EXISTS eliminado_at timestamptz;
ALTER TABLE config_proyecto_paginas ADD COLUMN IF NOT EXISTS eliminado_at timestamptz;
ALTER TABLE config_dimensiones      ADD COLUMN IF NOT EXISTS eliminado_at timestamptz;
ALTER TABLE config_stats            ADD COLUMN IF NOT EXISTS eliminado_at timestamptz;
ALTER TABLE config_entidades        ADD COLUMN IF NOT EXISTS eliminado_at timestamptz;
ALTER TABLE config_talleres         ADD COLUMN IF NOT EXISTS eliminado_at timestamptz;
ALTER TABLE config_doc_categorias   ADD COLUMN IF NOT EXISTS eliminado_at timestamptz;

-- Índice parcial: las consultas normales filtran por eliminado_at IS NULL, así que
-- un índice solo sobre las filas activas es más pequeño y más rápido.
CREATE INDEX IF NOT EXISTS idx_noticias_vivas      ON noticias                (id) WHERE eliminado_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_documentos_vivos    ON documentos              (id) WHERE eliminado_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_convocatorias_vivas ON convocatorias           (id) WHERE eliminado_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_paginas_vivas       ON config_proyecto_paginas (id) WHERE eliminado_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_dimensiones_vivas   ON config_dimensiones      (id) WHERE eliminado_at IS NULL;
