# Repositorio de Información — la cuarta app (`/repo`)

> **Qué es**: un catálogo en línea con los **297 documentos de referencia** del
> proceso HQP 2050, con filtros, estadísticas y gráficas. Vive en su propia app,
> servida bajo `https://<sitio>/repo`, se administra desde el backoffice y se
> alimenta de un endpoint público de la misma API de siempre.
>
> **Dónde está cada cosa**: la app en [`repo/`](../repo/), el backend en
> [`backend/src/data/repositorio-*.ts`](../backend/src/data/), la integración en
> [`frontend/`](../frontend/) y la documentación de despliegue en
> [`despliegue-aws.md`](despliegue-aws.md).

---

## 1. Resumen

El sitio principal ya tiene sus propias "piezas" (`Documento`) en `/documentos`.
El repositorio es **otra cosa**: el inventario completo de lo que existe sobre el
Quindío — planes, informes, acuerdos, investigaciones, cartografía SIG — con su
ficha, su dimensión, su tipo, su año y su enlace de descarga, que **sigue en
Google Drive** (a la instancia no se sube ningún archivo: 297 PDFs no caben en el
disco de una t3.micro y no hace falta).

| Aspecto | Decisión |
|---|---|
| URL | `https://<sitio>/repo` (ruta raíz sin prefijo) |
| App | Vite + React + TypeScript + Tailwind v4 + Recharts, en [`repo/`](../repo/) |
| Datos | Tabla `repositorio_items`, independiente de `documentos` |
| Clave natural | `codigo` = el "No." del Excel original (reimportar actualiza, no duplica) |
| Persistencia | Los enlaces apuntan a Google Drive; nunca se uploada el archivo |
| Admin | Backoffice → "Repositorio" (`/admin/repositorio`), con rol admin **y** editor |
| Imagen | `ghcr.io/innovacion-eam/hq-repo` (build del workflow `deploy.yml`) |
| SEO/contexto | El home del sitio muestra gráficas de las 4 dimensiones con los mismos datos |

---

## 2. Arquitectura

Igual que el backoffice: una **cuarta app** en `repo/` construida con
`base: "/repo/"`, servida por su propio nginx y montada bajo `/repo` por Traefik
con un middleware que le quita el prefijo (`strip-repo`, gemelo de `strip-admin`).

```
navegador ── http://<sitio>/repo/…
                │
           traefik (router "repo", middleware strip-repo)
                │  quita /repo → petición a http://repo:80/
                ▼
           nginx (repo)  →  serve /index.html del bundle Vite
                │
           fetch → /api/repositorio/…  (backend existente, nuevas rutas)
```

El **API tiene dos superficies**, igual que noticias:

- **Públicas** (no piden token, solo devuelven lo `publicado`):
  - `GET /api/repositorio` — lista paginada y filtrable (el catálogo).
  - `GET /api/repositorio/:id` — ficha de un documento.
  - `GET /api/repositorio/facetas` — valores únicos para los filtros.
  - `GET /api/repositorio/estadisticas` — agregaciones para el dashboard y las
    mini-gráficas del home.
- **Panel + escritura** (piden sesión; `@Roles('admin','editor')` a nivel de
  clase, como en noticias):
  - `GET /api/repositorio/panel` — lista **incluyendo borradores** (solo admin/editor).
  - `GET /api/repositorio/panel/:id` — ficha administrativa.
  - `POST /api/repositorio` · `PATCH /api/repositorio/:id` · `DELETE /api/repositorio/:id` — CRUD.
  - `POST /api/repositorio/importar` — sube un CSV y hace **upsert por `codigo`**.
  - `POST /api/repositorio/publicar-todos` — publica de golpe todo lo que esté en borrador.

---

## 3. El modelo de datos

`repositorio_items` (creada por `db-init` vía `ALL_ENTITIES`, nunca
`synchronize` en producción):

