-- Los doce municipios del Quindío pasan a ser contenido editable, como las
-- entidades, los talleres y el resto de configuración del sitio. Antes vivían
-- fijos en el código del frontend.
--
-- Es una tabla más de `config_*`: la misma forma que el resto, con borrado lógico.
CREATE TABLE IF NOT EXISTS config_municipios (
  id          serial       PRIMARY KEY,
  nombre      varchar(120) NOT NULL,
  dato        varchar(120),
  descripcion varchar(500),
  eliminado_at timestamptz
);

-- El listado normal filtra por eliminado_at IS NULL, así que un índice parcial
-- sobre las filas vivas es más pequeño y más rápido que uno completo.
CREATE INDEX IF NOT EXISTS idx_municipios_vivos ON config_municipios (id) WHERE eliminado_at IS NULL;
