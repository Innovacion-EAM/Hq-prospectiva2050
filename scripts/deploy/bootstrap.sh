#!/usr/bin/env bash
# ── Arranque de la instancia (se ejecuta UNA VEZ) ─────────────────────────────
# Deja la instancia Ubuntu lista para servir el sitio: instala Docker, crea swap,
# clona el repo, genera los secretos y levanta los cinco contenedores con las
# imágenes ya construidas por GitHub Actions.
#
# Es idempotente: volver a ejecutarlo NO borra datos ni sobrescribe secretos
# existentes (los .env se crean solo si faltan).
#
# Uso:
#     git clone https://github.com/Innovacion-EAM/Hq-prospectiva2050.git
#     cd Hq-prospectiva2050
#     sudo HQ_SITE_HOST=tudominio.com ./scripts/deploy/bootstrap.sh
#
# Variables de entorno:
#   HQ_SITE_HOST     dominio público. Defínelo; si no, el sitio quedará con las
#                    reglas de Traefik apuntando a "localhost" y devolverá 404.
#   GHCR_DEPLOY_USER usuario de GitHub para leer el registro (por defecto, el
#                    nombre de usuario con el que inicias sesión).
#   GHCR_DEPLOY_TOKEN PAT de GitHub con permiso de lectura sobre paquetes.
#   APP_DIR          raíz de la instalación (por defecto /opt/hq-prospectiva2050)
#   INSTALL_DOCKER   yes|no (por defecto yes)
#   INSTALL_SWAP     yes|no (por defecto yes)
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/hq-prospectiva2050}"
INSTALL_DOCKER="${INSTALL_DOCKER:-yes}"
INSTALL_SWAP="${INSTALL_SWAP:-yes}"
REPO_URL="${REPO_URL:-https://github.com/Innovacion-EAM/Hq-prospectiva2050.git}"
BRANCH="${BRANCH:-main}"
COMPOSE_DIR="$APP_DIR/infra/compose"

log()  { printf '\n\033[1;34m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[!]\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31m[x]\033[0m %s\n' "$*" >&2; exit 1; }

# Usuario "humano" que debe acabar en el grupo docker (si se ejecuta con sudo,
# $USER puede seguir siendo root mientras el real está en SUDO_USER).
LOCAL_USER="${SUDO_USER:-$(id -un)}"

# Git, curl y las utilidades de este script son prerrequisitos; instalarlos
# requiere red y sudo, así que se comprueban al principio para fallar claro.
need=(git curl sed grep awk openssl)
for c in "${need[@]}"; do
  command -v "$c" >/dev/null 2>&1 || die "Falta '$c'. Instálalo con: sudo apt-get install -y git curl"
done

# ── 1. Docker ─────────────────────────────────────────────────────────────────
if ! command -v docker >/dev/null 2>&1; then
  [ "$INSTALL_DOCKER" = "yes" ] || die "Docker no está instalado y INSTALL_DOCKER=no"
  log "Instalando Docker desde el repositorio oficial"
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
  sudo apt-get update
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io \
    docker-buildx-plugin docker-compose-plugin git
  sudo systemctl enable --now docker
else
  log "Docker ya instalado: $(docker --version)"
fi
docker compose version >/dev/null 2>&1 || die "Falta el plugin 'docker compose' (docker-compose-plugin)"

# El usuario que despliega necesita poder hablar con el daemon sin sudo.
if ! docker info >/dev/null 2>&1; then
  log "Añadiendo $LOCAL_USER al grupo docker"
  sudo usermod -aG docker "$LOCAL_USER"
  warn "El grupo docker sólo se aplica en la próxima sesión: 'newgrp docker' o vuelve a entrar."
fi

# ── 2. Swap ───────────────────────────────────────────────────────────────────
# Una t3.micro tiene 1 GB de RAM para PostgreSQL, Traefik, dos nginx y node.
# Sin swap, un arranque en frío o una consulta pesada provoca el OOM killer y
# el sitio se cae sin más. Con 2 GB de swap el sistema degrada en vez de morir.
if [ "$INSTALL_SWAP" = "yes" ]; then
  if swapon --show=NAME --noheadings | grep -q .; then
    log "Swap ya configurada: $(swapon --show=SIZE --noheadings | tr '\n' ' ')"
  else
    log "Creando 2 GB de swap (protege la t3.micro de OOM)"
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile >/dev/null
    sudo swapon /swapfile
    grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
  fi
fi

# ── 3. Código ─────────────────────────────────────────────────────────────────
# La rama de producción es 'main'. Si el remoto no la tiene todavía, se cae a
# 'develop' en vez de morir: es preferible arrancar desde la rama de trabajo
# que no quedarse sin sitio por un nombre de rama.
resolve_branch() {
  if git ls-remote --exit-code --heads "$REPO_URL" "$BRANCH" >/dev/null 2>&1; then
    printf '%s' "$BRANCH"
  elif git ls-remote --exit-code --heads "$REPO_URL" develop >/dev/null 2>&1; then
    warn "La rama '$BRANCH' no existe en el remoto; se usará 'develop'."
    printf '%s' develop
  else
    die "No encuentro ninguna rama desplegable en $REPO_URL"
  fi
}

