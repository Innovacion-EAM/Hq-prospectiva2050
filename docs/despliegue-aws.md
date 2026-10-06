# Despliegue en AWS EC2 (t3.micro · Ubuntu) con CI/CD

Guía paso a paso para publicar el sitio en una instancia EC2 Ubuntu usando
**GitHub Actions + GHCR**. Las imágenes se construyen en los runners de GitHub y
la instancia solo las descarga.

> **Por qué no compilar en la instancia.** Una t3.micro tiene **1 vCPU y 1 GB de
> RAM**. `npm ci` + `nest build` + `vite build` de tres servicios en paralelo se
> lleva por delante la memoria y el proceso de Docker o del propio backend muere
> por OOM. Además tardaría minutos en cada despliegue. Con este flujo la
> instancia descarga unos cientos de MB y rearranca en segundos.

---

## Índice

1. [Arquitectura](#arquitectura)
2. [Requisitos previos](#requisitos-previos)
3. [Paso 1 — Configurar los secretos en GitHub](#paso-1--configurar-los-secretos-en-github)
4. [Paso 2 — Conectar la instancia con GitHub](#paso-2--conectar-la-instancia-con-github)
5. [Paso 3 — Arrancar la instancia (una sola vez)](#paso-3--arrancar-la-instancia-una-sola-vez)
6. [Paso 4 — Primer despliegue](#paso-4--primer-despliegue)
7. [Paso 5 — Despliegues siguientes](#paso-5--despliegues-siguientes)
8. [Rollback](#rollback)
9. [Limpieza de disco e imágenes](#limpieza-de-disco-e-imágenes)
10. [Copias de seguridad](#copias-de-seguridad)
11. [Diagnóstico de problemas](#diagnóstico-de-problemas)
12. [Activar HTTPS](#activar-https)
13. [Hardening y decisiones abiertas](#hardening-y-decisiones-abiertas)

---

## Arquitectura

```
   git push main
        │
        ▼
 ┌──────────────────────────────────────────────┐
 │  GitHub Actions                              │
 │   1. ci.yml     → lint + tests (bloquea)     │
 │   2. deploy.yml → buildx → GHCR              │
 │                  → SSH                        │
 └──────────────────────────────────────────────┘
        │ ssh
        ▼
 ┌──────────────────────────────────────────────┐
 │  EC2 t3.micro (Ubuntu)                       │
 │   scripts/deploy/deploy.sh                   │
 │     git pull                                 │
 │     docker login ghcr.io                     │
 │     docker compose pull      ← NO compila    │
 │     db-init (esquema + semilla, idempotente) │
 │     docker compose up -d                     │
 └──────────────────────────────────────────────┘
        │ puerto 80/443
        ▼
   Traefik ──┬── /         → frontend   (nginx)
             ├── /admin    → backoffice (nginx)
             └── /api      → backend    (NestJS)
                    │
                 postgres:16 (volumen pgdata)
```

**Componentes que viven en la instancia:**

| Servicio    | Imagen                                     | RAM aprox. |
|-------------|--------------------------------------------|------------|
| `hq-db`     | `postgres:16-alpine`                       | ~120 MB    |
| `hq-traefik`| `traefik:v3.5`                             | ~40 MB     |
| `hq-backend`| `ghcr.io/innovacion-eam/hq-backend`        | ~120 MB    |
| `hq-frontend` | `ghcr.io/innovacion-eam/hq-frontend`     | ~10 MB     |
| `hq-backoffice` | `ghcr.io/innovacion-eam/hq-backoffice`  | ~10 MB     |
| **Total**   |                                            | **~300 MB** |

Cabe en 1 GB con holgura, pero **sin swap cualquier pico de memoria mata el
proceso más frágil**. `bootstrap.sh` crea 2 GB de swap por eso.

---

## Requisitos previos

- La instancia EC2 Ubuntu creada y con **IPv4 elástico** (si no, el despliegue
  por SSH se rompe cada vez que la instancia se pare).
- Un dominio apuntando a esa IP (A record). Sin dominio puedes desplegar igual,
  pero todo irá por HTTP y tendrás que usar `/etc/hosts`.
- El repo en GitHub: `Innovacion-EAM/Hq-prospectiva2050`.

---

## Paso 1 — Configurar los secretos en GitHub

Ve a **Settings → Secrets and variables → Actions**.

### 1.1 Variables (pestaña *Variables*)

Son URLs públicas, no credenciales, por eso van aquí y no como secretos.

| Variable         | Valor                        |
|------------------|------------------------------|
| `PROD_API_URL`   | `https://tudominio.com/api`  |
| `PROD_SITE_URL`  | `https://tudominio.com`      |
| `PROD_SSH_HOST`  | IP elástica de la instancia  |

`PROD_API_URL` es **obligatoria**: se incrusta en el bundle del navegador. Si
falta, el job de despliegue falla a propósito en vez de publicar una imagen que
no funciona.

> El `HQ_SITE_HOST` que usan los routers de Traefik vive en el servidor, en
> `infra/compose/.env.prod`. Son dos valores distintos a propósito: si cambias
> de dominio no necesitas reconstruir las imágenes, solo reiniciar Traefik.

### 1.2 Secretos (pestaña *Secrets*)

| Secreto             | Para qué                                        |
|---------------------|-------------------------------------------------|
| `GHCR_DEPLOY_TOKEN` | La instancia **descarga** las imágenes           |
| `DEPLOY_SSH_KEY`    | Clave privada para entrar por SSH                |
| `DEPLOY_SSH_USER`   | `ubuntu`                                         |
| `DEPLOY_SSH_PORT`   | `22`                                             |

**Para subir imágenes no hace falta ningún PAT.** El workflow publica en GHCR con
el `GITHUB_TOKEN` del propio repo, que ya tiene el permiso `packages: write`
declarado en el propio `deploy.yml`. Solo hace falta un token, el de lectura.

> Ojo con esto, porque es la causa habitual de que el build falle: los Secrets
> deben crearse en la pestaña **Secrets** del **repositorio**. Si se crean como
> *Environment secrets* de `production`, el job `build` no los ve (no declara
> `environment:`) y el login a GHCR falla con `Error: Password required`.

Crea el token en **Settings → Developer settings → Personal access tokens**:

- `GHCR_DEPLOY_TOKEN` → permiso **Packages: Read only**

> ¿Por qué dos? El de escritura solo lo usa GitHub. El de lectura solo vive en la
> instancia. Si el primero se filtra, no permite leer nada del servidor.

---

## Paso 2 — Conectar la instancia con GitHub

### 2.1 Crear la clave SSH

En **tu máquina local** (no en la instancia):

```bash
ssh-keygen -t ed25519 -C "hq-prospectiva-deploy" -f ~/.ssh/hq_deploy
```

Se generan dos archivos: `hq_deploy` (privada) y `hq_deploy.pub` (pública).

### 2.2 Instalar la clave pública en la instancia

```bash
ssh-copy-id -i ~/.ssh/hq_deploy.pub ubuntu@IP_DE_LA_INSTANCIA
```

### 2.3 Copiar la clave privada al secreto

En **PowerShell** (Windows):

```powershell
Get-Content ~/.ssh/hq_deploy -Raw | Set-Clipboard
```

Pégalo en el secreto `DEPLOY_SSH_KEY` de GitHub. Debe incluir las líneas
`-----BEGIN OPENSSH PRIVATE KEY-----` y `-----END OPENSSH PRIVATE KEY-----`.

### 2.4 Abrir el puerto SSH

En el **Security Group** de la instancia añade una regla:

| Tipo     | Protocolo | Puerto | Origen                        |
|----------|-----------|--------|-------------------------------|
| SSH      | TCP       | 22     | `/32` con **tu IP de origen** |

> **Sobre abrir el 22 a `0.0.0.0/0`.** Es lo que hace la mayoría de/tutorials y
> funciona, pero deja el puerto abierto a todo internet. Con autenticación por
> clave (sin contraseñas) el riesgo es bajo, pero no es cero.
>
> El runner de GitHub cambia de IP en cada ejecución, por eso **no** puedes
> limitar el acceso a su IP. Opciones si prefieres cerrarlo del todo:
> - **Runner autoalojado** en la propia instancia (~100 MB de RAM): sin nada
>   abierto a internet. La opción más limpia de las tres, a cambio de tener que
>   mantener el runner actualizado en la máquina.
> - **SSM Session Manager** en vez de SSH: sin puerto 22, pero exige un VPC
>   endpoint o gateway de internet para el agente.
> - **Tailscale/WireGuard** y limitas el 22 a la red privada.

Empieza con tu IP en el origen. Si despliegas desde redes distintas, amplíalo.

---

## Paso 3 — Arrancar la instancia (una sola vez)

Entra por SSH y ejecuta:

```bash
git clone https://github.com/Innovacion-EAM/Hq-prospectiva2050.git
cd Hq-prospectiva2050

sudo HQ_SITE_HOST=tudominio.com \
     GHCR_DEPLOY_USER=tu_usuario_github \
     GHCR_DEPLOY_TOKEN=ghp_xxxxxxxxxxxx \
     ./scripts/deploy/bootstrap.sh
```

Qué hace el script, en orden:

1. Instala Docker CE + el plugin `docker compose` (si no estaba).
2. Añade tu usuario al grupo `docker`.
3. **Crea 2 GB de swap** — imprescindible en 1 GB de RAM.
4. Clona el repo en `/opt/hq-prospectiva2050`.
5. Genera `infra/compose/.env.prod` y `backend/.env.prod` con **secretos
   aleatorios** (`openssl rand -hex 24`) y permisos `600`.
6. Guarda el login de GHCR.
7. Ejecuta `scripts/deploy/deploy.sh`: pull → db-init → up → health check.

Al terminar imprime las URLs. **No vuelvas a ejecutarlo salvo que quieras
reintentarlo**: es idempotente y no pisa los secretos existentes, pero es
suficiente con hacerlo una vez.

> Si lo lanzaste **sin** `GHCR_DEPLOY_TOKEN`, el pull de imágenes privadas
> fallará. Soluciona con:
> ```bash
> cd /opt/hq-prospectiva2050
> make prod-login TOKEN=ghp_xxxxxxxxxxxx
> bash scripts/deploy/deploy.sh
> ```

### El usuario inicial del panel

El seed crea `admin@prospectiva.com` / `Admin123*`. **Cámbialo en cuanto entres**
en `/admin` → Ajustes → Usuarios. Es una contraseña pública del repo.

---

## Paso 4 — Primer despliegue

Las imágenes aún no existen en GHCR, así que primero hay que publicarlas.

```bash
git push origin main
```

O, sin tocar la rama, desde la pestaña **Actions → Build & Deploy → Run
workflow**, marca `deploy: true`.

Comprueba en **Packages** (o en <https://ghcr.io>) que aparecen:

- `hq-backend:latest`
- `hq-frontend:latest`
- `hq-backoffice:latest`

Cuando termine, en la instancia:

```bash
cd /opt/hq-prospectiva2050
make prod-smoke
```

Esperado:

```
  Host probado: tudominio.com
[1/4] Contenedores:
  hq-db: Up 2 minutes (healthy)
  hq-backend: Up 2 minutes (healthy)
  ...
[2/4] Frontend y backoffice (vía traefik):
  /        → HTTP 200
  /admin   → HTTP 200
[3/4] Backend health (db):
  {"status":"ok","database":"up",...}
```

Si `/` o `/admin` devuelven **404** y la API responde, el problema casi
seguro es `HQ_SITE_HOST`: los routers de Traefik filtran por host.

```bash
grep HQ_SITE_HOST infra/compose/.env.prod   # debe coincidir con el dominio
make prod-restart                          # el host se hornea al arrancar Traefik
```

---

## Paso 5 — Despliegues siguientes

```bash
git checkout main
git pull
# ... cambios ...
git push origin main
```

Y ya está. Actions hace el resto. Para ver el progreso:

**Actions → Build & Deploy** en GitHub.

> **Comando clave en el servidor** — cuando quieras traer lo último de GHCR sin
> esperar al push automático (p. ej. para rollback manual, hotfix o forzar
> reinicio):
>
> ```bash
> cd /opt/hq-prospectiva2050
> bash scripts/deploy/deploy.sh
> ```
>
> Ese script hace: `git pull` → `docker login ghcr.io` → `docker compose pull`
> → `db-init` → `docker compose up -d` → health check. Es **idempotente** y
> seguro ejecutarlo las veces que haga falta.

Y ya está. Actions hace el resto. Para ver el progreso:

**Actions → Build & Deploy** en GitHub.

### Qué dispara qué

| Evento                    | Construye | Publica | Despliega |
|---------------------------|-----------|---------|-----------|
| PR a `main`/`develop`     | sí (solo `ci.yml`) | no | no |
| Push a `develop`          | sí        | sí (`develop`) | no |
| Push a `main`             | sí        | sí (`latest`)  | **sí** |
| Tag `v1.2.3`             | sí        | sí (`1.2.3`, `1.2`, `latest`) | **sí** |
| Manual + `deploy: true`   | sí        | sí      | **sí** |

### Tags que publica

- `latest` — última versión en `main`
- `main`, `develop` — por rama
- `1.2.3`, `1.2` — al etiquetar con `v1.2.3` (fáciles de fijar por versión)
- `<sha>` — traza exacta de qué commit está en producción

### Publicar una versión con etiqueta

```bash
git tag v1.0.0 && git push origin v1.0.0
```

Fija la versión de forma permanente y actualiza `latest`.

### Aprobar el despliegue antes de que salga

El job de despliegue usa el environment `production`. En
**Settings → Environments → production** puedes activar *Required reviewers* y
cada despliegue a `main` te pedirá un clic. Muy recomendable para no subir a
producción un commit sin querer.

---

## Rollback

Cada versión anterior se conserva en el servidor con la etiqueta `:previous`.
No es una limpieza automática: `deploy.sh` etiqueta la imagen que está en
marcha **antes** de descargar la nueva. Sin ese paso, al tirar de `:latest` la
anterior se quedaría sin ninguna etiqueta y la poda se la llevaría.

```bash
cd /opt/hq-prospectiva2050

# Qué hay disponible (cada servicio con :latest y :previous)
docker images | grep hq-

# Vuelve a la versión anterior
make prod-rollback TAG=previous
make prod-smoke
```

Ajuste del margen de rollback:

```bash
KEEP_IMAGE_VERSIONS=3 bash scripts/deploy/deploy.sh   # 3 versiones
```

> El volumen de la instancia es de 6,7 GB. Subir mucho este número llena el
> disco, y cuando se llena se para la base de datos: no hay despliegue posible.
> Con 2 (el valor por defecto) sobra.

Rollback permanente: fija los tags en `infra/compose/.env.prod` para que un
despliegue posterior no los sobrescriba.

```bash
echo 'HQ_BACKEND_IMAGE=ghcr.io/innovacion-eam/hq-backend:v1.0.0'   >> infra/compose/.env.prod
echo 'HQ_FRONTEND_IMAGE=ghcr.io/innovacion-eam/hq-frontend:v1.0.0' >> infra/compose/.env.prod
echo 'HQ_BACKOFFICE_IMAGE=ghcr.io/innovacion-eam/hq-backoffice:v1.0.0' >> infra/compose/.env.prod
```

Rollback permanente: fija los tags en `infra/compose/.env.prod` para que un
despliegue posterior no los sobrescriba.

```bash
echo 'HQ_BACKEND_IMAGE=ghcr.io/innovacion-eam/hq-backend:v1.0.0'   >> infra/compose/.env.prod
echo 'HQ_FRONTEND_IMAGE=ghcr.io/innovacion-eam/hq-frontend:v1.0.0' >> infra/compose/.env.prod
echo 'HQ_BACKOFFICE_IMAGE=ghcr.io/innovacion-eam/hq-backoffice:v1.0.0' >> infra/compose/.env.prod
```

El `rollback` no deshace cambios de esquema en la base de datos. `db-init` solo
**añade** columnas y tablas, nunca las borra, así que una versión antigua
funcionará contra un esquema más nuevo, pero al revés puede no ser cierto.

---

## Limpieza de disco e imágenes

El volumen de la instancia es de **6,7 GB**, y cada despliegue baja del orden de
560 MB. Sin limpieza, las versiones viejas se acumulan y el disco se llena;
cuando eso pasa se para la base de datos y ya no hay despliegue posible. Por eso
`deploy.sh` limpia solo, en dos sitios distintos.

### En el servidor

`deploy.sh` hace dos cosas, en este orden:

1. **Antes** de descargar la imagen nueva, etiqueta la que está en marcha como
   `:previous`. Así siempre queda una versión anterior a la que volver.
2. **Después** de arrancar, borra las que sobren. Se conservan
   `KEEP_IMAGE_VERSIONS` por servicio (2 por defecto: la desplegada y la
   anterior).

```bash
cd /opt/hq-prospectiva2050

# Simular, sin borrar nada
DRY_RUN=yes KEEP_VERSIONS=2 bash scripts/deploy/images.sh prune \
  ghcr.io/innovacion-eam/hq-backend \
  ghcr.io/innovacion-eam/hq-frontend \
  ghcr.io/innovacion-eam/hq-backoffice

# Qué ocupa el disco
docker system df
df -h /
```

La poda **nunca borra** la imagen que usa un contenedor en marcha, ni la
etiqueta `:latest`, ni la `:previous`. La protección es por nombre y por uso, no
por antigüedad: si se protegiera solo "lo más reciente", cualquier imagen con
fecha mayor (una reconstrucción, una etiqueta puesta a mano) desplazaría a
`latest` y se llevaría por delante la imagen que está sirviendo.

> Ojo con Docker 29 y el snapshotter de containerd: el ID que muestra
> `docker image ls` y el que registra el contenedor no siempre coinciden. Por eso
> el script protege las dos referencias, no solo una.

### En GHCR

Cada push a `main` publica una versión nueva y **ninguna se borra sola**: la
cuota de almacenamiento de la organización se llena en semanas.

| Qué | Dónde |
|---|---|
| Workflow | [`.github/workflows/cleanup-ghcr.yml`](../.github/workflows/cleanup-ghcr.yml) |
| Script | `scripts/deploy/prune-ghcr.sh` |
| Cuándo | lunes 04:17 UTC, y a mano desde *Actions → Limpieza de imágenes en GHCR* |

Necesita el secreto **`GHCR_CLEANUP_TOKEN`**: un PAT con el scope
`delete:packages`. Ojo, `read:packages` **no** sirve: es el permiso que
permite leer los paquetes, y hace falta el de borrar. El `GITHUB_TOKEN` del
propio workflow tampoco vale, aunque ya tenga `packages: write`.

```bash
# Avatar → Settings → Developer settings → Personal access tokens
# → Tokens (classic) → Generate new token (classic)
# Scope: SOLO delete:packages
# → Settings → Secrets and variables → Actions → New repository secret
```

La primera vez, conviene probarlo en modo simulación (el botón de dispatched
trae `dry_run` activado por defecto) y comprobar la lista antes de borrar.

---

## Copias de seguridad

La base de datos vive en el volumen `pgdata`, dentro del disco de la instancia.
**Una instancia no es un backup.**

```bash
cd /opt/hq-prospectiva2050
make backup                              # → backups/AAAAMMDD-HHMMSS-back.pg
make backup-list
```

Copia además los ficheros subidos (fotos de noticias, documentos, logos), que
viven en el volumen `hq-uploads` y **no** están en la base de datos:

```bash
docker run --rm -v hq-prospectiva2050_hq-uploads:/data -v "$PWD/backups":/backup \
  alpine tar czf /backup/uploads-$(date +%Y%m%d).tar.gz -C /data .
```

Automatiza la subida a S3 con una tarea de `systemd timer` o un cron:

```bash
crontab -e
# 3:17 AM todos los días
17 3 * * * cd /opt/hq-prospectiva2050 && make backup && \
  aws s3 cp "backups/$(ls -1t backups/*.pg | head -1)" s3://mi-bucket/hq/
```

---

## Diagnóstico de problemas

### Todos los comandos de un vistazo

```bash
cd /opt/hq-prospectiva2050

make prod-ps                 # estado
make prod-logs SERVICE=backend   # logs de un servicio (vacío = todos)
make prod-smoke              # prueba de extremo a extremo
make errors SERVICE=backend  # solo líneas con error
make health                  # ver sección de mantenimiento
```

### El sitio devuelve 404

Casi siempre es el host. Los routers de Traefik filtran por `HQ_SITE_HOST`:

```bash
grep HQ_SITE_HOST infra/compose/.env.prod
curl -s -o /dev/null -w '%{http_code}\n' -H "Host: tudominio.com" http://localhost/
make prod-restart
```

### La API responde en `/api` pero el frontend carga datos rotos

Comprueba que la URL incrustada en el bundle es la buena:

```bash
docker exec hq-frontend grep -o 'https\?://[^"]*' /usr/share/nginx/html/assets/*.js | head
```

Si sale `localhost`, `PROD_API_URL` no estaba configurada en el momento del
build. Corrige la variable y vuelve a desplegar.

### El backend se reinicia en bucle

Casi siempre es la base de datos vacía: en producción `DB_SYNCHRONIZE=false`, así
que sin `db-init` no existen tablas.

```bash
make prod-logs SERVICE=backend | grep -i "does not exist"
make prod-db-init
```

### El despliegue falla con `pull access denied`

El token de lectura caducó o no tiene permiso sobre el paquete.

```bash
make prod-login TOKEN=ghp_xxxxxxxxxxxx
bash scripts/deploy/deploy.sh
```

En GitHub, el package debe permitir acceso: **Package settings → Manage
package access** → tu usuario/organización.

### El despliegue falla en el paso de SSH

```bash
# Desde tu máquina, para ver el error de verdad
ssh -i ~/.ssh/hq_deploy ubuntu@IP_DE_LA_INSTANCIA 'cd /opt/hq-prospectiva2050 && bash scripts/deploy/deploy.sh'
```

Comprueba que `PROD_SSH_HOST` es la IP **pública** y que el security group
permite el 22 desde una IP de GitHub Actions.

### El servidor va lento o se queda sin memoria

```bash
free -h                        # debería haber ~2 GB de swap
docker stats --no-stream
dmesg | grep -i "out of memory" # si aparece, faltó swap
```

### Disco lleno

```bash
docker system df
docker image prune -a --filter "until=168h"   # borra imágenes de más de una semana
make backup-clean N=7
```

---

## Activar HTTPS

El sitio arranca en HTTP. Traefik ya tiene el puerto 443 publicado y preparado,
pero falta la decisión de certificados (estaba pendiente en `TODO.md`).

### Opción A — Let's Encrypt automático (recomendada)

Crea `infra/traefik/dynamic/tls.yml`:

```yaml
tls:
  options:
    default:
      minVersion: VersionTLS12
  certificatesResolvers:
    letsencrypt:
      acme:
        #letsencrypt.org/rate-limits → 5 nuevos certificados/semana
        email: admin@tudominio.com
        storage: /letsencrypt/acme.json
        httpChallenge:
          entryPoint: web
```

Y añade el volumen del certificado en `docker-compose.yml`, servicio `traefik`:

```yaml
    volumes:
      - ../traefik/traefik.yml:/etc/traefik/traefik.yml:ro
      - ../traefik/dynamic:/etc/traefik/dynamic:ro
      - letsencrypt:/letsencrypt
```

```yaml
volumes:
  letsencrypt:
```

Luego añade a cada router de `routes.yml`:

```yaml
    frontend:
      rule: "Host(`{{ env "HQ_SITE_HOST" }}`) && PathPrefix(`/`)"
      entryPoints: [web]
      tls:
        certResolver: letsencrypt
      service: frontend
```

Requisitos: el puerto 80 debe ser accesible desde internet (lo es, el challenge
HTTP lo necesita) y el dominio ya apuntando a la instancia.

Cuidado: el dominio **no puede** estar detrás de Cloudflare en modo "proxy
naranja" durante la emisión, o el challenge falla. Usa modo DNS-only al
principio.

### Opción B — certificados manuales

Si tu proveedor emite certificados por otra vía:

```yaml
tls:
  stores:
    default:
      defaultCertificate:
        certFile: /certs/fullchain.pem
        keyFile: /certs/privkey.pem
```

y monta los `.pem` en el contenedor. Renueva tú antes de que caduquen.

### Redirección de HTTP a HTTPS

Una vez emitido el certificado, añade a `routes.yml` un router que redirija:

```yaml
http:
  routers:
    http-to-https:
      rule: "Host(`{{ env "HQ_SITE_HOST" }}`)"
      entryPoints: [web]
      middlewares: [redirect-to-https]
      service: noop@internal
  middlewares:
    redirect-to-https:
      redirectScheme:
        scheme: https
        permanent: true
```

---

## Hardening y decisiones abiertas

Cosas que **no** están resueltas y deberías revisar antes de dar por cerrado el
despliegue:

### 1. `JWT_SECRET` con valor por defecto

`backend/src/auth/auth.module.ts` cae a `'dev-secret'` si `JWT_SECRET` no está
definido. `bootstrap.sh` siempre lo genera, así que **el despliegue automatizado
está cubierto**. Pero si alguien arranca el backend a mano sin la variable,
todos los tokens quedan firmados con una clave pública del repo. Conviene
endurecerlo: fallar al arrancar si falta.

### 2. `isAdmin()` en rutas públicas

`backend/src/data/noticias.controller.ts` combina `@Public()` con un `isAdmin()`
hecho a mano que hace `jwt.verify()` por su cuenta. Acepta también el rol
`editor`, así que un editor puede listar y leer noticias no publicadas por la
ruta pública, sin pasar por el guard. Debería ser un endpoint autenticado
 aparte.

### 3. Sin rate limiting en los formularios públicos

`POST /api/forms/contacto` y `POST /api/forms/inscripciones` son `@Public()` y no
validan ni limitan nada. Expostas a internet, cualquiera puede llenar la tabla
`mensajes` con spam o tumbar el backend. Un `@Throttle()` de Nest
(`@nestjs/throttler`) lo resuelve en unas pocas líneas.

### 4. URLs de media fijadas con el host

`backend/src/upload/upload.service.ts` guarda la URL absoluta con el esquema y
host del momento de la subida. Hoy sirviendo por HTTP, mañana con HTTPS, o si
cambias de dominio, todas las URLs guardadas quedan obsoletas. Debería
guardarse solo el path (`/api/uploads/x.png`) y componerse en el cliente.

### 5. `trust proxy` no activado

`backend/src/main.ts` no llama a `app.set('trust proxy', 1)`. Sin eso, detrás
de Traefik con TLS, `req.protocol` devuelve `http` aunque el cliente use
HTTPS. Afecta a la URL que se guarda en las subidas (punto 4).

### 6. Sin HTTPS (ver sección anterior)

Mientras no se active, las contraseñas del panel viajan en claro por la red.

### 7. Backups automáticos

`make backup` es manual. Sin un cron, la pérdida de datos es cuestión de tiempo.
Ver la sección de copias de seguridad.

### 8. `synchronize` en el primer arranque

`db-init` usa `synchronize` de TypeORM para crear el esquema. Es la vía
práctica aquí, pero a largo plazo lo correcto son **migraciones** versionadas
(TypeORM migrations), que permiten deshacer cambios. Con el esquema actual, sin
migraciones, cada cambio de entidad obliga a revisar a mano qué pasa en
producción.

---

## Resumen: el día a día

```bash
# Cambiar código
git checkout main && git pull
# ... editar ...
git commit -am "feat: lo que sea"
git push origin main

# GitHub hace el resto. Ver el resultado en Actions.

# Si algo sale mal en el servidor
cd /opt/hq-prospectiva2050
make prod-logs SERVICE=backend
make prod-smoke
make prod-rollback TAG=v1.0.0
```