| Columna | Tipo | Notas |
|---|---|---|
| `id` | PK | autoincremental |
| `codigo` | int, `unique` | el "No." del Excel; **clave natural** del upsert |
| `titulo` | text | título del documento |
| `autor` | text `null` | institución/es responsable(s) |
| `anio` | int `null` | año de publicación (el Excel trae "NA" → `null`) |
| `tipo` | text | uno de los 17 tipos del inventario |
| `delimitacion` | text `null` | delimitación espacial |
| `formato` | text | PDF · Excel · Dirección web · Power Point |
| `dimension` | text `null` | **slug** de `config_dimensiones` (las mismas 4 del sitio) |
| `link` | text `null` | URL de Google Drive / web; `null` = "Enlace pendiente" |
| `resumen` | text `null` | texto libre del panel (no viene del Excel) |
| `publicado` | bool | borrador vs. publicado |
| `publicadoEn`, `creadoEn`, `actualizadoEn` | timestamps | auditoría |

**Por qué `dimension` guarda el slug y no el texto**: para cruzar estadísticas
entre el repositorio y la configuración de dimensiones del sitio, y para que los
filtros funcionen igual en `/repo`, en el home y en el panel.

---

## 4. El inventario (semilla y datos verificados)

La semilla `backend/src/data/repositorio-seed.ts` carga los **297 ítems
publicados** del Excel `repositorio/Repositorio de documentos HQP2050.xlsx`
(datos verificados durante el desarrollo):

- **Formato**: PDF 276 · Excel 16 · Dirección web 4 · Power Point 1.
- **Tipos**: 17 en total (Informe General o de Gestión 84, Artículo
  Científico/Revista 49, Investigación Académica/Tesis 38, Plan de Desarrollo o
  Plan Estratégico 32, Acuerdo 26, Política Pública 25, Base de Datos 14, Guía
  Metodológica o Técnica 8, Consultoría 6, Plan Maestro 4, Cartografía SIG 3,
  Plan de Gestión 2, Decreto 2, Normatividad Técnica 1, Ley Nacional 1,
  Resolución 1, Libro 1).
- **Años**: 1997–2026 (26 valores; el Excel trae "NA" → `null`).
- **Rara avis**: la fila 247 trae nombre de archivo en vez de URL
  → queda `link: null` y se muestra como **"Enlace pendiente"**.

La semilla es **idempotente** (`INSERT ... ON CONFLICT (codigo) DO NOTHING` a
través del seeder genérico): no toca lo que ya exista ni pisa modificaciones
hechas desde el panel.

---

## 5. La app `/repo`

Estructura de rutas (SPA con `basename /repo`):

| Ruta | Qué muestra |
|---|---|
| `/repo/` | **Dashboard**: números gigantes (total, con/sin enlace), donut por dimensión, barras por tipo/formato/delimitación, serie de años. |
| `/repo/catalogo` | **Catálogo**: tarjetas con filtros (búsqueda, dimensión, tipo, delimitación, formato, rango de años, orden) + búsqueda `?q=` |
| `/repo/documento/:id` | **Ficha** de un documento (autor, año, tipo, delimitación, formato, dimensión, enlace de descarga). |

Un detalle para el home: si el catálogo se abre con `?q=…` que deja **exactamente
1 resultado**, la ficha se abre automáticamente. Es el mecanismo que usa la
integración "Ver ficha en el repositorio" del sitio principal.

### Paleta por dimensión (única y compartida)

| Dimensión | Slug | Color |
|---|---|---|
| Físico-ambiental | `fisico-ambiental` | esmeralda `#34d399` |
| Económico-productivo | `economica-productiva` | ámbar `#fbbf24` |
| Político-institucional | `politico-institucional` | azul `#60a5fa` |
| Socio-cultural | `socio-cultural` | magenta `#f472b6` |

La misma paleta vive en `repo/src/lib/api.ts`, en el home
(`frontend/src/components/home-repo.tsx`) y en el panel
(`backoffice/src/lib/types.ts`). Si se cambia en un sitio, hay que cambiarla en
los tres.

---

## 6. La importación desde CSV

El panel tiene la pestaña **Importar**. Acepta dos formatos **sin que la persona
tenga que acordarse de nada**:

