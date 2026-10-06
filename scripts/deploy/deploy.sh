#!/usr/bin/env bash
# ── Despliegue continuo en el servidor ────────────────────────────────────────
# Lo ejecuta GitHub Actions por SSH tras publicar las imágenes en GHCR
# (.github/workflows/deploy.yml). También se puede lanzar a mano:
#
#     bash scripts/deploy/deploy.sh
#
# Idempotente: se puede repetir sin miedo. NO compila nada (eso ocurre en CI);
# aquí solo se descargan imágenes y se rearran los contenedores.
#
# Variables de entorno (opcionales):
#   APP_DIR             raíz del repo en el servidor (por defecto /opt/hq-prospectiva2050)
#   GHCR_DEPLOY_TOKEN   token de lectura de GHCR. Si no se indica, se reutiliza
#                       el login ya guardado en ~/.docker/config.json
#   GHCR_DEPLOY_USER    usuario de GitHub para ese login
#   RUN_DB_INIT         yes|no. yes (por defecto) sincroniza el esquema antes de
#                       rearrancar. Es idempotente y corrige desajustes de esquema.
#   SKIP_GIT_PULL       yes|no. yes omite `git pull` (si el repo del servidor lo
#                       actualiza otro proceso).
#   IMAGE_RETENTION_HOURS
#                       horas que se guardan las imágenes ya sin usar (para
#                       rollback). Por defecto 72. Bajarlo llena menos disco y
#                       deja menos margen para volver atrás.
#   HQ_TRAEFIK_RESTART  1|yes para forzar el recreado de Traefik. Necesario tras
#                       cambiar HQ_SITE_HOST, porque los routers lo leen de la
#                       variable de entorno del contenedor, no del archivo.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/hq-prospectiva2050}"
RUN_DB_INIT="${RUN_DB_INIT:-yes}"
SKIP_GIT_PULL="${SKIP_GIT_PULL:-no}"
# Horas que se conservan las imágenes ya sin usar, para poder hacer rollback.
IMAGE_RETENTION_HOURS="${IMAGE_RETENTION_HOURS:-72}"
COMPOSE_DIR="$APP_DIR/infra/compose"

log()  { printf '\n\033[1;34m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[!]\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31m[x]\033[0m %s\n' "$*" >&2; exit 1; }

# ── 1. Localización ───────────────────────────────────────────────────────────
[ -d "$APP_DIR" ] || die "No existe $APP_DIR. Ejecuta antes: sudo bash scripts/deploy/bootstrap.sh"
cd "$APP_DIR"
[ -f "$COMPOSE_DIR/docker-compose.yml" ] || die "$COMPOSE_DIR/docker-compose.yml no encontrado"
[ -f "$COMPOSE_DIR/.env.prod" ] || die "Falta infra/compose/.env.prod (créalo con bootstrap.sh)"

# ── 2. Sincronizar el repo ANTES de tocar nada ────────────────────────────────
# Todo lo que viene después lee docker-compose*.yml y la config de Traefik del
# disco, así que este paso tiene que ir primero: si no, un despliegue con
# cambios de configuración arrancaría con los archivos de la versión anterior.
if [ "$SKIP_GIT_PULL" = "no" ]; then
  log "Actualizando el repo a la última versión publicada"
  if ! git pull --ff-only; then
    # En el servidor nunca se edita código a mano. Si el árbol está sucio
    # (config tocada a mano, por ejemplo) se descarta. Los .env están
    # ignorados por git, así que `reset --hard` NO los borra.
    branch="$(git rev-parse --abbrev-ref HEAD)"
    warn "git pull --ff-only falló; se hace reset --hard a origin/$branch"
    git fetch --quiet origin
    git reset --hard "origin/$branch"
  fi
  git log --oneline -1
fi

# ── 3. Entorno ────────────────────────────────────────────────────────────────
# .env.prod es KEY=VALUE simple: `set -a` lo pasa al entorno, que es de donde
# lee la interpolación de `docker compose` y de donde sale HQ_SITE_HOST.
set -a
# shellcheck disable=SC1091
. "$COMPOSE_DIR/.env.prod"
set +a
HQ_SITE_HOST="${HQ_SITE_HOST:-localhost}"

cd "$COMPOSE_DIR"
COMPOSE=(docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod)

# ── 4. Traefik, si hay que recrearlo ───────────────────────────────────────────
case "${HQ_TRAEFIK_RESTART:-}" in
  1|yes|true)
    log "Recreando Traefik (HQ_SITE_HOST=$HQ_SITE_HOST)"
    "${COMPOSE[@]}" up -d --force-recreate traefik
    ;;
esac

