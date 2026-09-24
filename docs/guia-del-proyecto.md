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
- Roles: **admin** (todos los módulos: contenido, usuarios, galería, mensajes) y **editor** (CRUD de contenido; no gestiona usuarios, ni la galería, ni elimina mensajes).
- El backend firma JWTs con `JWT_SECRET` (expira en 12 h). El guard global exige `Bearer` salvo en rutas `@Public()` (`/api/site`, `/api/health`, GET públicos de noticias/documentos/convocatorias, `/api/uploads/*`).

### Sitio público dinámico

- El frontend público consume **`GET /api/site`** (público) mediante `frontend/src/data/site-context.tsx` (`SiteProvider` + `useSite()`): trae SITE, stats, entidades, talleres, categorías de documentos, páginas del proyecto y dimensiones.
- `frontend/src/data/site.ts` queda como **fallback**: si la API no responde o devuelve listas vacías, el sitio muestra los datos por defecto (mismas formas, no se rompe).
- Las noticias con **`publicadoEn` futuro** quedan ocultas al público y aparecen automáticamente a partir de esa fecha; el backoffice las muestra como "Programada" y el admin puede verlas con `includeAll=true`.

### Galería (media)

- `POST /api/media/uploads` (multipart, máx. 20 MB; imágenes JPG/PNG/WEBP/GIF/SVG y PDF/DOC/XLS/PPT) + `GET /api/media`, `DELETE /api/media/:id` — **solo admin**.
- Se sirven estáticamente desde `/api/uploads/*`. En docker, la carpeta persiste en el volumen **`hq-uploads`** montado en `/app/uploads`.
- En backoffice, el componente **MediaPicker** permite subir o escoger un archivo de la biblioteca desde las fichas de noticias y documentos. Los documentos pueden ofrecer **archivo subido** (en vez de enlace externo).

### Nota de URLs en docker

Con traefik (path-based `strip-api`), una llamada `…/api/api/…` es correcta: el navegador llama `http://localhost/api/api/media`, traefik quita **un** `/api` y el backend (con prefix global `api`) recibe `/api/media`. En desarrollo npm local la URL es directa: `http://localhost:3006/api/...`.

---

## 12. Solución de problemas

| Síntoma | Qué hacer |
|---|---|
| Cambié `.env.docker`/`.env.prod` (URL/credenciales) y "no cambia nada" | `VITE_API_URL` se incrusta en build → `make rebuild` o `make prod-deploy` |
| Algo no responde en docker | `make doctor` → `make ps` → `make logs SERVICE=<servicio>` |
| Backend no conecta a la db | Verificar que la db está healthy (`make health`) y credenciales coincidentes |
| `make prod-*` falla | ¿Existen los `.env.prod`? → `make env-prod` y edítalos |
| No recuerdo un comando | `make help` |

---

## 13. Pendientes

- **SSL/TLS** en Traefik (decidir automática vs manual).
- **Migraciones del esquema** (hoy dev/docker usan `DB_SYNCHRONIZE=true` + seeder; para producción estricta se pueden generar migraciones/scripts SQL con `make db-schema` y `make db-seed`).
- **CI/CD** (GitHub Actions: carpeta `.github/workflows/` preparada).
- **Tests e2e de auth** (`backend/test/auth.e2e-spec.ts`) requieren una base PostgreSQL accesible desde el runner (usan el `AppModule` real y el seeder).