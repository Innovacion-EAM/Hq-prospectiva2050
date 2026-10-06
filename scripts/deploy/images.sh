#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Gestión de versiones de imagen en el servidor.
#
# El volumen de la instancia es pequeño (6,7 GB) y cada despliegue baja del
# orden de 560 MB de capas. Si nada las limpia, las versiones viejas se
# acumulan y el disco se llena; cuando eso pasa, la base de datos es lo
# primero que se para y ya no se puede ni desplegar.
#
# Se conservan KEEP_VERSIONS versiones por servicio (2 por defecto: la que
# está desplegada y la anterior, para poder hacer rollback).
#
# Dos acciones:
#
#   tag-previous   Etiqueta como :previous la imagen que hay en marcha. Se
#                  ejecuta ANTES de `docker compose pull`. Sin esto no hay
#                  penúltima: al tirar de `:latest` abajo, la imagen anterior
#                  se queda sin etiqueta y el prune la borraría, dejando el
#                  servidor sin ninguna versión a la que volver.
#
#   prune          Borra las versiones que sobren. Se ejecuta DESPUÉS de
#                  `docker compose up`.
#
# ── LO QUE ESTA PODA NUNCA TOCA ──────────────────────────────────────────────
# El principio es NO fiarse de la fecha para decidir qué está en producción.
# Ordenar por "lo más reciente" parece suficiente, pero es un error: cualquier
# imagen con fecha más nueva que la desplegada (una reconstrucción de una
# etiqueta vieja, una imagen etiquetada a mano) empuja a `latest` fuera del
# lote y la borra. Ya pasó: la poda se llevó la imagen que estaba sirviendo.
#
# Por eso la protección es por NOMBRE y por USO, no por antigüedad:
#
#   1. La referencia que usa cada contenedor (.Config.Image), por ejemplo
#      `ghcr.io/.../hq-frontend:latest`. Si existe, se conserva.
#   2. La imagen real que tiene en marcha cada contenedor (.Image). Se
#      comparan las dos porque con el snapshotter de containerd (Docker 29)
#      el ID de `docker image ls` y el que registra el contenedor no siempre
#      coinciden.
#   3. Las etiquetas `:previous` de cada servicio.
#   4. Solo si sobra sitio en el presupuesto, se rellena con las versiones
#      más recientes que no estén protegidas.
#
# Y por debajo de eso, dos redes de seguridad de Docker: sin `-f`, el daemon
# se niega a borrar una imagen que use un contenedor, y `docker image rm`
# avisa en vez de destruir. Un error aquí deja el sitio caído.
#
# Uso:  images.sh <tag-previous|prune> <repo> [<repo> ...]
# Env:   KEEP_VERSIONS  versiones a conservar por servicio (por defecto 2)
#        DRY_RUN        yes|1 simula sin borrar nada
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

KEEP_VERSIONS="${KEEP_VERSIONS:-2}"
DRY_RUN="${DRY_RUN:-no}"
ACCION="${1:-}"
shift || true

log()  { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
info() { printf '    %s\n' "$*"; }
warn() { printf '\033[1;33m[!] %s\033[0m\n' "$*" >&2; }
die()  { printf '\033[1;31m[x] %s\033[0m\n' "$*" >&2; exit 1; }

case "$ACCION" in
  tag-previous|prune) ;;
  *) die "Acción desconocida: '$ACCION'. Usa: tag-previous | prune" ;;
esac

[ "$#" -gt 0 ] || die "Falta la lista de repositorios."

case "$KEEP_VERSIONS" in
  ''|*[!0-9]*) die "KEEP_VERSIONS debe ser un entero (recibido: '$KEEP_VERSIONS')." ;;
esac
[ "$KEEP_VERSIONS" -ge 1 ] || die "KEEP_VERSIONS debe ser al menos 1."

case "$DRY_RUN" in
  yes|1) DRY_RUN=yes ;;
  *)     DRY_RUN=no ;;
esac

command -v docker >/dev/null || die "docker no está instalado."

# ── Referencias en uso por contenedores ──────────────────────────────────────
# Lo que un contenedor se puso a ejecutar. Es el dato que manda: si un
# contenedor corre `repo:latest`, `repo:latest` tiene que existir sí o sí.
refs_de_contenedores() {
  docker ps -aq 2>/dev/null \
    | xargs -r docker inspect -f '{{.Config.Image}}' 2>/dev/null \
    | grep -v '^$' \
    | sort -u
}