# ── 5. Login en el registro ───────────────────────────────────────────────────
# El PAT se pasa por el entorno, nunca como argumento de línea de comandos
# (quedaría visible en `ps` para cualquier usuario de la máquina).
if [ -n "${GHCR_DEPLOY_TOKEN:-}" ]; then
  log "Autenticando en ghcr.io"
  printf '%s' "$GHCR_DEPLOY_TOKEN" | docker login ghcr.io \
    --username "${GHCR_DEPLOY_USER:-${USER:-deploy}}" --password-stdin >/dev/null
  unset GHCR_DEPLOY_TOKEN
else
  log "Sin token: se reutiliza el login existente de ~/.docker/config.json"
fi

# ── 6. Descargar imágenes ─────────────────────────────────────────────────────
# El overlay lleva `pull_policy: always` porque con el tag `latest` Docker, por
# defecto, considersa la imagen local "presente" y no baja la nueva.
log "Descargando imágenes de GHCR"
"${COMPOSE[@]}" pull

# ── 7. Esquema de base de datos ───────────────────────────────────────────────
# La db vive en el volumen pgdata: es persistente, así que su esquema hay que
# sincronizarlo aparte aunque las imágenes sean nuevas. db-init es idempotente
# (crea lo que falta, siembra solo tablas vacías) y usa el SeederService real.
if [ "$RUN_DB_INIT" = "yes" ]; then
  log "Sincronizando el esquema de la base de datos"
  # --wait: no seguir hasta que postgres acepte conexiones. Sin esto, db-init
  # puede intentar conectar antes de que el postgres esté listo y fallar.
  "${COMPOSE[@]}" up -d --wait postgres
  "${COMPOSE[@]}" run --rm --no-deps -T backend node dist/cli/db-init.js
else
  warn "RUN_DB_INIT=no: se arranca sin comprobar el esquema"
fi

# ── 8. Rearrancar ─────────────────────────────────────────────────────────────
log "Rearrancando servicios"
"${COMPOSE[@]}" up -d --remove-orphans

# ── 9. Limpiar imágenes ───────────────────────────────────────────────────────
# Dos pasadas, y el orden importa:
#
# 1. `dangling`: solo las capas huérfanas de un build. No se pierde ninguna
#    versión desplegable.
# 2. Las CON etiqueta que ya no usa ningún contenedor y llevan más de
#    IMAGE_RETENTION_HOURS horas. Esto es lo que evita que el disco se llene:
#    el volumen de la instancia es de 6,7 GB y cada despliegue baja ~560 MB de
#    capas nuevas. Sin esta segunda pasada, las versiones viejas se acumulan
#    para siempre y el servidor acaba sin espacio (la base de datos es lo
#    primero que se para, y sin disco no hay despliegue posible).
#
# El plazo deja varias versiones de rollback disponibles. Bajarlo mucho quita
# margen de volver atrás; subirlo llena el disco. Ante la duda, 72 h.
log "Limpiando imágenes sin etiqueta"
docker image prune -f >/dev/null

log "Limpiando versiones antiguas (sin usar, más de ${IMAGE_RETENTION_HOURS} h)"
# -f = no preguntar. --all = también las que tienen etiqueta, siempre que no
# las use ningún contenedor. `until` se cuenta desde la fecha de creación.
docker image prune -f --all --filter "until=${IMAGE_RETENTION_HOURS}h" >/dev/null

# ── 10. Comprobación de salud ─────────────────────────────────────────────────
# OJO: la cabecera Host debe coincidir con HQ_SITE_HOST. Los routers de Traefik
# filtran por host, así que sin ella todo responde 404 y el chequeo mentiría.
log "Comprobando estado de los servicios"
"${COMPOSE[@]}" ps

health_url="http://127.0.0.1/api/health/db"
probe() {
  if command -v curl >/dev/null 2>&1; then
    curl -s -o /dev/null -w '%{http_code}' -H "Host: $HQ_SITE_HOST" "$health_url" || echo 000
  else
    wget -q -S -O /dev/null --header="Host: $HQ_SITE_HOST" "$health_url" 2>&1 \
      | awk '/^  HTTP\//{code=$2} END{print code ? code : "000"}'
  fi
}

ok=0
for i in $(seq 1 30); do
  code="$(probe)"
  if [ "$code" = "200" ]; then ok=1; break; fi
  printf '  intento %02d/30 — HTTP %s\n' "$i" "$code"
  sleep 2
done

if [ "$ok" = "1" ]; then
  log "Despliegue correcto. API sana (Host: $HQ_SITE_HOST)"
  exit 0
fi

warn "La API no respondió 200 tras 60 s. Diagnóstico:"
"${COMPOSE[@]}" logs --tail 40 backend >&2
exit 1
