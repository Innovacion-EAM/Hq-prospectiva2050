# Guía del Proyecto — HQ Prospectiva 2050

> Documentación de referencia: cómo correr cada servicio (npm / docker / producción), puertos, stack y versiones.
> Comandos rápidos: usa `make help` (menú con todo).

---

## 1. Resumen

Monorepo con tres apps y una infraestructura dockerizada:

| Servicio | Qué es |
|---|---|
| **backend** | API REST en NestJS (TypeORM + PostgreSQL) |
| **frontend** | App pública en React + Vite |
| **backoffice** | Panel de administración en React + Vite (servido bajo `/admin`) |
| **infra/** | Docker Compose + Traefik (proxy) para los entornos docker y producción |

Hay **3 formas de correr** cada servicio:

1. **Dev local** — npm directo en tu máquina (hot-reload).
2. **Docker local** — 5 contenedores detrás de Traefik en `http://localhost` (entorno de "producción parecida" para probar).
3. **Producción** — el entorno real en el server (credenciales y dominio reales).

---

## 2. Stack y versiones

| Servicio | Lenguaje / Framework | Versiones clave | Puerto dev (npm) | Puerto en contenedor | Imagen runtime |
|---|---|---|---|---|---|
| **backend** | TypeScript + **NestJS 12** + TypeORM | Node 24 · TS ~6 · `@nestjs/core ^12` · `@nestjs/config ^12` · `typeorm ^1.1.1` · `pg ^8.23` | **3006** | 3000 | `node:24-alpine` |
| **frontend** | TypeScript + **React 19** + **Vite 8** | React 19.2.8 · Vite 8.3.0 · TS ~6 · Tailwind 4 · oxlint | **5173** | 80 | `nginx:1.27-alpine` |
| **backoffice** | TypeScript + **React 19** + **Vite 8** | ídem frontend | **1234** | 80 (en `/admin`) | `nginx:1.27-alpine` |
| **postgres** | PostgreSQL | 16-alpine | — | 5432 | `postgres:16-alpine` |
| **traefik** | Go (proxy reverso) | v3.5 | — | expone 80 · 443 · 8080 | `traefik:v3.5` |

**Node:** v24 (en este entorno: `v24.15.0`) · **npm:** 11.

---

## 3. Requisitos previos

- **Node.js ≥ 24** y **npm** (para el dev local).
- **Docker** + **Docker Compose v2** (para el entorno docker y producción).
- **git** (para el repo y los deploys).

Instalación rápida de dependencias: `make install` (npm install en los 3 servicios).

---

## 4. Estructura del repo

```
.
├── backend/            # API NestJS (+ .env.dev | .env.docker | .env.prod)
├── frontend/           # App pública React/Vite
├── backoffice/         # Panel de administración React/Vite
├── infra/
│   ├── compose/        # docker-compose.yml (+ overlay prod) y .env de credenciales
│   └── traefik/        # config estática (traefik.yml) y dinámica (dynamic/)
├── scripts/            # Scripts SQL (opcionales en prod: schema-db.sql y seed.sql)
├── docs/               # Documentación
├── backups/            # Dumps de la base de datos (make backup) — gitignored
├── Makefile            # La "interfaz" de comandos del proyecto
└── README.md           # Portada (enlace a esta guía)
```

---

## 5. Variables de entorno

Cada servicio lee **un archivo según el entorno** (el backend elige con `APP_ENV`; los Vite por `--mode`):

| Entorno | Backend | Frontend / Backoffice | Credenciales compose |
|---|---|---|---|
| Dev (npm) | `backend/.env.dev` | `frontend|backoffice/.env.dev` | — |
| Docker local | `backend/.env.docker` | `frontend|backoffice/.env.docker` | `infra/compose/.env` |
| Producción | `backend/.env.prod` | `frontend|backoffice/.env.prod` | `infra/compose/.env.prod` |

Los archivos `.env.*.example` son plantillas: cópialos y complétalos (ver Producción).

Variables principales:

| Variable | Sirve para |
|---|---|
| `PORT` | Puerto del servicio (backend/desarrollo, front/backoffice, **api del backoffice**) |
| `DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME` | Conexión a PostgreSQL del backend |
| `CORS_ORIGINS` | Orígenes permitidos por el backend (separados por coma) |
| `VITE_API_URL` | **URL de la API** que llaman las apps web |
| `POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB` | Credenciales del contenedor de la db (compose) |
| `APP_ENV` | Entorno del backend (`dev` / `docker` / `prod`) |
| `DB_SYNCHRONIZE` | Esquema automático de TypeORM (`true` en dev/docker, `false` en prod) |
| `JWT_SECRET` | Clave para firmar los tokens de sesión del backoffice (obligatorio) |
| `UPLOAD_DIR` | Carpeta (relativa al backend o absoluta) donde se guardan los archivos de la biblioteca |

> **Esquema y datos iniciales:** con `DB_SYNCHRONIZE=true` (dev/docker) TypeORM crea las tablas y el **seeder** del backend (`SeederService` + `seed-data.ts`) carga los datos de arranque al iniciar, si la db está vacía. En producción va `false`.

> **Importante:** en frontend/backoffice, `VITE_API_URL` y `PORT` se **incrustan en el build** (`vite build`). Si los cambias, hay que **reconstruir** (`make rebuild` o `make prod-deploy`); reiniciar el contenedor no basta.

---

## 6. Entorno de desarrollo (npm local)

### Backend — API (NestJS)

```bash
cd backend && npm run start:dev     # o: make dev-backend
```

- Levanta en **http://localhost:3006** con hot-reload (`--watch`).
- Health: `curl http://localhost:3006/health` (`/health/db` verifica además la conexión a la db).

### Frontend — App pública (Vite)

```bash
cd frontend && npm run dev          # o: make dev-frontend
```

- Levanta en **http://localhost:5173**.
- Llama la API en `http://localhost:3006` (definido en `.env.dev`).

### Backoffice — Panel admin (Vite)

```bash
cd backoffice && npm run dev        # o: make dev-backoffice
```

- Levanta en **http://localhost:1234**.
- En dev se sirve en la raíz `/`; en docker/prod se sirve bajo **`/admin`**.

### Los tres a la vez

```bash
make dev          # backend + frontend + backoffice en paralelo
make dev-stop     # mata procesos en 3006 / 5173 / 1234
make dev-status   # qué está escuchando
```

---

## 7. Entorno docker (local)

Levanta los 5 servicios como contenedores, con Traefik enrutando **por path** en `http://localhost`. Es la forma más parecida a producción para probar.

### Levantar

```bash
make up            # build + up -d (lee infra/compose/.env y los .env.docker)
```

Equivalente directo con docker compose:

```bash
docker compose -f infra/compose/docker-compose.yml --project-directory infra/compose up -d --build
```

### Rutas (via Traefik)

| URL | A dónde va |
|---|---|
| `http://localhost/` | frontend |
| `http://localhost/admin` | backoffice (SPA en subruta `/admin`) |
| `http://localhost/api` | backend (el middleware `strip-api` quita `/api`) |
| `http://127.0.0.1:8080` | dashboard de Traefik |

Health de todo el stack: `http://localhost/api/health/db` → `{"status":"ok", ..., "database":"connected"}`.

> **Primera subida:** con `DB_SYNCHRONIZE=true` la db se crea sola: el backend genera las tablas y el seeder carga los datos iniciales. No hay que ejecutar nada a mano (los `scripts/*.sql` son opcionales).

### Contenedores y puertos

| Contenedor | Servicio | Puerto interno | Publicado al host |
|---|---|---|---|
| `hq-traefik` | traefik | 80 / 443 / 8080 | **80 · 443 · 127.0.0.1:8080** |
| `hq-frontend` | frontend | 80 (nginx) | interno |
| `hq-backoffice` | backoffice | 80 (nginx) | interno |
| `hq-backend` | backend | 3000 | interno |
| `hq-db` | postgres | 5432 | interno |

> **Solo Traefik expone puertos.** Las apps quedan aisladas en la red `hq-net`; se acceden por Traefik. El volumen `pgdata` conserva la db entre `down` y `up`.

### Comandos docker útiles

```bash
make ps            # estado + salud de los contenedores
make health        # salud compacta
make logs SERVICE=backend   # logs en vivo (vacío = todos)
make rebuild       # re-build + recreate (aplica cambios de código / .env)
make restart       # reinicia sin reconstruir
make down          # detiene (conserva datos)
make down-v        # detiene y BORRA la db (pide confirmación)
make db-shell      # psql dentro de la db
make config        # valida el compose (resolve)
```

### Base de datos docker vs base de datos dev

Hay **dos** postgres que conviven:

- **`hq-db`** — el de este compose. **Interno** (sin puerto publicado). Lo usan los contenedores.
- **`hq-postgres`** — un contenedor aparte que **publica el puerto 5432**. Es al que conectan los `npm dev` (local: `DB_HOST=localhost`). No pertenece al compose.

---

## 8. Producción (server)

Es el mismo compose con un **overlay** (`docker-compose.prod.yml`) que cambia credenciales, `APP_ENV=prod` y la URL real de la API (`VITE_MODE=prod`).

### Primera vez en el server

```bash
git clone <repo> && cd hq-prospectiva2050

make env-prod      # crea los 4 archivos .env.prod desde las plantillas .env.prod.example
```

**Luego edítalos con los valores reales** (los `.env.prod` están gitignored):

| Archivo | Qué poner |
|---|---|
| `backend/.env.prod` | `DB_USER` / `DB_PASSWORD` / `DB_NAME` reales, `CORS_ORIGINS` con tu dominio |
| `infra/compose/.env.prod` | los **mismos** `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` |
| `frontend/.env.prod` y `backoffice/.env.prod` | `VITE_API_URL=https://<tudominio>/api` |

La primera vez, `POSTGRES_PASSWORD` (compose) y `DB_PASSWORD` (backend) deben coincidir porque el contenedor crea la db con esas credenciales y el backend se conecta con las suyas.

### Desplegar

```bash
make prod-build    # build de frontend/backoffice con la URL de prod incrustada
make prod-up       # levanta con el overlay prod
# o directo:
make prod-deploy   # build + up
```

Verificación:

```bash
make prod-smoke    # revisa contenedores, /, /admin, /api/health/db y https
make prod-ps / make prod-logs SERVICE=backend
```

Actualizar el server con código nuevo:

```bash
make deploy        # git pull + build + up de producción
```

### Backups de la db (importante)

```bash
make backup        # dump con timestamp en backups/
make backup-list   # listar
make backup-clean  # conservar solo los N últimos (N=14 default)
make restore FILE=backups/<archivo>.pg   # restaurar (pide confirmación)
```

---

## 9. Traefik (proxy)

- **Config estática** (`infra/traefik/traefik.yml`): entrypoints (`web` 80, `websecure` 443, `traefik` 8080) y el provider de **archivos** (recarga dinámica automática). Se carga al arrancar.
- **Config dinámica** (`infra/traefik/dynamic/`): los routers/servicios/middlewares (`routes.yml`, `service.yml`, `middlewares.yml`).
- No usa el provider de Docker a propósito (versiones traefik/daemon incompatibles): se enruta por archivos.
- En `routes.yml` está documentada una **variante host-based** (`*.localhost`) comentada, por si se prefiere en vez de paths.
- `redirect.yml` y `tls.yml` son plantillas: el **SSL/TLS está pendiente** de decisión (automática con Let's Encrypt vs certificados manuales). Mientras tanto todo corre por http.

---

## 10. Makefile — interfaz de comandos

El Makefile centraliza todo. Resumen por sección (menú completo: `make help`):

| Sección | Comandos |
|---|---|
| Diagnóstico | `help` · `doctor` · `dev-status` |
| Dev | `install` · `dev` · `dev-backend|frontend|backoffice` · `dev-stop` |
| Calidad | `lint` · `test` · `format` |
| Docker | `up` · `down` · `down-v` · `ps` · `health` · `logs SERVICE=` · `build` · `rebuild` · `restart` · `config` |
| Base de datos | `db-shell` · `db-logs` · `db-reset` · `db-schema` · `db-seed` |
| Contenedores | `shell SERVICE=` (terminal dentro de un servicio) |
| Producción | `env-prod` · `prod-build` · `prod-up` · `prod-deploy` · `prod-smoke` · `prod-ps|logs|restart|down|down-v` · `prod-shell` · `deploy` |
| Backups | `backup` · `backup-list` · `backup-clean` · `restore FILE=` |
| Mantenimiento | `errors` · `docker-clean` |
| Git | `status` |

Ver opción `SERVICE=` (backend · frontend · backoffice · traefik · postgres) en los comandos `logs` y `shell`.

---

## 11. Backoffice, autenticación y biblioteca de archivos

### Login y roles

- El backoffice exige sesión: se entra por `/login`. La primera cuenta se **siembra** automáticamente: `admin@prospectiva.com` / `Admin123*` (cámbiala tras el primer uso, o edítala en `backend/src/seed-data.ts` → `SEED_USERS`).
| | **admin** | **editor** |
|---|---|---|
| Noticias, documentos, convocatorias, mensajes | ✅ | ✅ |
| Configuración editorial (dimensiones, stats, entidades, talleres, categorías, páginas del proyecto) | ✅ | ✅ |
| Galería: listar y subir | ✅ | ✅ |
| Galería: **eliminar** | ✅ | ❌ |
| Usuarios | ✅ | ❌ |
| Ajustes del sitio (`/api/config/site`) | ✅ | ❌ |

El botón de eliminar de la galería se oculta a quien no puede usarlo, para no
dejar un 403 a la vista.
- El backend firma JWTs con `JWT_SECRET` (expira en 12 h). El guard global exige `Bearer` salvo en rutas `@Public()` (`/api/site`, `/api/health`, GET públicos de noticias/documentos/convocatorias, `/api/uploads/*`).

### Sitio público dinámico

- El frontend público consume **`GET /api/site`** (público) mediante `frontend/src/data/site-context.tsx` (`SiteProvider` + `useSite()`): trae SITE, stats, entidades, talleres, categorías de documentos, páginas del proyecto y dimensiones.
- `frontend/src/data/site.ts` queda como **fallback**: si la API no responde o devuelve listas vacías, el sitio muestra los datos por defecto (mismas formas, no se rompe).
- Las noticias con **`publicadoEn` futuro** quedan ocultas al público y aparecen automáticamente a partir de esa fecha; el backoffice las muestra como "Programada" y el admin puede verlas con `includeAll=true`.

### Galería (media)

- `POST /api/media/uploads` (multipart, máx. 20 MB, un archivo) + `GET /api/media` — **admin y editor**. `DELETE /api/media/:id` — **solo admin**.
- Formatos: **JPG, PNG, WEBP, GIF** y **PDF, DOC(X), XLS(X), PPT(X)**. **SVG está rechazado a propósito**: es XML que puede llevar `<script>` y, al servirse desde el mismo origen que la API, sería XSS almacenado. La extensión final la decide el servidor (el nombre enviado no se confía) y la lista de formatos vive en `backend/src/upload/upload.service.ts`.
- Tamaño máximo 20 MB. El `accept` del `<input>` del panel es solo una ayuda visual; quien manda es el backend.
- Se sirven estáticamente desde `/api/uploads/*`. En docker, la carpeta persiste en el volumen **`hq-uploads`** montado en `/app/uploads`.
- En backoffice, el componente **MediaPicker** permite subir o escoger un archivo de la biblioteca desde las fichas de noticias y documentos. Los documentos pueden ofrecer **archivo subido** (en vez de enlace externo).

### Municipios: la cobertura territorial

- Los 12 municipios del Quindío son **datos, no texto del código**: tabla `config_municipios`, expuesta en el bundle del sitio como `GET /api/site → municipios` (migración `0005`).
- Se editan en el backoffice en **Configuración → Municipios** (`/configuracion/municipios`), con la misma collection genérica que el resto de la configuración editorial. Es la décima entrada de la papelera: el borrado es lógico y se puede deshacer.
- En el sitio se ven en dos sitios: la portada y `/proyecto`. `frontend/src/data/municipios.ts` queda como **fallback** y es la fuente del `<select>` de inscripción a talleres, que no necesita ir al servidor para listar doce nombres.
- El smoke comprueba que son 12, que ninguno viene sin nombre ni sin ficha, y que no hay nombres repetidos.

### Aviso de Privacidad (Ley 1581)

- Los cuatro formularios públicos piden nombre y correo, o un texto libre que puede contener datos personales, así que **los cuatro** exigen la autorización: casilla obligatoria en el sitio y `400` en el backend si no llega.
- El campo es `mensajes.consentimiento` (migración `0006`), `boolean NOT NULL DEFAULT false`. Las filas anteriores quedan en `false` a propósito: se recogieron antes de que existiera el aviso, y no hay que inventarles una autorización. El backoffice las marca como «Sin constancia».
- La validación es `@Equals(true)` y no `@IsBoolean() + @IsIn([true])`: con los dos, omitir el campo devolvía los dos mensajes a la vez y la respuesta era un ruido.
- La casilla se desmarca sola tras cada envío. El consentimiento es para **ese** envío; dejarla marcada haría que el siguiente saliera con una autorización que nadie volvió a dar.
- ⚠️ **`frontend/src/pages/PrivacidadPage.tsx` tiene dos `[PENDIENTE]` visibles**: el nombre o razón social del responsable y el canal para ejercer los derechos. Bloqueantes para publicar.

### Nota de URLs en docker

Con traefik (path-based `strip-api`), una llamada `…/api/api/…` es correcta: el navegador llama `http://localhost/api/api/media`, traefik quita **un** `/api` y el backend (con prefix global `api`) recibe `/api/media`. En desarrollo npm local la URL es directa: `http://localhost:3006/api/...`.
- Las imágenes se guardan con **URL relativa** (`/uploads/archivo.jpg`), no absoluta. Una URL absoluta se quedaba apuntando al `localhost:3006` del equipo que la subió y se rompía en cuanto el sitio se publicaba en otro dominio. `resolveUrl()` (en `frontend/src/lib/api.ts` y en `backoffice/src/lib/data.ts`) la convierte en absoluta en el cliente según el entorno; si ya viene en `http(s)://` la deja intacta.

---

## 12. Solución de problemas

| Síntoma | Qué hacer |
|---|---|
| Cambié `.env.docker`/`.env.prod` (URL/credenciales) y "no cambia nada" | `VITE_API_URL` se incrusta en build → `make rebuild` o `make prod-deploy` |
| Algo no responde en docker | `make doctor` → `make ps` → `make logs SERVICE=<servicio>` |
| Backend no conecta a la db | Verificar que la db está healthy (`make health`) y credenciales coincidentes |
| `make prod-*` falla | ¿Existen los `.env.prod`? → `make env-prod` y edítalos |
| El backend en producción muere al arrancar con `relation "config_stats" does not exist` | La base no tiene el esquema. En prod `DB_SYNCHRONIZE=false` y nadie lo crea solo → `make db-schema` (y `make db-migrate`). `make prod-up` ya lo hace antes de levantar |
| Levanté el backend a mano en prod y revienta | Tiene que ser `db` → `db-schema` → `db-migrate` → backend. `make prod-deploy` respeta ese orden |
| No recuerdo un comando | `make help` |

---

## 13. Esquema, migraciones y pruebas

### Esquema y datos

- Dev/docker: el esquema y los datos iniciales se crean solos (`DB_SYNCHRONIZE=true` + seeder).
- Producción: `DB_SYNCHRONIZE=false`, así que el esquema se aplica a mano:
  ```bash
  make db-schema     # aplica scripts/schema-db.sql (15 tablas, generadas con pg_dump)
  make db-migrate    # aplica scripts/migrations/*.sql pendientes y las registra
  ```
- `scripts/schema-db.sql` está generado desde la base ya sincronizada. Para regenerarlo tras tocar las entidades, ver la cabecera del propio archivo.
- Cada cambio de esquema a partir de ahí va como migración numerada en `scripts/migrations/`; no se edita el dump.

### Pruebas

```bash
make test        # tests unitarios del backend
make test-e2e    # 33 tests e2e de la API (levanta la app contra la db)
make smoke       # recorrido http contra el entorno que esté corriendo
```

- Los e2e necesitan PostgreSQL levantado. Usan `APP_ENV=e2e` → `backend/.env.e2e`, que apunta a la base Docker local por `127.0.0.1:5432` (publicada solo en loopback).
- Arrancan el `AppModule` real, así que crean el esquema y siembran el admin ellos solos: funcionan también contra una base vacía. Dejan la base como estaba.

### CI

`.github/workflows/deploy.yml` corre en cada push y PR: lint, typecheck y build de los tres servicios, más los e2e con PostgreSQL como servicio. **No despliega** — el despliegue es `make deploy` desde una máquina con acceso al servidor.

## 14. Pendientes

- **SSL/TLS** en Traefik (decidir automática vs manual).
- **Despliegue automatizado**: la CI valida, pero el `make deploy` sigue siendo manual.
- **Los e2e comparten la base de desarrollo y borran lo que crean.** `make test-e2e` fija `APP_ENV=e2e` a propósito; invocar `npm run test:e2e` a mano con otro `APP_ENV` haría que los tests apuntaran a esa base y borraran datos reales.
- **⚠️ Los dos `[PENDIENTE]` del Aviso de Privacidad** (nombre del responsable y canal de peticiones). Sin ellos la página se publica pero no cumple la Ley 1581. Bloqueante para publicar.
- **⚠️ `noticias.slug` y `users.email` son UNIQUE sin mirar la columna de borrado lógico.** Un slug de una noticia borrada queda ocupado para siempre, y la siguiente noticia con ese slug se come un 500 en vez de un «ese slug ya existe». Salió al intentar hacer repetible la suite e2e. Lo mismo con el correo de un usuario dado de baja. El arreglo es un índice parcial `WHERE eliminado_at IS NULL`; no se hizo por estar fuera del alcance acordado.
- **12 fotos de municipios por subir.** El sistema ya está listo (URL relativa, botón de quitar imagen, asignación en lote); faltan las fotos.