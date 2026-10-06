# TODO

> Estado a 2026-10-05. Los puntos 3 y 4 están resueltos; el 1 sigue pendiente y
> el 2 quedó implementado de forma provisional.

## Hecho

- [x] **CI/CD** — GitHub Actions construye las imágenes y las publica en GHCR;
      la instancia solo hace pull + up. Guías: `docs/despliegue-aws.md` y los
      workflows `.github/workflows/{ci,deploy}.yml`.
      - `ci.yml`: lint + typecheck + tests (unit y e2e con PostgreSQL) en cada
        push y PR. Bloquea el despliegue si falla.
      - `deploy.yml`: `linux/amd64` vía buildx, cache de GHA, tags `latest` /
        rama / sha / semver, y despliegue por SSH al servidor.
      - Esquema de producción: `node dist/cli/db-init.js` (`backend/src/cli/`),
        idempotente, genera el esquema desde las entidades de TypeORM y siembra
        con el mismo `SeederService` que la app. Es lo que sustituye al SQL
        manual, que era un stub vacío.
      - `scripts/deploy/bootstrap.sh` (arranque único) y
        `scripts/deploy/deploy.sh` (cada despliegue), ambos idempotentes.
- [x] **Estructura de docker compose validada**
      - Las 3 apps se despliegan por `image:` de GHCR con `pull_policy: always`
        (sin esto, el tag `latest` local impedía bajar la versión nueva).
      - `platform: linux/amd64` fijado para la t3.micro.
      - PostgreSQL ajüstado a 1 GB de RAM (`shared_buffers`, `work_mem`,
        `max_connections`).
      - `HQ_SITE_HOST` parametrizado: los routers de Traefik ya no están
        clavados a `Host(localhost)`, que devolvía 404 con un dominio real.
      - Swap de 2 GB en el bootstrap (sin él, el OOM killer tumba la instancia).
      - URLs de la API como `build-arg`, no como `.env.prod` en el build context.
      - `.dockerignore` de frontend/backoffice ya no deja entrar `.env.prod`.

## Pendiente

- [ ] **SSL / TLS en Traefik** — bloqueado a la espera del dueño del dominio
      (falta el registro DNS y el certificado). Decidido y preparado: el resolver
      de Let's Encrypt está escrito y comentado en `infra/traefik/traefik.yml`
      (config estática: en `dynamic/` haría que Traefik descartara el fichero
      entero y se quedara sin routers), el volumen `certs/` ya está montado, y
      la redirección http→https está en `redirect.yml` lista para descomentar.
      Pasos exactos para el dominio y para nosotros en
      [`docs/dominio-y-ssl.md`](docs/dominio-y-ssl.md). Mientras tanto el panel
      viaja por HTTP en claro.
- [ ] **Migraciones de esquema** — `db-init` usa `synchronize` de TypeORM, que
      solo añade: crea tablas y columnas que falten, nunca las borra. Es
      suficiente para arrancar, pero no permite deshacer cambios ni auditar
      qué se ha aplicado. Lo correcto es `typeorm migration:generate` versionado
      en el repo. Hasta entonces, cada cambio de entidad exige revisar a mano
      el efecto en producción.

## Pendiente de seguridad (detectado al preparar el despliegue)

- [ ] **`JWT_SECRET` con fallback** — `backend/src/auth/auth.module.ts` usa
      `'dev-secret'` si la variable no está definida. El bootstrap siempre la
      genera, pero un arranque manual sin ella deja los tokens firmados con una
      clave pública del repo. Debería fallar al arrancar.
- [ ] **`isAdmin()` en rutas `@Public()`** — `data/noticias.controller.ts` verifica
      el JWT a mano en `GET /api/noticias` y `GET /api/noticias/:slug`, que son
      públicas. Acepta también el rol `editor`, así que un editor lee noticias no
      publicadas saltándose el guard. Necesita un endpoint autenticado aparte.
- [ ] **Sin rate limiting en los formularios** — `POST /api/forms/contacto` y
      `POST /api/forms/inscripciones` no validan ni limitan. Con el sitio
      público, cualquiera puede llenar `mensajes` de spam. Resolver con
      `@nestjs/throttler`.
- [ ] **URLs de media fijadas con el host** — `upload/upload.service.ts` guarda
      la URL absoluta del momento de la subida. Cambiar de dominio o pasar a
      HTTPS invalida todo lo ya subido. Debería guardar solo el path y
      componerlo en el cliente.
- [ ] **`trust proxy` sin activar** — `main.ts` no lo configura, así que detrás
      de Traefik con TLS `req.protocol` devuelve `http`. Afecta al punto anterior.
- [ ] **Credenciales de la semilla** — `admin@prospectiva.com` / `Admin123*`
      vienen en el repo. Hay que forzar el cambio en el primer acceso.

## Pendiente de operación

- [ ] **Backups automáticos** — `make backup` es manual y los ficheros subidos
      (volumen `hq-uploads`) no están cubiertos. La receta con cron + S3 está en
      `docs/despliegue-aws.md`, sección "Copias de seguridad".
- [ ] **Tests en frontend y backoffice** — no hay ninguno. `ci.yml` solo compila
      y hace lint en esos dos.
- [ ] **Límite de peticiones al panel por IP** en la instancia (fail2ban o
      similar) si se deja el 22 abierto a un rango amplio.
