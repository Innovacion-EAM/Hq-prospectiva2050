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
├── scripts/
│   ├── deploy/         # bootstrap.sh (arranque único) y deploy.sh (cada despliegue)
│   ├── schema-db.sql   # SQL manual del esquema — obsoleto, usar `make prod-db-init`
│   └── seed.sql        # SQL manual de la semilla — obsoleto, idem
├── docs/               # Documentación (incluye despliegue-aws.md)
├── backups/            # Dumps de la base de datos (make backup) — gitignored
├── Makefile            # La "interfaz" de comandos del proyecto
└── README.md           # Portada (enlaces a las guías)
```

---

## 5. Variables de entorno

Cada servicio lee **un archivo según el entorno** (el backend elige con `APP_ENV`; los Vite por `--mode`):

| Entorno | Backend | Frontend / Backoffice | Credenciales compose |
|---|---|---|---|
| Dev (npm) | `backend/.env.dev` | `frontend|backoffice/.env.dev` | — |
| Docker local | `backend/.env.docker` | `frontend|backoffice/.env.docker` | `infra/compose/.env` |
| Producción | `backend/.env.prod` | **build-arg** `VITE_API_URL` | `infra/compose/.env.prod` |

Los archivos `.env.*.example` son plantillas: cópialos y complétalos (ver Producción).

> En producción, frontend y backoffice **no** leen `.env.prod`: la URL llega como build-arg (`VITE_API_URL`) porque se incrusta en el bundle durante el build. Solo hay dos archivos de entorno que mantener en el servidor: `infra/compose/.env.prod` y `backend/.env.prod`.

Variables principales:

| Variable | Sirve para |
|---|---|
| `PORT` | Puerto del servicio (backend/desarrollo, front/backoffice, **api del backoffice**) |
| `DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME` | Conexión a PostgreSQL del backend |
| `CORS_ORIGINS` | Orígenes permitidos por el backend (separados por coma) |
| `VITE_API_URL` | **Origen** de la API que llaman las apps web (**sin `/api`**: las apps siempre piden `${VITE_API_URL}/api/...` y el prefijo lo pone el backend) |
| `VITE_SITE_URL` | URL pública del sitio, para los enlaces del panel (build-arg) |
| `POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB` | Credenciales del contenedor de la db (compose) |
| `HQ_SITE_HOST` | Dominio que matchean los routers de Traefik (`infra/compose/.env.prod`) |
| `APP_ENV` | Entorno del backend (`dev` / `docker` / `prod`) |
| `DB_SYNCHRONIZE` | Esquema automático de TypeORM (`true` en dev/docker, `false` en prod) |
| `SEED_CONTENIDO` | Contenido de muestra (noticias, documentos, municipios, dimensiones, mensajes). **Opt-in**: solo se siembra con `true`, así que un entorno sin la variable arranca vacío. Las cuentas y la configuración del sitio se siembran igual. `make db-reset` pone `true`, `make db-vacia` pone `false` |
| `JWT_SECRET` | Clave para firmar los tokens de sesión del backoffice (obligatorio) |
| `UPLOAD_DIR` | Carpeta (relativa al backend o absoluta) donde se guardan los archivos de la biblioteca |

> **Esquema y datos iniciales:** con `DB_SYNCHRONIZE=true` (dev/docker) TypeORM crea las tablas y el **seeder** del backend (`SeederService` + `seed-data.ts`) carga los datos de arranque al iniciar, si la db está vacía. En producción va `false` y hay que ejecutar `make prod-db-init`, que hace las dos fases (esquema y semilla) de forma idempotente.

> **Importante:** en frontend/backoffice, `VITE_API_URL` y `PORT` se **incrustan en el build** (`vite build`). Si los cambias, hay que **reconstruir** la imagen; en producción eso significa desplegar de nuevo (`git push main`), no reiniciar el contenedor.

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
| `http://localhost/admin` | backoffice (SPA en subruta `/admin`; el middleware `strip-admin` la sirve desde su propia base) |
| `http://localhost/api` | backend (Traefik pasa `/api` **tal cual**: el prefijo lo pone el backend) |
| `http://127.0.0.1:8080` | dashboard de Traefik |

Health de todo el stack: `http://localhost/api/health/db` → `{"status":"ok", ..., "database":"connected"}`.

> **Por qué hay dos middlewares de `stripPrefix` y no uno solo:** el panel se
> construye con `base: "/admin/"`, así que su `index.html` pide los assets en
> `/admin/assets/…`. Traefik quita `/admin` y nginx los sirve desde la raíz real
> del build. La alternativa (que nginx resolviera `/admin/**` con `alias`) no
> funciona: dentro de un `alias`, `try_files $uri` busca contra el root del
> server, no contra el alias, los assets devuelven 500 y el panel sale en blanco
> aunque `/admin` responda 200. Si añades una subruta nueva, quita el prefijo en
> `routes.yml`, no en el `nginx.conf`.

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

Es el mismo compose con un **overlay** (`docker-compose.prod.yml`) que cambia credenciales, fija `APP_ENV=prod`, baja las imágenes de GHCR en vez de compilarlas y ajusta PostgreSQL a 1 GB de RAM.

> **El flujo completo en AWS EC2 está en [`docs/despliegue-aws.md`](despliegue-aws.md)** (secretos de GitHub, arranque de la instancia, rollback, HTTPS). Esta sección es el resumen.

### El principio: construir en CI, no en el servidor

Las imágenes se construyen en los runners de GitHub y se publican en GHCR. El servidor **solo descarga**. En una t3.micro (1 vCPU / 1 GB) compilar tres servicios a la vez tumba la instancia por falta de memoria; descargar y rearrancar son segundos.

```
git push main → Actions (lint + tests → buildx → GHCR) → SSH → pull + db-init + up
```

### Primera vez en el server

```bash
git clone <repo> && cd Hq-prospectiva2050

sudo HQ_SITE_HOST=tudominio.com \
     GHCR_DEPLOY_USER=tu_usuario \
     GHCR_DEPLOY_TOKEN=ghp_xxx \
     ./scripts/deploy/bootstrap.sh
```