# ── IDs de imagen realmente en marcha ────────────────────────────────────────
# Se separa de las referencias a propósito: en Docker 29 con containerd, una
# etiqueta puede apuntar a un ID distinto del que tiene el contenedor.
ids_de_contenedores() {
  docker ps -aq 2>/dev/null \
    | xargs -r docker inspect -f '{{.Image}}' 2>/dev/null \
    | grep '^sha256:' \
    | sort -u
}

# ── Protected refs e IDs ─────────────────────────────────────────────────────
montar_protegidos() {
  REFS_PROTEGIDAS=()
  IDS_PROTEGIDOS=()

  local ref id
  while read -r ref; do
    [ -n "$ref" ] || continue
    REFS_PROTEGIDAS+=("$ref")
    # Se resuelve la referencia a ID para proteger también esa imagen, aunque
    # su etiqueta se haya movido después.
    id="$(docker image inspect -f '{{.Id}}' "$ref" 2>/dev/null || true)"
    [ -n "$id" ] && IDS_PROTEGIDOS+=("$id")
  done < <(refs_de_contenedores)

  while read -r id; do
    [ -n "$id" ] && IDS_PROTEGIDOS+=("$id")
  done < <(ids_de_contenedores)

  # Los repos que se nos pasan también tienen una versión anterior que no
  # debe tocarse nunca.
  local repo
  for repo in "$@"; do
    REFS_PROTEGIDAS+=("$repo:previous")
    id="$(docker image inspect -f '{{.Id}}' "$repo:previous" 2>/dev/null || true)"
    [ -n "$id" ] && IDS_PROTEGIDOS+=("$id")
  done

  # Sin duplicados: los cruces entre refs e IDs son esperables.
  if [ "${#REFS_PROTEGIDAS[@]}" -gt 0 ]; then
    mapfile -t REFS_PROTEGIDAS < <(printf '%s\n' "${REFS_PROTEGIDAS[@]}" | sort -u)
  fi
  if [ "${#IDS_PROTEGIDOS[@]}" -gt 0 ]; then
    mapfile -t IDS_PROTEGIDOS < <(printf '%s\n' "${IDS_PROTEGIDOS[@]}" | sort -u)
  fi
}

es_ref_protegida() {
  local needle="$1" r
  for r in ${REFS_PROTEGIDAS[@]+"${REFS_PROTEGIDAS[@]}"}; do
    [ "$r" = "$needle" ] && return 0
  done
  return 1
}

es_id_protegido() {
  local needle="$1" i
  for i in ${IDS_PROTEGIDOS[@]+"${IDS_PROTEGIDOS[@]}"}; do
    [ "$i" = "$needle" ] && return 0
  done
  return 1
}

# ── Acción 1: etiquetar la versión actual como :previous ─────────────────────
if [ "$ACCION" = "tag-previous" ]; then
  log "Conservando la versión actual como :previous"

  for repo in "$@"; do
    servicio="${repo##*/}"          # hq-frontend:latest -> hq-frontend:latest
    servicio="${servicio%%:*}"       # hq-frontend:latest -> hq-frontend
    contenedor="hq-${servicio#hq-}"  # hq-frontend        -> hq-frontend

    imagen="$(docker inspect -f '{{.Image}}' "$contenedor" 2>/dev/null || true)"
    if [ -z "$imagen" ]; then
      info "$(printf '%-44s no está en marcha: no hay versión anterior que guardar' "$repo")"
      continue
    fi

    actual="$(docker image inspect -f '{{.Id}}' "$imagen" 2>/dev/null || true)"
    previa="$(docker image inspect -f '{{.Id}}' "$repo:previous" 2>/dev/null || true)"
    if [ -n "$previa" ] && [ "$actual" = "$previa" ]; then
      info "$(printf '%-44s ya es la :previous' "$repo")"
      continue
    fi

    if docker tag "$imagen" "$repo:previous" 2>/dev/null; then
      info "$(printf '%-44s :previous = %s' "$repo" "${actual:7:12}")"
    else
      warn "No se pudo etiquetar $repo:previous (se deja como está)."
    fi
  done
  exit 0
fi

# ── Acción 2: podar ───────────────────────────────────────────────────────────
montar_protegidos "$@"

log "Conservando las $KEEP_VERSIONS versiones por servicio"
[ "$DRY_RUN" = "yes" ] && warn "SIMULACIÓN: se muestra lo que se borraría, no se borra nada."
info "protegidas por estar en uso: ${#REFS_PROTEGIDAS[@]} referencia(s), ${#IDS_PROTEGIDOS[@]} imagen(es)"

