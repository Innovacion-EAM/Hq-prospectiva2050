# TODO

> Estado a 2026-10-06, tras unificar la rama local con el despliegue de `main`.
> Los puntos 3 y 4 están resueltos; el 1 sigue pendiente y el 2 quedó
> implementado de forma provisional.

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
      - Las 4 apps (frontend, backoffice, repo y backend) se despliegan por
        `image:` de GHCR con `pull_policy: always` (sin esto, el tag `latest`
        local impedía bajar la versión nueva).
      - `platform: linux/amd64` fijado para la t3.micro.
      - PostgreSQL ajustado a 1 GB de RAM (`shared_buffers`, `work_mem`,
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
      [`docs/parte-a-dominio-ssl.md`](docs/parte-a-dominio-ssl.md) y
      [`docs/parte-b-checklist-desarrollador.md`](docs/parte-b-checklist-desarrollador.md). Mientras tanto el panel
      viaja por HTTP en claro.
- [ ] **Migraciones de esquema** — `db-init` usa `synchronize` de TypeORM, que
      solo añade: crea tablas y columnas que falten, nunca las borra. Es
      suficiente para arrancar, pero no permite deshacer cambios ni auditar
      qué se ha aplicado. Lo correcto es `typeorm migration:generate` versionado
      en el repo. Hasta entonces, cada cambio de entidad exige revisar a mano
      el efecto en producción.
- [ ] **⚠️ Aviso de Privacidad incompleto** — faltan los dos `[PENDIENTE]` de
      `frontend/src/pages/PrivacidadPage.tsx`: nombre o razón social del
      responsable y canal para ejercer los derechos. Sin ellos la página se
      publica pero no cumple la Ley 1581. Bloqueante para publicar.
- [ ] **⚠️ Índices UNIQUE sin mirar el borrado lógico** — `noticias.slug` y
      `users.email` son UNIQUE a secas: un slug de una noticia borrada queda
      ocupado para siempre y la siguiente noticia con ese slug devuelve 500 en
      vez de «ese slug ya existe»; lo mismo con el correo de un usuario dado de
      baja. Arreglo: índice parcial `UNIQUE ... WHERE eliminado_at IS NULL`
      (llega con un `typeorm migration:generate`).
- [ ] **12 fotos de municipios por subir** — el sistema ya está listo (URL
      relativa, botón de quitar imagen, asignación en lote); faltan las fotos.
- [ ] **Hosting y dominio definitivos** — diferido por el usuario. El
      despliegue está preparado para moverse a un dominio real en cuanto se
      decida (ver SSL/TLS arriba).

## Pendiente de seguridad (detectado al preparar el despliegue)

Resuelto el 2026-10-05, tras la primera puesta en producción:

- [x] **`JWT_SECRET` con fallback** — `auth.module.ts` ya no tiene `'dev-secret'`
      como valor por defecto: si falta la variable, el arranque falla con un
      mensaje que dice cómo generarla. Con fallback, un arranque manual sin la
      variable firmaba todos los tokens con una clave publicada en el repo.
- [x] **`isAdmin()` en rutas `@Public()`** — era un agujero real: las rutas
      públicas de noticias verificaban el JWT a mano y aceptaban el rol
      `editor`, así que un editor leía borradores sin pasar por el guard.
      Ahora son dos superficies distintas: `GET /noticias` y
      `GET /noticias/:slug` son públicas y no miran el token;
      `GET /noticias/panel` y `GET /noticias/panel/:slug` exigen sesión y
      devuelven también lo no publicado. El backoffice lista desde `/panel`.
- [x] **Sin rate limiting** — `@nestjs/throttler`, con tres contadores
      (general, login y formularios) configurables por variable de entorno. El
      del login cuenta por (correo, IP): por IP sola un atacante podía
      reintentar cada 15 minutos; por cuenta sola, un atacante podía bloquearle
      el login a otra persona. Ver `backend/src/auth/throttler.ts`.
      El guard aplica **todos** los contadores a **todas** las rutas, así que
      los suelos del módulo para login y forms son deliberadamente altos
      (10000): uno pequeño —5 y 3, como se puso al principio— limitaba también
      al sitio público y cualquier endpoint devolvía 429 después de 3
      peticiones por hora desde la misma IP. Los límites buenos viven en los
      decoradores `@Throttle` (login 5/15 min por cuenta; forms 3/hora por IP).
- [x] **URLs de media fijadas con el host** — `media.url` guarda ahora solo el
      path (`/uploads/x.png`) y cada cliente la resuelve contra su `API_BASE`.
      Cambiar de dominio o pasar a HTTPS ya no invalida lo subido. La tabla
      estaba vacía, así que no hubo que migrar.
- [x] **`trust proxy` sin activar** — `main.ts` hace `app.set('trust proxy', 1)`.
      Sin esto, el rate limiting contaba todas las peticiones como si vinieran
      de la IP de Traefik (y bloquearía a todo el mundo a la vez), y `req.protocol`
      se quedaba en `http` con TLS delante. Se usa `1` y no `true` para no
      confiar en la `X-Forwarded-For` que envíe el cliente.
- [x] **Credenciales de la semilla** — `Admin123*` estaba en el repo, que es
      público, y entraba como administrador en producción. La semilla ya no
      lleva contraseña: genera una aleatoria de 20 caracteres y la imprime una
      sola vez en el log del arranque, que solo ve quien tiene acceso al
      servidor. En la base de datos solo queda el hash bcrypt.
- [x] **Cambio de contraseña desde el panel** — `POST /api/auth/password` pide la
      contraseña actual, así que tener un token robado no basta para quedarse
      con la cuenta. Interfaz en Ajustes → Mi cuenta, para admin y editor.

### Lo que sigue abierto de seguridad

- [ ] **No se puede recuperar una contraseña olvidada** — a propósito: el sistema
      guarda solo el hash bcrypt, que no se puede deshacer, así que no existe
      "ver la contraseña actual". Tampoco hay correo configurado, de modo que no
      hay flujo de "olvidé mi contraseña". Hoy la única salida es que un admin
      la restablezca desde Usuarios, o borrar el usuario y volver a sembrarlo.
      Montarlo de verdad requiere un proveedor de correo y tokens de un solo uso.
- [ ] **Sin rate limiting en la instancia** — lo de arriba protege la API, pero
      no el puerto 22. Si se deja abierto a un rango amplio, conviene fail2ban.
- [ ] **Los tokens no se revocan al cambiar la contraseña** — el JWT dura 12h y
      es sin estado: cambiar la contraseña no invalida los tokens ya emitidos.
      Un cierre completo necesita un registro de tokens revocados o, más simple,
      versionar la contraseña (`tokenVersion` en el claim) y compararla con la
      columna en cada petición.
- [ ] **Migraciones de esquema** (ver arriba, en "Pendiente"): sigue sin haberlas.

## Pendiente de operación

- [ ] **Backups automáticos** — `make backup` es manual y los ficheros subidos
      (volumen `hq-uploads`) no están cubiertos. La receta con cron + S3 está en
      `docs/despliegue-aws.md`, sección "Copias de seguridad".
- [ ] **Tests en frontend y backoffice** — no hay ninguno. `ci.yml` solo compila
      y hace lint en esos dos.
- [ ] **Límite de peticiones al panel por IP** en la instancia (fail2ban o
      similar) si se deja el 22 abierto a un rango amplio.