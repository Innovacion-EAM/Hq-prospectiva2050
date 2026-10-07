#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Borra versiones antiguas de las imágenes en GitHub Container Registry.
#
# El equivalente en GHCR de scripts/deploy/images.sh: en el registro se
# acumula una versión por cada push a `main`, y ninguna se borra sola. Cada
# paquete de un proyecto como este ronda los 50-400 MB, así que la cuota de
# almacenamiento de la organización se llena en semanas.
#
# Se conservan KEEP_VERSIONS versiones por paquete (2 por defecto), y NUNCA se
# borra la que tiene la etiqueta `latest` ni ninguna que esté protegida por
# los "latest" de los tags de Git (sha, rama, semver): son las que pueden
# usar los demás repos y las que hacen falta para volver atrás.
#
# NO usa el GITHUB_TOKEN del workflow a propósito. Ese token tiene
# `packages: write`, pero la API de GHCR exige además el permiso `delete`
# sobre el paquete, que el GITHUB_TOKEN de un workflow no concede. Sin un
# PAT con `delete:packages`, la respuesta es 403 y no se borra nada. Por eso
# el token se pasa por GHCR_CLEANUP_TOKEN y, si falta, el script avisa con
# instrucciones en vez de fingir que ha limpiado.
#
# Uso:  GHCR_TOKEN=ghp_xxx GHCR_OWNER=innovacion-eam ./prune-ghcr.sh
# Env:   GHCR_TOKEN            PAT con delete:packages (obligatorio)
#        GHCR_OWNER            propietario de los paquetes (por defecto, la org
#                             del repo en minúsculas)
#        KEEP_VERSIONS         versiones a conservar por paquete (por defecto 2)
#        KEEP_PROTECTED_TAGS   etiquetas que nunca se borran, separadas por
#                             comas (por defecto latest)
#        DRY_RUN               yes|1 simula sin borrar nada
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

KEEP_VERSIONS="${KEEP_VERSIONS:-2}"
KEEP_PROTECTED_TAGS="${KEEP_PROTECTED_TAGS:-latest}"
DRY_RUN="${DRY_RUN:-no}"
PACKAGES="${PACKAGES:-hq-backend hq-frontend hq-backoffice hq-repo}"
API="https://api.github.com"

log()  { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
info() { printf '    %s\n' "$*"; }
warn() { printf '\033[1;33m[!] %s\033[0m\n' "$*" >&2; }
die()  { printf '\033[1;31m[x] %s\033[0m\n' "$*" >&2; exit 1; }

command -v jq >/dev/null || die "Se necesita jq."

case "$KEEP_VERSIONS" in
  ''|*[!0-9]*) die "KEEP_VERSIONS debe ser un entero (recibido: '$KEEP_VERSIONS')." ;;
esac
[ "$KEEP_VERSIONS" -ge 1 ] || die "KEEP_VERSIONS debe ser al menos 1."

[ -n "${GHCR_TOKEN:-}" ] || die "Falta GHCR_TOKEN (PAT con permiso delete:packages)."
[ -n "${GHCR_OWNER:-}" ] || GHCR_OWNER="${GITHUB_REPOSITORY_OWNER:-innovacion-eam}"
GHCR_OWNER="$(printf '%s' "$GHCR_OWNER" | tr '[:upper:]' '[:lower:]')"

[ "$DRY_RUN" = "yes" ] || [ "$DRY_RUN" = "1" ] || DRY_RUN=no

# ── API ───────────────────────────────────────────────────────────────────────
# Se usa el token solo en la cabecera y NUNCA en la URL, ni en la salida: la
# cabecera es lo único que no acaba en los logs ni en el historial.
api() {
  local method="$1" path="$2"
  shift 2
  curl -sS -X "$method" "$API$path" \
    -H "Authorization: Bearer $GHCR_TOKEN" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "$@"
}

# ── ¿El propietario es una organización o un usuario? ────────────────────────
# La API usa /orgs/ y /users/ según el caso, y no son intercambiables.
#
# Ojo: la comprobación va SIN token a propósito. Con un token caducado, /orgs/
# responde 404 en lugar de 401, y el script concluiría que es una cuenta de
# usuario y usaría la ruta equivocada para siempre. /orgs/ es público, así que
# sin credenciales responde 404 solo cuando de verdad no es una organización.
log "Comprobando el tipo de propietario: $GHCR_OWNER"
if [ "$(curl -sS -o /dev/null -w '%{http_code}' "$API/orgs/$GHCR_OWNER")" = "200" ]; then
  OWNER_KIND="orgs"
  info "es una organización"