borradas=0
conservadas=0
omitidas=0

for repo in "$@"; do
  # Una fila por etiqueta: "CreatedAt|tag|ID", de la más reciente a la más
  # antigua. `sort -r` funciona porque CreatedAt es "AAAA-MM-DD HH:MM:SS +0000".
  filas="$(docker image ls "$repo" --format '{{.CreatedAt}}|{{.Tag}}|{{.ID}}' 2>/dev/null \
            | sort -r || true)"
  [ -n "$filas" ] || continue

  total="$(printf '%s\n' "$filas" | grep -c . || true)"

  printf '\n  \033[1m%s\033[0m — %d etiqueta(s)\n' "$repo" "$total"

  # Cada imagen solo se cuenta una vez (puede tener varias etiquetas). Se queda
  # con la etiqueta más reciente, que es la que se decide borrar.
  mapa="$(printf '%s\n' "$filas" | awk -F'|' '{v[$3]=$2} END {for (i in v) print i"|"v[i]}')"

  # Recorrido en orden de fecha, guardando el orden original.
  ordenadas="$(docker image ls "$repo" --format '{{.CreatedAt}}|{{.Tag}}|{{.ID}}' 2>/dev/null \
               | sort -r | awk -F'|' '!visto[$3]++ {print $3}' || true)"

  presupuesto="$KEEP_VERSIONS"
  while read -r id; do
    [ -n "$id" ] || continue
    etiqueta="$(printf '%s\n' "$mapa" | awk -F'|' -v i="$id" '$1==i {print $2; exit}')"
    [ -n "$etiqueta" ] || etiqueta="<sin etiqueta>"

    # 1) Protegida por nombre: es la referencia de un contenedor en marcha o
    #    una :previous. No se toca aunque la fecha sea antigua.
    if es_ref_protegida "$repo:$etiqueta"; then
      info "$(printf 'protegida  %-18s %s  (en uso por un contenedor)' "$etiqueta" "${id:7:12}")"
      conservadas=$((conservadas + 1))
      continue
    fi

    # 2) Protegida por ID: la imagen la tiene en marcha algún contenedor aunque
    #    su etiqueta se haya movido.
    if es_id_protegido "$id"; then
      info "$(printf 'protegida  %-18s %s  (imagen en marcha)' "$etiqueta" "${id:7:12}")"
      conservadas=$((conservadas + 1))
      continue
    fi

    # 3) Le toca por ser de las más recientes y quedar sitio en el presupuesto.
    if [ "$presupuesto" -gt 0 ]; then
      info "$(printf 'conservada %-18s %s  (de las más recientes)' "$etiqueta" "${id:7:12}")"
      presupuesto=$((presupuesto - 1))
      conservadas=$((conservadas + 1))
      continue
    fi

    # 4) Sobra.
    if [ "$DRY_RUN" = "yes" ]; then
      info "$(printf 'BORRARÍA   %-18s %s' "$etiqueta" "${id:7:12}")"
      borradas=$((borradas + 1))
      continue
    fi

    # Sin -f a propósito: si Docker cree que la imagen hace falta, se niega.
    if docker image rm "$id" >/dev/null 2>&1; then
      info "$(printf 'borrada    %-18s %s' "$etiqueta" "${id:7:12}")"
      borradas=$((borradas + 1))
    else
      omitidas=$((omitidas + 1))
      warn "No se pudo borrar $etiqueta (${id:7:12}); Docker dice que sigue en uso."
    fi
  done <<< "$ordenadas"
done

if [ "$DRY_RUN" = "yes" ]; then
  log "Resumen (simulación): $borradas se borrarían, $conservadas conservadas, $omitidas omitidas"
  info "Quita DRY_RUN para aplicarlo."
else
  log "Resumen: $borradas borrada(s), $conservadas conservada(s), $omitidas omitida(s)"
fi

# Aviso temprano: sin espacio no hay base de datos, y sin base de datos no hay
# despliegue posible. Mejor enterarse antes de que se caiga.
usado="$(df -h --output=pcent / 2>/dev/null | tail -1 | tr -dc '0-9')"
libre="$(df -BG --output=avail / 2>/dev/null | tail -1 | tr -dc '0-9')"
printf '\n  disco: %s%% usado, %s GB libres\n' "${usado:-?}" "${libre:-?}"
if [ -n "${usado:-}" ] && [ "$usado" -ge 90 ]; then
  warn "El disco está al ${usado}%. Pide ampliar el volumen EBS (20 GB) antes de que se llene."
fi

exit 0