1. **CSV canónico** del proyecto: `codigo,dimension,titulo,autor,anio,tipo,delimitacion,formato,link`.
2. **Exportación directa del Excel original** (LibreOffice → "CSV delimitado por
   comas"): encabezados `No., Título del documento, Autor(es), Fecha de
   publicación, Tipo de documento, Delimitación espacial, Formato, Link de
   acceso/descarga`. La columna **"Dimensión" sin encabezado** se detecta por
   posición (columna 2).

Normalizaciones que aplica el importador (`repositorio-import.service.ts`):

- dimensión → slug de `config_dimensiones` (valida, no adivina);
- año: `"NA"` o vacío → `null`;
- enlaces de Drive `drive.google.com/file/d/ID/…` → `…/uc?export=download&id=ID` (descarga directa);
- celdas que no parezcan URL → `link: null` (**"Enlace pendiente"**);
- **upsert por `codigo`**: reimportar el mismo archivo actualiza en vez de
  duplicar; los re-importados **conservan** su estado de publicación;
- los **nuevos** quedan `publicado: true` (la importación publica directo, no deja borradores).

El reporte devuelve `{ creados, actualizados, errores[{fila, motivo}] }`, que el
panel muestra al instante.

---

## 7. Integración con el sitio principal

- **Menú**: entrada "Repositorio" que enlaza a `/repo` (en `frontend/src/data/site.ts`).
- **Home**: sección "El inventario documental del territorio" con las gráficas de
  las 4 dimensiones (donut + conteos), alimentada por `GET /api/repositorio/estadisticas`
  — la misma fuente del dashboard, así nunca se descuadran. Cada dimensión enlaza
  a `/repo?dimension=<slug>`.
- **"Ver ficha"**: en las categorías de documentos, un documento sin enlace de
  descarga muestra "Ver ficha en el repositorio", que navega a
  `/repo?q=<título>`; si hay solo 1 resultado, el catálogo abre la ficha solo.

---

## 8. Admin desde el backoffice

`/admin/repositorio` tiene tres pestañas:

- **Catálogo**: lista paginada (50/página) con filtros por dimensión/tipo/formato
  y búsqueda; campos con badge de color por dimensión; crear/editar con
  formulario (código único, título obligatorio), publicar/despublicar al vuelo y
  eliminar con confirmación.
- **Importar**: subida del CSV, reporte de creados/actualizados/errores y botón
  "Publicar todos los borradores".
- **Estadísticas**: totales y barras CSS (sin recharts en el panel) por dimensión,
  formato, tipo y año.

Pueden publicar **admin y editor**. La escritura está protegida por
`@Roles('admin','editor')`, igual que noticias.

---

## 9. Despliegue y dev local

Inline con el resto del stack:

- **Traefik**: router `repo` (`PathPrefix('/repo')`), middleware `strip-repo`,
  service `repo` (`http://repo:80`) en `infra/traefik/dynamic/`.
- **Compose**: servicio `repo` en `docker-compose.yml` (build local, `VITE_MODE:
  docker`) y en `docker-compose.prod.yml` (imagen GHCR `hq-repo:latest`,
  `VITE_MODE: prod`, build-args `VITE_API_URL`/`VITE_SITE_URL` como backoffice).
- **GitHub Actions**: `deploy.yml` añade `repo` a la matriz de build y publica
  `hq-repo`; `ci.yml` hace npm ci + lint + build de `repo/` con `VITE_API_URL`
  falsa; `cleanup-ghcr.yml` poda también `hq-repo`.
- **Makefile**: `install-repo` (usa `npm ci`: valida que el lockfile derive
  exacto del de frontend), `dev-repo` (:4173), `lint-repo`.
- **Smoke de producción**: `make prod-smoke` comprueba `/repo`, sus assets (con
  prefijo `/repo`) y la API pública `repositorio/estadisticas`.

> **Nota de dependencias**: `repo/package-lock.json` se **deriva** de
> `frontend/package-lock.json` (mismas dependencias, `"name": "repo"`). Sí se
> puede regenerar con `npm i` en una máquina con Node, pero **no** se debe
> cambiar `package.json` de `repo` sin replicar el cambio en `frontend` y volver
> a derivar el lockfile, o `npm ci` fallará en CI.