El script instala Docker, crea 2 GB de swap (imprescindible con 1 GB de RAM), clona el repo en `/opt/hq-prospectiva2050`, genera los `.env.prod` con secretos aleatorios y levanta todo. Es idempotente.

Si lo haces a mano en vez de usar el script:

```bash
make env-prod      # crea infra/compose/.env.prod y backend/.env.prod
```

**Luego edítalos** (los `.env.prod` están gitignored):

| Archivo | Qué poner |
|---|---|
| `infra/compose/.env.prod` | `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` y **`HQ_SITE_HOST`** (el dominio) |
| `backend/.env.prod` | los **mismos** `DB_USER` / `DB_PASSWORD` / `DB_NAME`, `CORS_ORIGINS` con el dominio y un `JWT_SECRET` nuevo (`openssl rand -hex 24`) |

`POSTGRES_PASSWORD` y `DB_PASSWORD` deben coincidir: el contenedor crea la db con esas credenciales y el backend se conecta con las suyas.

Ya **no** hacen falta `.env.prod` en frontend ni backoffice: la URL de la API llega como **build-arg** (`VITE_API_URL`, el **origen sin `/api`**; las apps añaden `/api` en cada llamada) y se incrusta en el bundle en tiempo de build.

### Esquema de la base de datos

En producción `DB_SYNCHRONIZE=false`, así que el esquema hay que crearlo explícitamente. Lo hace `backend/src/cli/db-init.ts`:

```bash
make prod-db-init  # sincroniza el esquema + siembra las tablas vacías
```

Es idempotente, genera el SQL desde las entidades de TypeORM (no puede desincronizarse) y reutiliza el mismo `SeederService` que la app. Sin esto, el backend arranca contra una base sin tablas y se cae.

### Desplegar

```bash
make prod-deploy   # pull + db-init + up (NO compila)
```

Equivale a lo que hace el despliegue automático. Para reconstruir en el propio servidor (plan B, no recomendado): `make prod-build`.

Verificación:

```bash
make prod-smoke    # contenedores, /, /admin, /api/health/db y https
make prod-ps / make prod-logs SERVICE=backend
```

Rollback:

```bash
make prod-rollback TAG=v1.0.0
```

> `prod-smoke` envía la cabecera `Host` de `HQ_SITE_HOST` porque los routers de Traefik filtran por host. Con el dominio real, un `curl http://localhost/` sin esa cabecera da 404 aunque todo esté bien.

### Backups de la db (importante)

```bash
make backup        # dump con timestamp en backups/
make backup-list   # listar
make backup-clean  # conservar solo los N últimos (N=14 default)
make restore FILE=backups/<archivo>.pg   # restaurar (pide confirmación)
```