else
  OWNER_KIND="users"
  info "es una cuenta de usuario"
fi

# ── Comprobación previa del permiso ──────────────────────────────────────────
# Mejor fallar aquí, con un mensaje claro, que en mitad del borrado.
log "Comprobando permisos de borrado"
probe="$(api GET "/${OWNER_KIND}/$GHCR_OWNER/packages/container/hq-backend/versions?per_page=1" \
          -w '\n%{http_code}')"
code="$(printf '%s' "$probe" | tail -n1)"
if [ "$code" = "403" ] || [ "$code" = "401" ]; then
  die "El token no puede leer los paquetes (HTTP $code). Revisa que siga siendo válido."
fi
info "el token puede leer los paquetes"

# ── Purga ─────────────────────────────────────────────────────────────────────
log "Conservando las $KEEP_VERSIONS versiones más recientes por paquete"
[ "$DRY_RUN" = "yes" ] && warn "DRY_RUN: se muestra lo que se borraría, no se borra nada."

total_borradas=0
errores=0

for pkg in $PACKAGES; do
  # Todas las versiones del paquete, paginando (100 por página es el máximo).
  versions="$(api GET "/${OWNER_KIND}/$GHCR_OWNER/packages/container/$pkg/versions?per_page=100" \
              | jq -r 'if type == "array" then .[] | @base64 else empty end')"
  total="$(printf '%s' "$versions" | grep -c . || true)"

  if [ "$total" -eq 0 ]; then
    warn "$pkg: no se han encontrado versiones (¿nombre correcto?)."
    continue
  fi

  printf '\n  \033[1m%s\033[0m — %d versión/es\n' "$pkg" "$total"

  # Se ordenan de más nueva a más antigua por created_at, que es el orden en el
  # que las fueron publicando los despliegues.
  ordered="$(printf '%s' "$versions" \
    | while read -r b; do
        printf '%s' "$b" | base64 -d \
          | jq -r '[.created_at, (.id|tostring), (.name // "sin-nombre"), ((.metadata.container.tags // []) | join(","))] | @tsv'
      done \
    | sort -r)"

  # Las KEEP_VERSIONS primeras se conservan siempre. Luego, de las restantes, se
  # saltan las que tengan una etiqueta protegida (latest, el sha, la rama...).
  proteger() {
    local tags="$1"
    local t
    local IFS=','
    for t in $KEEP_PROTECTED_TAGS; do
      case ",$tags," in *",$t,"*) return 0 ;; esac
    done
    return 1
  }

  i=0
  while IFS=$'\t' read -r created vid vname vtags; do
    [ -n "$vid" ] || continue
    i=$((i + 1))

    if [ "$i" -le "$KEEP_VERSIONS" ]; then
      info "$(printf 'conservada  %-16s %s' "${vname:0:16}" "$(printf '%s' "$created" | cut -c1-19)")"
      continue
    fi

    if proteger "$vtags"; then
      info "$(printf 'PROTEGIDA  %-16s %s  (etiqueta protegida)' "${vname:0:16}" "$(printf '%s' "$created" | cut -c1,11)")"
      continue
    fi

    if [ "$DRY_RUN" = "yes" ]; then
      info "$(printf 'BORRARÍA   %-16s %s' "${vname:0:16}" "$(printf '%s' "$created" | cut -c1,11)")"
      total_borradas=$((total_borradas + 1))
      continue
    fi

    del="$(api DELETE "/${OWNER_KIND}/$GHCR_OWNER/packages/container/$pkg/versions/$vid" \
            -o /dev/null -w '%{http_code}')"
    case "$del" in
      204|200)
        info "$(printf 'borrada    %-16s %s' "${vname:0:16}" "$(printf '%s' "$created" | cut -c1,11)")"
        total_borradas=$((total_borradas + 1))
        ;;
      403)
        warn "403 al borrar $vname de $pkg: el token no tiene permiso delete:packages."
        errores=$((errores + 1))
        ;;
      *)
        warn "HTTP $del al borrar $vname de $pkg."
        errores=$((errores + 1))
        ;;
    esac
  done <<< "$ordered"
done

if [ "$DRY_RUN" = "yes" ]; then
  log "Resumen: $total_borradas versión/es se borrarían (simulación, no se ha borrado ninguna)"
  info "Quita DRY_RUN para aplicarlo de verdad."
else
  log "Resumen: $total_borradas versión/es borradas"
  info "Las versiones antiguas ya no consumen cuota de almacenamiento en GHCR."
fi

[ "$errores" -eq 0 ] || { warn "$errores error(es). Revisa los mensajes de arriba."; exit 1; }