if [ -d "$APP_DIR/.git" ]; then
  log "El repo ya existe en $APP_DIR; se actualiza"
  cd "$APP_DIR"
  git fetch --quiet origin
  git checkout --quiet "$BRANCH" 2>/dev/null || git pull --ff-only --quiet
  git pull --ff-only --quiet || warn "No se pudo actualizar (árbol con cambios locales)."
else
  BRANCH="$(resolve_branch)"
  log "Clonando el repo ($BRANCH) en $APP_DIR"
  sudo mkdir -p "$APP_DIR"
  sudo chown "$LOCAL_USER:$LOCAL_USER" "$APP_DIR"
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

# ── 4. Archivos de entorno ────────────────────────────────────────────────────
# Se generan con secretos aleatorios SOLO si no existen: reejecutar el script
# nunca debe invalidar la sesión de nadie ni tumbar la base de datos.
secret() { openssl rand -hex 24; }

if [ ! -f "$COMPOSE_DIR/.env.prod" ]; then
  log "Generando infra/compose/.env.prod"
  [ -n "${HQ_SITE_HOST:-}" ] || die "Falta HQ_SITE_HOST. Uso: sudo HQ_SITE_HOST=tudominio.com ./scripts/deploy/bootstrap.sh"
  cat > "$COMPOSE_DIR/.env.prod" <<EOF
POSTGRES_USER=hq_app
POSTGRES_PASSWORD=$(secret)
POSTGRES_DB=hq_prospectiva2050
HQ_SITE_HOST=$HQ_SITE_HOST
EOF
  chmod 600 "$COMPOSE_DIR/.env.prod"
else
  log "infra/compose/.env.prod ya existe: se conserva"
fi

if [ ! -f "$APP_DIR/backend/.env.prod" ]; then
  log "Generando backend/.env.prod"
  # shellcheck disable=SC1091
  . "$COMPOSE_DIR/.env.prod"
  cat > "$APP_DIR/backend/.env.prod" <<EOF
PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_USER=$POSTGRES_USER
DB_PASSWORD=$POSTGRES_PASSWORD
DB_NAME=$POSTGRES_DB
CORS_ORIGINS=https://$HQ_SITE_HOST
DB_SYNCHRONIZE=false
UPLOAD_DIR=uploads
JWT_SECRET=$(secret)
EOF
  chmod 600 "$APP_DIR/backend/.env.prod"
else
  log "backend/.env.prod ya existe: se conserva"
fi

# ── 5. Credenciales del registro ──────────────────────────────────────────────
if [ -n "${GHCR_DEPLOY_TOKEN:-}" ]; then
  log "Autenticando en ghcr.io como ${GHCR_DEPLOY_USER:-$USER}"
  printf '%s' "$GHCR_DEPLOY_TOKEN" | docker login ghcr.io \
    --username "${GHCR_DEPLOY_USER:-$USER}" --password-stdin >/dev/null
else
  warn "No se pasó GHCR_DEPLOY_TOKEN: el pull de imágenes PRIVATE fallará."
  warn "Créalo en GitHub → Settings → Developer settings → Personal access tokens"
  warn "  -> marca 'read:packages', y ejecútalo en la sesión nueva con:"
  warn "  GHCR_DEPLOY_USER=tu_usuario GHCR_DEPLOY_TOKEN=ghp_xxx sudo -E ./scripts/deploy/bootstrap.sh"
fi

# ── 6. Levantar ───────────────────────────────────────────────────────────────
# A partir de aquí es exactamente lo que hará el despliegue automático.
# Releer .env.prod garantiza que HQ_SITE_HOST está definido también en las
# reejecuciones (donde el fichero ya existía y no se regeneró desde el entorno).
# shellcheck disable=SC1091
. "$COMPOSE_DIR/.env.prod"
HQ_SITE_HOST="${HQ_SITE_HOST:-localhost}"

log "Levantando el sitio"
APP_DIR="$APP_DIR" bash ./scripts/deploy/deploy.sh

# ── 7. Resumen ────────────────────────────────────────────────────────────────
cat <<EOF

════════════════════════════════════════════════════════════════════
  SITIO DESPLEGADO
════════════════════════════════════════════════════════════════════
  Sitio público  http://$HQ_SITE_HOST
  Panel /admin    http://$HQ_SITE_HOST/admin
  API             http://$HQ_SITE_HOST/api/site

  Usuario inicial del panel:  admin@prospectiva.com / Admin123*
  ⚠ Cámbialo en cuanto entres (Ajustes → Usuarios).

  Secrets en el servidor:
    $COMPOSE_DIR/.env.prod        (POSTGRES_PASSWORD, HQ_SITE_HOST)
    $APP_DIR/backend/.env.prod    (DB_PASSWORD, JWT_SECRET)
  No están en git. Haz copia de seguridad: 'make backup'.

  Siguiente paso recomendado: registrar el dominio y activar HTTPS.
════════════════════════════════════════════════════════════════════
EOF