Los ficheros subidos (fotos, logos) viven en el volumen `hq-uploads` y **no** están en la db: hay que respaldarlos aparte. Receta con cron y S3 en [`docs/despliegue-aws.md`](despliegue-aws.md#copias-de-seguridad).

---

## 9. Traefik (proxy)

- **Config estática** (`infra/traefik/traefik.yml`): entrypoints (`web` 80, `websecure` 443, `traefik` 8080) y el provider de **archivos** (recarga dinámica automática). Se carga al arrancar.
- **Config dinámica** (`infra/traefik/dynamic/`): los routers/servicios (`routes.yml`, `service.yml`). `middlewares.yml` queda **solo como documentación**: no hay middlewares de ruta, porque el prefijo `/api` lo aplica el propio backend (prefijo global de Nest en `backend/src/app.setup.ts`) y Traefik pasa la petición tal cual. Si se necesita uno (headers, límites), se define ahí y se referencia desde `routes.yml`.
- ⚠️ **Nada de `strip-api`.** Al frontend y al backoffice les llega la API con `/api` en todas las llamadas (son el prefijo global del backend), y `API_BASE` es el **origen sin `/api`**: `http://localhost` en docker, `http://localhost:3006` en dev, el dominio en producción. Que Traefik recorte `/api` o que `API_BASE` lo incluya **rompe** la ruta y el sitio cae al contenido de respaldo, porque la petición llega a una ruta que no existe. Los `.env.*` y `api-client.ts` llevan este esquema a propósito.
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
| Base de datos | `db-shell` · `db-logs` · `db-reset` · `db-vacia` · `db-schema` · `db-seed` |
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

### Ajustes del sitio por módulos (uno por bloque del sitio, en su orden)

- **Configuración → Ajustes** (`/configuracion`) está dividido en **módulos**, cada uno con su pantalla pero **un solo guardado**: se edita lo que haga falta y se pulsa «Guardar ajustes» una vez. Los nueve están en la lista, y el orden es el del sitio de arriba abajo: **Header, Home, El proyecto, Dimensiones, Documentos, Noticias, Participa, Contáctanos, Footer**. Antes eran tres —**Header**, **Home** y **General**—; *General* ya no existe, y sus campos se repartieron según dónde se ven: **nombre** y **frase** a *Footer*, **correo, teléfono y dirección** a *Contáctanos*.
- ⚠️ **Los módulos que aún no están implementados no se llenan moviendo lo de otros.** *El proyecto*, *Dimensiones*, *Documentos*, *Noticias* y *Participa* salen en la lista porque son bloques del sitio, pero muestran `ModuloPendiente` (`backoffice/src/pages/ajustes/modulo-pendiente.tsx`): un texto que dice qué bloque es y **dónde se edita hoy cada cosa**. Se decidió expresamente **no** tocar *Home* al abrirlos: *Home* se queda con toda la portada editable (hero, proyecto, municipios, documentos, noticias y contactos), que es donde estaba y donde funcionaba. Repartir un formulario que ya funciona entre dos pantallas para tapar un módulo vacío rompe donde antes funcionaba y no arregla el hueco. Para implementar uno: quitar su `ModuloPendiente` de `PANTALLAS` en `AjustesPage` y poner su componente.
- La relación con `home` queda así: `hero`, `proyecto`, `cobertura`, `documentos`, `noticias` y `contacto` → *Home*, todos. *Home* toca además, en su bloque de Contactos, las columnas de contacto que comparte con *Contáctanos* (ver abajo). *Footer* toca `nombre`, `tagline`, las redes y **una sola cosa de `home`: `footer.enlaces`, la columna de «El proyecto» del pie** (ver el apartado del Footer más abajo). Nunca toca una columna de contacto.
- Los dos módulos con formulario usan un helper compartido, `useEditarPortada` (`backoffice/src/pages/ajustes/editor-portada.ts`), en vez de repetir el `editar()` en cada archivo: `home` es un objeto de objetos y cambiar un campo suelta tiene que rearmar su sección entera, o el resto de secciones se quedarían sin guardar al pulsar el botón.
- El **correo, el teléfono y la dirección no están en el Footer aunque también se vean en el pie**: están en *Contáctanos*, con el resto de los datos de contacto. Tener el mismo campo en dos sitios es la forma segura de que acaben diciendo cosas distintas. Igual con la bajada y el rótulo del bloque de contacto de la portada: esos son de `home` y se editan en *Home*, no en *Contáctanos*. El teléfono se escribe **sin espacios**: el campo `CampoTelefono` (`backoffice/src/pages/ajustes/campo-telefono.tsx`) los pone solo mientras se escribe, y el `telefonoHref` —lo que marca el botón de llamar— **ya no tiene campo propio**: sale solo del nuevo valor cada vez que cambia, así que no hay manera de dejar el número viejo en el enlace. Las reglas del agrupado están en `backoffice/src/lib/telefono.ts` (`formatearTelefono` y `hrefDeTelefono`).
- ⚠️ **El correo, el teléfono, la dirección y la ciudad sí están en *Home* además de en *Contáctanos*, y es deliberado.** Se piden los dos sitios porque son dos maneras de llegar a lo mismo: quien edita está viendo el bloque de contacto de la portada, y quien busca "a quién le escribo" está en *Contáctanos*. La dirección y la ciudad también están en *Home*, no porque sí: el bloque de la portada las muestra (`{SITE.address} — {SITE.city}`, en `HomeContact`), además de verse en el pie y en `/contactos`. No son dos copias del dato: `email`, `telefono`, `telefonoHref`, `direccion` y `ciudad` son **columnas sueltas** de `config_site` —no campos de `home`—, los dos módulos escriben en las mismas cinco y leen del mismo formulario en la misma pantalla de guardado, así que **no pueden quedar distintos**. Y por eso el cambio sale en todo el sitio sin tocar nada más: el pie de página, el bloque de la portada, la página `/contactos` y el aviso de privacidad leen las mismas columnas.
- Cada botón de la portada tiene **su propio selector de color**, ocho en total: el del hero, el «Enviar» de la caja de sugerencias, el «Explorar más» de cada tarjeta del proyecto, el «Ver más» de cada categoría de documentos, el «Ver todas», el «Ver más» de cada tarjeta de noticias, el botón del teléfono y el «Enviar» del formulario de contacto. Antes solo el del hero tenía color y los demás llevaban el que estaba escrito en el código. Van uno por botón y no uno para toda la portada porque **los botones no se parecen entre sí**: el del hero va sobre una foto oscura, el «Ver más» de cada noticia va **encima** de la foto de la noticia, y el «Enviar» de la caja va sobre un fondo lima. Con un solo color habría que decidir cuál de los dos lados de cada botón se enteraba.
- ℹ️ **Las seis categorías de «Documentos y publicaciones» se quedan como están, con sus tres ruidos conocidos.** Se decide no tocarlo, y conviene dejarlo escrito para no volver a abrirlo: (1) una categoría creada en Configuración → Categorías **no** se añade a `TIPOS_DOCUMENTO`, la lista contra la que se valida el campo «tipo» del formulario de documentos, así que se puede crear una categoría que ningún documento puede usar y cuya página `/documentos/{slug}` da `404`; (2) borrarla deja sus documentos apuntando a una categoría que ya no existe, sin aviso; (3) el texto de la sección sigue diciendo «Exploca cada categoría del repositorio», que ya no describe lo que hace la sección. El nombre de una categoría **tampoco** se puede cambiar, y no por descuido: el nombre va en el `slug`, que es la URL pública, así que renombrarla rompe los enlaces ya compartidos y de aquí no sale redirección. Arreglar (1) y (2) sin tocar los nombres es barato si algún día hace falta; abrir los nombres no lo es.
- `PANTALLAS` es un `Record<ModuloId, …>` y no una cadena de `cond ? <A/> : <B/>`: con nueve módulos la cadena era ilegible y el último `else` se llevaba el que faltara. El tipo obliga a que estén todos, así que añadir un módulo a `MODULOS` sin su pantalla no compila.
- El módulo **Header** edita tres cosas que hasta ahora estaban escritas en el código del frontend: la **imagen del logo** (subida a la biblioteca de archivos), los **dos textos que van al lado** y el **orden de los enlaces del menú**, que se reordena con las flechas de cada fila.
- ⚠️ **Del menú solo se toca el orden.** Cada fila muestra el número, el texto y la dirección, y lo único que hay son las flechas ↑ ↓: **no se agrega, no se quita y no se edita**. Es a propósito —los enlaces del menú son las páginas del sitio, y esa lista ya vive en un solo sitio (`MENU_DEL_SITIO`)—, y porque abrir el texto y la dirección para escribirlos a mano era la forma más fácil de dejar un enlace con la ruta mal escrita, que no da ningún error hasta que alguien navega y no llega a ninguna parte. **Si alguna vez hace falta una entrada más, se agrega a `MENU_DEL_SITIO` y la fila sale sola.** El backend sigue aceptando cualquier lista (hasta veinte enlaces, con `href` de ruta o `https://`): lo que se estrechó es la pantalla, no la API.
- Las cuatro columnas viven en **`config_site`** (`logoUrl`, `logoTitulo`, `logoSubtitulo`, `navLinks`), no en una tabla aparte, a propósito: esa fila **se siembra siempre**, aunque la base esté vacía a propósito (`make db-vacia`). En una tabla propia, vaciar el contenido borraría la navegación del sitio y no habría forma de arreglarlo desde el panel, porque no se puede entrar a él.
- `navLinks` es una **lista ordenada** en `jsonb`: el orden del arreglo es el orden en pantalla y lo reordena el panel. El servidor guarda el orden tal cual, sin "arreglarlo" por su cuenta.
- **Red de seguridad del sitio**: si la lista llega vacía, el frontend muestra el menú de respaldo de `frontend/src/data/site.ts`. Un sitio sin barra de navegación es mucho peor que uno con el menú de siempre, y una lista vacía casi siempre es un dato que se vació por error. Lo mismo con los textos del logo: vacío significa "usa el predeterminado", **no** "oculto" (por eso el formulario no promete que se pueda dejar en blanco).
- ⚠️ **Esa red de seguridad dejaba un camino sin vuelta atrás.** Con la lista vacía el sitio se veía bien, pero el editor del panel se quedaba sin nada que reordenar y la única forma de recuperar los siete era escribirlos a mano uno por uno. Pasó de verdad. Por eso el editor tiene **«Poner el menú del sitio»**: repone los siete en su orden, **solo aparece cuando la lista no es ya ese menú**, y **pide dos clics** (el `ConfirmButton` que ya usaba la galería: el primero pregunta, el segundo borra lo que hubiera). No guarda —guarda el botón de «Guardar ajustes», como todo lo demás—, así que se puede reponer y luego ordenar sin miedo. Que la red exista no significa que baste: cuando el respaldo es lo único que sostiene la navegación, hay que devolverle el control a quien la editó.
- Una fila **a medias** (sin texto o sin dirección, que solo puede venir de una base guardada antes de que existiera esta pantalla, porque el backend las rechaza) se marca en rojo con «Sin texto» / «Sin dirección» en vez de dejar un hueco en blanco, y `problemaDeNav` sigue bloqueando el guardado diciendo **cuál** es. Como ya no se puede arreglar en sitio, la salida es «Poner el menú del sitio».
- **El menú del sitio está escrito en tres sitios a propósito**: el respaldo del frontend (`NAV`), la semilla del backend (`SEED_SITE.navLinks`) y la del panel (`MENU_DEL_SITIO`). No es un descuido: cada uno lo necesita donde está (el frontend para verse sin conexión, el backend para sembrar, el panel para saber qué filas pintar y para reponer), y unirlos obligaría a un paquete a importar del otro. **Si se cambia en uno, hay que cambiarlo en los tres.**
- **`logoUrl` vacío = `null`**, no campo ausente. `VacioOpcional()` convierte el vacío en `undefined`, y un campo ausente no se asigna: el botón "Quitar imagen" respondía `200` sin quitar nada. Con `@Transform` a `null` sí se guarda. El mismo caso está en `MensajePatchDto.seguimiento`, donde borrar la nota de seguimiento tampoco funcionaba.
- ⚠️ **Las tres imágenes de la portada no aceptaban quedar vacías** (`hero.fondo`, `hero.imagen` y `proyecto.fondo`), que es lo que hace el botón **«Usar la del sitio»** de Ajustes → Home. Tenían `@Matches(/^(\/|https?:\/\/)/)` **sin** `@VacioOpcional()`, y el patrón no admite la cadena vacía: el botón ponía `""` y el guardado moría con `400` («La imagen de fondo debe empezar por "/" o por "https://"»). Es decir, **subir una imagen funcionaba pero quitarla no**, que es justo lo que dejaba el botón inútil. Se resolvió con `VacioEnPortada()` (`backend/src/common/dto.ts`), que convierte el vacío en `null` como hace `logoUrl`: `null` sí se escribe y el frontend lo resuelve al respaldo (`imagenO`). Ojo con la diferencia de fondo entre los dos casos: en `logoUrl` el campo es una **columna** y se asigna con `Object.assign`, mientras que aquí es un campo dentro de un **`jsonb`** que se fusiona sección por sección.
- ⚠️ **La fusión de `home` reventaba con `500` en cualquier guardado parcial.** `class-transformer` crea instancias de las **seis** secciones siempre que venga `home` (`@ValidateNested` + `@Type`), y deja en `undefined` las que no se mandaron. `Object.entries(undefined)` lanza `TypeError`, así que `PUT { home: { noticias: {...} } }` —todo legal, y la forma más normal de escribir a mano o desde un script— respondía `500` en vez de `200`. Lo detectó la suite e2e, que tenía tres tests reds sobre la portada. Además se ignoran los campos que llegan `undefined` **dentro** de una sección mandada: si no, guardar un solo rótulo vaciaría el resto de la sección.
- Las imágenes de la portada se guardan como `null` cuando se elige «Usar la del sitio», y por eso los tipos las declaran `string | null` (`backend/src/entities/site-config.entity.ts` y `backoffice/src/lib/types.ts`). El panel las normaliza a `""` al cargar el formulario (el helper `cadena()` en `AjustesPage`) porque `SelectorImagen` trabaja con cadenas.
- ⚠️ **Los rótulos de bloque de la portada son FIJOS: no se editan desde el panel.** Son el `titulo` de cada bloque: proyecto, `dimsTitulo` ("Las cuatro dimensiones"), cobertura, documentos, noticias y contacto. Se cambian en el código del sitio, en `PORTADA` y `FALLBACK_SITE` (`frontend/src/data/site.ts`). El frontend **ignora lo que venga guardado**: los `titulo` pasan por `fijoPortada()`, que devuelve el del sitio y descarta el de la API. Ojo con la diferencia con el resto de campos de la portada, que sí se editan y sí usan `textoO`: aquí **no** debe usarse `textoO`, porque dejaría que un valor guardado —de una versión anterior en la que sí eran editables, o de alguien que los escribiera a mano por la API— tapara el rótulo del sitio. **La excepción es el titular del hero (`headline`): ese sí se edita** en Ajustes → Home, renglón por renglón (ver el apartado «El titular del hero» más abajo). Del lado del panel, el bloque *Home* no ofrece ningún campo para los rótulos fijos: ofrecer un campo que el sitio luego ignora es peor que no ofrecerlo, porque alguien escribiría, guardaría y no vería cambio.
- ⚠️ **Las imágenes de la portada son opcionales en los dos sentidos**: se puede subir una y se puede volver a la del sitio. Cuando están en la del sitio, la base las tiene en `null` y `AjustesPage` las normaliza a `""` **dentro de `home`** al armar el formulario. Ojo con esto: un `...conImagenesEnCadena(...)` mal colocado —al nivel superior del `form` en vez de dentro de `home`— manda `hero` y `proyecto` como campos sueltos del sitio, y el backend los rechaza con `400 property hero should not exist`, que rompía **todos** los ajustes y no solo las imágenes. `sanear()` (en `data.ts`) quita `id` pero no limpia campos inventados, así que la forma del `form` es lo que hay que cuidar aquí.
- El botón «Usar la del sitio» **solo aparece cuando hay una imagen puesta**: si no hay ninguna, el recuadro ya dice «La del sitio» y no hay nada que deshacer.
- ⚠️ **Los colores de botón son una lista cerrada, corta y repetida en tres sitios**: `COLORES_BOTON` en `backend/src/common/dto.ts`, `frontend/src/data/site.ts` y `backoffice/src/lib/portada.ts`. La clave es lo que viaja por la API y lo que valida el servidor; el mapa clave → clases vive en `frontend/src/components/portada-colores.ts`. **Si se añade un color en un sitio y no en los otros, el backend responde 400 al guardar o el botón sale sin fondo** (en Tailwind una clase que no existe no da error: simplemente no pinta nada). Hay cinco porque cada uno viene **emparejado con el texto que sí contrasta con él** (los ratios están medidos en el propio archivo de clases), y con un selector libre se podía elegir un fondo claro con la letra oscura encima y quedaría ilegible sin que nada lo avisara.
- ⚠️ **El color se valida con `@IsOptional()`, y quitarlo rompe todos los guardados parciales.** `EsColorBoton()` lo lleva dentro, no por descuido: un color puede no venir porque la fila se guardó **antes** de que existiera el campo, y entonces cualquier guardado parcial de la portada llegaría sin él y `IsIn` —que no es `skipMissingProperties`— vería `undefined` y rechazaría el PUT entero con `400`. También porque un guardado parcial a propósito (un script, un `curl`, la suite) manda solo la sección que cambia. Aquí además hay que **ignorar los campos que llegan `undefined`** al fusionar, como ya se hacía con los textos: sin eso, guardar un solo rótulo vaciaría el resto de los colores de la sección. Que el color no venga no es un estado que alguien pueda dejar a propósito —un botón sin color se pierde sobre el papel—, así que de eso se encarga el frontend campo a campo con `colorO()`, que es la red de seguridad.
- ⚠️ **El «Enviar» de la caja de sugerencias tiene una lista más corta** (`COLORES_BOTON_ENCIMA_LIMA`: verde, tinta, convoca), y no es una preferencia. La caja es `bg-lime`, así que un botón `lima` encima es el mismo color con el mismo texto encima: 1:1, y el botón desaparece. Es el único sitio donde la lista restringida la pone el **cristal** y no el backend, y el backend la rechaza igual (`400`), no la recorta. Por eso el campo se declara `cajaBotonColor: ColorBotonSobreLima`, un tipo distinto: si compartiera tipo con los otros, el tipo dejaría pasar un `lima` que el servidor rechaza, y el editor vería un `400` sin explicación. En el panel hay dos componentes (`SelectorColor` y `SelectorColorSobreLima`) por lo mismo.
- El color de los botones de la sección de contacto tiene un respaldo **distinto del del resto**: `tinta`, no `lima`, porque el botón del teléfono y el «Enviar» estaban escritos en tinta (`bg-[#0c272e]`). Está en tres sitios por el mismo motivo —`FALLBACK_PORTADA` en el frontend, `COLOR_POR_DEFECTO_CONTACTO` en el panel y la migración `0010`—, y si alguno de los tres cayera a lima, abrir el bloque *Contactos* en una base vieja y guardar sin tocar los colores los cambiaría de tinta a lima, que es exactamente el cambio que nadie pidió.
- El relleno de los colores en las filas existentes está en la migración **`0010-portada-colores.sql`**, y escribe los valores con los que los botones **estaban escritos en el código** para que al abrir el panel no cambie nada de lo que se ve. Una sentencia por sección en vez de una con siete `jsonb_set` anidados, porque anidados hay que contarlos de derecha a izquierda y no se ve de un vistazo qué campo escribe cuál; y cada sección solo escribe los campos que **no** existen (`jsonb_strip_nulls` se queda lo que sí estaba), así que aplicarla dos veces no pisa lo que se haya cambiado desde el panel.
- ⚠️ **`SEED_HOME` siembra las tres imágenes en `null`, no con la ruta del sitio.** Es el detalle que hacía que las imágenes parecieran obligatorias. `/images/hero-city.jpg` y `/images/hero-people.jpg` **son** las imágenes del propio sitio (el respaldo `PORTADA` del frontend), así que sembrarlas como si fueran una subida del usuario hacía que el panel las mostrara como «una imagen puesta», con su botón «Usar la del sitio» al lado; al pulsarlo se volvía a **la misma foto** y el botón parecía no hacer nada. Con `null` el estado es el que de verdad corresponde a una imagen opcional: el panel dice «La del sitio» sin botón, el sitio usa la suya (`imagenO` → `FALLBACK_PORTADA`) y no hay nada que deshacer. Los textos sí se siembran con contenido, porque un texto vacío también es «usa el del sitio» pero en el panel se vería como un campo en blanco sin explicación.
- El **relleno de una fila que ya existía** está en `seedSite()` y también en la migración `0008`: añadir una columna a `config_site` no la llena, porque a la fila que ya está le cae el valor por defecto. En desarrollo el esquema lo crea TypeORM con `DB_SYNCHRONIZE` y las migraciones no se ejecutan, así que sin el relleno el encabezado quedaría vacío solo en desarrollo. Es idempotente: **solo escribe donde el valor está vacío**, nunca pisa lo que se haya cambiado desde el panel.
- La imagen se sube por `POST /api/media/uploads` (los mismos tipos que la galería; **SVG está rechazado**) y se guarda la **ruta** `/uploads/…`, no la URL absoluta, para que cambiar de dominio no obligue a reescribir la fila. En el sitio se ve con `object-contain` y con tope de altura: un logo alto estiraría la barra y desarmaría el encabezado.
- `logoUrl` y el `href` de cada enlace validan `^(/|https?://)`: sin ese patrón, `javascript:…` se guardaría como logo y quedaría a un paso de acabar en un atributo que sí lo ejecuta.

### El titular del hero

- **El titular del hero se edita desde Ajustes → Home** en la tarjeta «Titular del hero»: un **renglón por línea** (`ParagraphEditor`), porque el titular grande del sitio está escrito como varias líneas. Cada línea se guarda en la columna `headline` (un arreglo de strings, `@ArrayMaxSize(10)` en el backend). La regla de oro es la misma que el resto de los textos: **vacío = el titular del sitio**, nunca "sin titular". Al guardar se recortan los espacios y se descartan las líneas en blanco, y el tope es `LINEAS_TITULAR_MAX = 10` (exportado desde `backoffice/src/pages/ajustes/modulo-home.tsx`).
- En el frontend, `mapSite` (`frontend/src/data/site-context.tsx`) lee `headline`, lo limpia (trim + líneas vacías fuera) y, si queda vacío o no viene, usa `FALLBACK_SITE.headline`. Es la única parte de los rótulos de la portada que se edita; los títulos de bloque siguen fijos (ver más arriba).

### Footer: la columna de «El proyecto» se elige, las otras tres son fijas

- El pie tiene cuatro columnas. **Tres son fijas** y salen de `FOOTER_COLS` (`frontend/src/data/site.ts`): el mapa del sitio (copia del menú del encabezado, con +Noticias y +Contáctanos), las dimensiones (con +Retos transversales) y la del aviso legal. Son el temario del sitio entero, no contenido que cambie según quien administra. **La única columna que se elige es la segunda, la de «El proyecto»**, en Ajustes → Footer.
- El editor (`backoffice/src/pages/ajustes/enlaces-pie-editor.tsx`) no escribe texto libre: **marca casillas de las páginas que ya existen en Configuración → Proyecto** (hasta `MAX_ENLACES_PIE = 6`) y las ordena con flechas. Un enlace escrito a mano puede llevar a una página que no existe y no hay error que avise hasta que alguien navega; eligiendo de la lista, el `href` y el rótulo salen siempre de la misma página. Si una página elegida se borra después, la fila queda en una sección aparte «Páginas que ya no existen» con su botón para quitarla, en vez de un fantasma en la lista normal.
- Se guarda en `home.footer.enlaces` (`FooterPortadaDto`, `jsonb`, sin migración) y el frontend lo arma en `pickFooter` (`site-context.tsx`): la columna 2 usa la lista guardada y, **si está vacía, las páginas por defecto** (`FOOTER_PROYECTO_FALLBACK`). El editor además tiene «Poner las del sitio» (siempre visible, pide confirmación) para reponer las seis y poder reordenarlas.
- ⚠️ **El respaldo está escrito en dos sitios a propósito**: `FOOTER_PROYECTO_FALLBACK` (el respaldo del frontend, `frontend/src/data/site.ts`) y `footer.enlaces` en `SEED_HOME` (la semilla del backend, `backend/src/seed-data.ts`, para que una base nueva muestre las seis páginas marcadas en el panel). **Si cambia la lista por defecto, hay que cambiarla en los dos.** El botón «Poner las del sitio» del panel no guarda la lista en ningún sitio: la busca en la API (las seis primeras páginas de «El proyecto»), así que no hay una tercera copia que mantener.
- El rótulo legal del pie («Aviso de privacidad») pasó de ser `<span>` a un enlace real a `/privacidad` (`site-shell.tsx`): el texto no cambia, pero el clic sí llega a la página legal.

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
- ⚠️ **`frontend/src/pages/PrivacidadPage.tsx` es una sola página con tres secciones**: (1) el **Aviso de privacidad (Ley 1581 de 2012)** —quién es el responsable, qué se pide, para qué, base legal y cuánto se guarda—, (2) la **Política de tratamiento de datos** —quiénes acceden, seguridad y cambios— y (3) los **Derechos del titular (ARCO)** —acceso, rectificación, cancelación y oposición, con el plazo de respuesta de la ley y la vía ante la SIC—.
- ⚠️ **Los datos que solo conoce la organización van entre corchetes** `[ … ]`, y una **nota discreta al final** de la página lo recuerda: `[NOMBRE O RAZÓN SOCIAL DEL RESPONSABLE — NIT]`, `[CIUDAD Y DIRECCIÓN DEL RESPONSABLE]`, `[PLAZO DE CONSERVACIÓN]`, `[QUIÉNES ACCEDEN A LOS DATOS — PUESTOS O ENTIDADES, Y SU ACUERDO DE CONFIDENCIALIDAD]` y `[CORREO O CANAL PARA EJERCER LOS DERECHOS]`. Son datos de la organización, no se deducen, y se rellenan **antes de publicar**: la página se publica, pero mientras haya un corchete no cumple la Ley 1581. Se quitaron los recuadros amarillos `[PENDIENTE]` que había al principio: el aviso se lee como documento, no como tareas.

### Ciclo de atención de los mensajes

La caja «¿Tienes alguna pregunta o quieres darnos una recomendación?» del hero es anónima, y sin un canal no hay manera de devolverle nada a quien escribió. El sistema **no envía correos** (eso necesita SMTP/hosting, diferido), así que la respuesta se registra por dentro:

- **Correo opcional en el formulario.** Quien quiera que le contesten lo deja; quien no, escribe igual. Antes el backend rellenaba `anonimo@prospectiva.local`, una dirección inventada que el backoffice mostraba como real y contra la que no se podía escribir. Ahora la columna `mensajes.email` es **nullable** y la ausencia se guarda como ausencia: el backoffice dice «Sin contacto» (migración `0007`).
- **Estados**: `nuevo` → `en_revision` → `respondido` / `archivado`. Los mueve el backoffice. `PATCH /api/mensajes/:id` acepta `leido`, `estado` y `seguimiento`; un estado fuera de la lista es `400` y **no** se guarda a medias.
- **`seguimiento`**: anotación interna de a quién se le respondió, por qué canal y cuándo. No es una respuesta enviada, es el registro del equipo. El texto que envió la ciudadanía **no** se puede reescribir desde el backoffice (el `whitelist` del `ValidationPipe` lo rechaza con `400`): es evidencia.
- **La bandeja se refresca sola** (cada 30 s, en silencio y solo con la pestaña a la vista) y trae un botón «Actualizar». Antes pedía los datos una sola vez al montar, así que un mensaje enviado desde el sitio no aparecía hasta recargar el navegador a mano. `useCollection` acepta un tercer argumento `pollMs`; el sondeo no enciende el `loading` para no vaciar la tabla, y una respuesta que llega tarde no pisa a la nueva.
- **El clic en un mensaje abre un diálogo**, no lo despliega debajo de la fila. Antes crecía dentro de la tarjeta, en el mismo sitio donde estaba la lista: había que desplazar la vista para leerlo y, del mismo tono que el papel, se leía como un hueco en blanco. El `Modal` de `backoffice/src/components/ui.tsx` va en un portal sobre `document.body`, cierra con `Escape`, con clic en el fondo y con el botón de la esquina, y bloquea el scroll del fondo. Dentro van el texto recibido, el estado, el seguimiento, eliminar, y la acción de responder.
- **Responder es un `mailto`, no un envío.** El sistema no manda correos, así que el botón «Responder por correo» abre el programa de correo con el mensaje original citado y el asunto ya puesto. El enlace **nunca** lleva la nota de seguimiento: esa es interna y el `mailto` se abre a la vista de quien va a leerlo antes de enviarlo. Si la persona no dejó correo, el diálogo lo dice y recuerda que la atención se anote en el seguimiento, que es el registro de que se atendió.
- **Contador de sin leer en el menú**, como el globito de WhatsApp: cuenta los mensajes con `leido === false` y baja solo al marcarlos como leídos (no al archivarlos: uno archivado que nadie leyó sigue pendiente de leer). Vive en `backoffice/src/lib/no-leidos.ts`, a nivel de módulo, para que el menú y la bandeja compartan un solo sondeo; la bandeja fuerza el recuento tras cada mutación para que el número no tarde medio minuto en ajustarse.
- **Las fechas se arman en hora local.** Una columna `date` vuelve como `"2026-09-29"` y `new Date()` la lee como medianoche UTC, que en Colombia (UTC-5) ya es el día anterior: todo salía fechado un día antes. `formatFechaLocal` (backoffice) y `formatFecha` (sitio) le pegan `T00:00:00` antes de formatear; las cadenas con hora completa se dejan como están.
- El filtro «Sin responder» agrupa lo que no está ni en `respondido` ni en `archivado`, o sea lo que sigue abierto.
- **Los correos se recortan antes de validarse** (`@Recortado()`). Pegar una dirección con un espacio al final es lo más normal, y `@IsEmail` es estricto: sin recortar, la petición moría con un `400` de «Escribe un correo válido» aunque la dirección fuera buena. Afectaba a los cuatro formularios.

> Nota: `make test-e2e` corre contra la **base de desarrollo**, la misma que ve el backoffice. Por eso su limpieza es por id (borra `id > idAlEmpezar`, lo que creó la corrida) y nunca por nombre o asunto: el e2e reproduce los payloads reales —`nombre: 'Ciudadanía'` lo manda la caja del hero, `asunto: 'Solicitud de suscripción al boletín'` lo pone el backend al suscribirse— y un filtro por contenido no distinguía un mensaje de prueba de uno de verdad. También siembra con `SEED_CONTENIDO=false`, porque si no cada corrida llenaba la base de desarrollo con los datos de muestra y deshacía cualquier `make db-vacia`.

### Probar el sitio con la base vacía

`make db-vacia` borra el volumen y deja la base **sin contenido de muestra**: no hay noticias, documentos, municipios, dimensiones ni mensajes. Se queda solo con la cuenta de admin (`admin@prospectiva.com` / `Admin123*`) y la fila de configuración del sitio, porque sin la primera no hay forma de entrar al backoffice a llenarla y sin la segunda el sitio no arranca. La cuenta de rol editor se crea desde el propio backoffice.

El interruptor es `SEED_CONTENIDO` en `backend/.env.docker`, y queda puesto a `false` **de forma permanente**: el seeder siembra las tablas que encuentra vacías en cada arranque, así que un `SEED_CONTENIDO=false` de paso se perdería en el siguiente `make up` y todo el contenido volvería solo. `make db-reset` lo devuelve a `true` y recupera la semilla.

Que el interruptor sea **opt-in** (solo se siembra con `SEED_CONTENIDO=true`) no es un detalle de estilo: mientras fue al revés, bastaba con que un entorno no tuviera la variable para que rellenara las tablas vacías. Pasó con `backend/.env.dev`, el que lee un backend levantado a mano con `make dev`: la base se vació, alguien levantó el backend fuera de docker y las 12 noticias de muestra volvieron a aparecer solas, sin avisar. La variable está hoy en `.env.docker`, `.env.e2e`, `.env.dev` y sus `.example`, pero el código ya no depende de que ningún archivo la traiga.

En ese estado, `make smoke` avisa de que no hay contenido y se salta las 4 comprobaciones que cuentan dimensiones, aliados y municipios, en vez de fallar con cuatro X rojas. Los 4 formularios, la bandeja, la autenticación, los roles y el rechazo de archivos peligrosos en la galería se siguen verificando igual.

> Nota: el Aviso de Privacidad lleva los datos de la organización entre corchetes `[ … ]` (nombre del responsable, canal de derechos, plazo de conservación…). Son de la organización, no de este flujo, y se rellenan antes de publicar (ver la sección de Privacidad más arriba).

### Nota de URLs en docker

Con traefik (path-based, sin recortar), la URL pública de todo es el origen más `/api`: `http://localhost/api/media` → el backend (con prefix global `api`) recibe exactamente `/api/media`. El prefijo lo pone **una sola vez**, el backend; traefik pasa la petición tal cual y `API_BASE` es el origen sin `/api`. En desarrollo npm local la URL es igual de directa: `http://localhost:3006/api/...`. Que traefik recorte `/api` o que `API_BASE` lo incluya duplica o elimina el prefijo y la petición llega a una ruta que no existe (site en contenido de respaldo, e2e en rojo).
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
make test-e2e    # e2e de la API (levanta la app contra la db; dos fases, ver más abajo)
make smoke       # recorrido http contra el entorno que esté corriendo
```

- Los e2e necesitan PostgreSQL levantado. Usan `APP_ENV=e2e` → `backend/.env.e2e`, que apunta a la base Docker local por `127.0.0.1:5432` (publicada solo en loopback).
- Arrancan el `AppModule` real, así que crean el esquema y siembran el admin ellos solos: funcionan también contra una base vacía. Corren con `SEED_CONTENIDO=false`, de modo que **no** siembran el contenido de muestra: dejan la base como estaba y funcionan igual contra una que se vació a propósito.
- Lo que no se puede depender de la semilla, el test lo monta él. El único caso era el de las dimensiones, que ahora crea la suya y comprueba lo que de verdad vigila: que `body` sea una lista de párrafos y no un texto suelto.
- La suite del encabezado **guarda la fila de `config_site` que encuentra y la deja tal cual** al terminar (`beforeAll`/`afterAll`). La suite corre contra la base de desarrollo, que es la que usa el panel de verdad: cambiarla sería tocar la configuración que está viendo la gente.
- `make test-e2e` corre en **dos fases** (ver `backend/package.json`): `test:e2e:core` con el throttling **activo** (auth, app, repositorio y `throttle.e2e-spec.ts`, que comprueba que el login bloquea al sexto intento y por cuenta), y `test:e2e:api` con `THROTTLE_ENABLED=false` (el suite `api.e2e-spec.ts` ejercita el mismo endpoint decenas de veces y no puede hacerlo con límites). Separarlos es lo que mantiene en verde los tests de límites de verdad.
- El stack docker **local** sirve también con `THROTTLE_ENABLED=false` (`backend/.env.docker`): `make smoke` hace decenas de peticiones de formularios desde una IP, y el límite real de 3/hora (decoradores de `forms.controller.ts`) las cortaría con 429. Los límites de verdad no se comprueban ahí: los verifica la fase core de `test-e2e` con todo activo. Producción **no** define `THROTTLE_ENABLED`, así que en el servidor los 3/hora de formularios sí protegen la bandeja de spam.

### CI

`.github/workflows/deploy.yml` corre en cada push y PR: lint, typecheck y build de los tres servicios, más los e2e con PostgreSQL como servicio. **No despliega** — el despliegue es `make deploy` desde una máquina con acceso al servidor.

## 14. Pendientes

Estado completo y detallado en [`TODO.md`](../TODO.md). Resumen de lo que queda:

- **SSL/TLS** en Traefik: sin decidir entre Let's Encrypt automático y certificados manuales. Traefik ya tiene el 443 publicado y las dos configuraciones copiadas en [`despliegue-aws.md`](despliegue-aws.md#activar-https). Mientras tanto el panel viaja por HTTP en claro.
- **Migraciones del esquema**: hoy `db-init` usa `synchronize` de TypeORM, que solo añade tablas y columnas y nunca rehace ni borra. Es suficiente para arrancar, pero no permite deshacer cambios. Lo correcto es `typeorm migration:generate` versionado.
- **Backups automáticos**: `make backup` es manual y no cubre el volumen `hq-uploads`. Receta con cron + S3 en [`despliegue-aws.md`](despliegue-aws.md#copias-de-seguridad).
- **Tests en frontend y backoffice**: no hay ninguno; CI solo compila y hace lint.
- **Los e2e comparten la base de desarrollo y borran lo que crean.** `make test-e2e` fija `APP_ENV=e2e` a propósito; invocar `npm run test:e2e` a mano con otro `APP_ENV` haría que los tests apuntaran a esa base y borraran datos reales.
- **⚠️ Los dos `[PENDIENTE]` del Aviso de Privacidad** (nombre del responsable y canal de peticiones). Sin ellos la página se publica pero no cumple la Ley 1581. Bloqueante para publicar.
- **⚠️ `noticias.slug` y `users.email` son UNIQUE sin mirar la columna de borrado lógico.** Un slug de una noticia borrada queda ocupado para siempre, y la siguiente noticia con ese slug se come un 500 en vez de un «ese slug ya existe». Salió al intentar hacer repetible la suite e2e. Lo mismo con el correo de un usuario dado de baja. El arreglo es un índice parcial `WHERE eliminado_at IS NULL`; no se hizo por estar fuera del alcance acordado.
- **12 fotos de municipios por subir.** El sistema ya está listo (URL relativa, botón de quitar imagen, asignación en lote); faltan las fotos.
- **⚠️ `AjustesPage` no exige rol `admin`** (`backoffice/src/App.tsx`), pero `PUT /api/config/site` sí lo exige (`@Roles('admin')`). Un editor que entre a esa página ve el formulario y recibe un `403` al guardar. Ahora el aviso enseña el mensaje real del servidor en vez de un «no se pudo» genérico, que es lo que hizo que este bug pasara inadvertido, pero el arreglo de fondo es envolver la ruta en `RequireRole('admin')`.

**Resuelto:**

- **CI/CD** completo: `ci.yml` (lint, typecheck, tests unit y e2e con PostgreSQL) y `deploy.yml` (buildx → GHCR → SSH al servidor). Guía en [`despliegue-aws.md`](despliegue-aws.md).
- **Esquema de producción** vía `backend/src/cli/db-init.ts` en lugar del SQL manual, que era un stub vacío.
- Los routers de Traefik ya no están clavados a `Host(localhost)`: se parametrizan con `HQ_SITE_HOST`.
- **Seguridad del despliegue**: `JWT_SECRET` ahora se exige (sin fallback `'dev-secret'`), las rutas públicas de noticias ya no filtran borradores por rol, `/api/forms/*` tiene rate limiting, las URLs de media son relativas (`/uploads/…`) y `trust proxy` está activo.
