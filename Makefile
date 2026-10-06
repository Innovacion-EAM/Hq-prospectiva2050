# ════════════════════════════════════════════════════════════════════════════
#  HQ PROSPECTIVA 2050 — Makefile de comandos
# ════════════════════════════════════════════════════════════════════════════
#  Centraliza TODOS los comandos del monorepo (backend + frontend + backoffice
#  + repo + docker + producción) en un solo lugar, para no recordarlos.
#
#  USO:
#     make help                    → menú (también es el default con solo `make`)
#     make <comando>               → ejecuta ese comando
#     make <comando> SERVICE=X     → algunos comandos aceptan elegir el servicio
#                                    (backend | frontend | backoffice | repo | traefik | postgres)
#
#  ESTRUCTURA (secciones):
#     1. Utilidades / diagnóstico
#     2. Entorno dev  (npm LOCAL, sin docker: backend :3006, front :5173, backoffice :1234, repo :4173)
#     3. Calidad      (lint, tests, formato)
#     4. Docker       (entorno de contenedores LOCAL, traefik en http://localhost)
#     5. Base de datos
#     6. Contenedores (terminal dentro de un servicio)
#     7. Producción   (overlay docker-compose.prod.yml, credenciales reales)
#     8. Backups      (dumps de la db + restore)
#     9. Mantenimiento del server
#    10. Git
#
#  NOTAS:
#     · Los comandos docker usan `--project-directory infra/compose` para que
#       composse cargue .env / .env.prod desde infra/compose/ (no desde la raíz).
#     · Nombre de proyecto fijo (name: hq-prospectiva2050) → contenedores hq-*.
#     · Los comandos destructivos (down-v, db-reset) preguntan confirmación.
# ════════════════════════════════════════════════════════════════════════════

SHELL := /bin/bash

# ── Rutas base del monorepo ─────────────────────────────────────────────────
COMPOSE_DIR := infra/compose

# ── Comandos compose ────────────────────────────────────────────────────────
# DOCKER = compose del entorno local (aquí se leen infra/compose/.env)
# PROD   = compose local + overlay prod (aquí se lee infra/compose/.env.prod)
DOCKER := docker compose -f $(COMPOSE_DIR)/docker-compose.yml \
          --project-directory $(COMPOSE_DIR)
PROD   := $(DOCKER) -f $(COMPOSE_DIR)/docker-compose.prod.yml \
          --env-file $(COMPOSE_DIR)/.env.prod

# Servicio que usan targets paramétricos (logs, shell, db-*). Vacío = "todos".
SERVICE ?=

# Archivo para restore (ej: make restore FILE=backups/2026-09-23-120000-back.pg)
FILE ?=

# Cuántos backups conserva backup-clean (por defecto 14)
N ?= 14

# `make` a secas muestra el menú
.DEFAULT_GOAL := help

# ────────────────────────────────────────────────────────────────────────────
# 1. UTILIDADES / DIAGNÓSTICO
# ────────────────────────────────────────────────────────────────────────────

## help: Muestra este menú con todos los comandos disponibles
#  Los targets se documentan con una línea `## nombre: descripción` justo encima.
help:
	@sed -nE 's/^## ([a-zA-Z0-9_/.:-]+): (.*)$$/\1|\2/p' $(MAKEFILE_LIST) | \
		awk -F'|' '{printf "  \033[36m%-24s\033[0m %s\n", $$1, $$2}' | sort

## doctor: Diagnóstico del entorno (docker, puertos dev, contenedores y .env)
#  Útil cuando "algo no jala": chequea de una sola vez lo que normalmente harías a mano.
doctor:
	@echo "── 1. Docker ──"
	@if docker info >/dev/null 2>&1; then echo "     [OK] docker disponible"; else echo "     [!] docker NO disponible (¿daemon apagado?)"; fi
	@echo "── 2. Puertos dev (3006 backend · 5173 frontend · 1234 backoffice · 4173 repo · 8080 traefik) ──"
	@lsof -i tcp:3006 -i tcp:5173 -i tcp:1234 -i tcp:4173 -i tcp:8080 2>/dev/null | awk 'NR==1 || /LISTEN/' || echo "     (nada escuchando)"
	@echo "── 3. Contenedores hq-* ──"
	@docker ps --filter "name=hq-" --format "     {{.Names}}: {{.Status}}" 2>/dev/null || echo "     (docker no disponible)"
	@echo "── 4. Archivos de entorno ──"
	@echo "     (en prod solo se necesitan los 2 marcados PROD; frontend/backoffice"
	@echo "      llevan la URL de la API como build-arg, no como archivo)"
	@for f in backend/.env.docker backend/.env.dev infra/compose/.env infra/compose/.env.prod backend/.env.prod; do \
		if [ -f "$$f" ]; then echo "     [OK]   $$f"; else echo "     [FALTA] $$f"; fi; \
	done

## dev-status: Muestra quién está escuchando en los puertos dev
dev-status:
	@lsof -i tcp:3006 -i tcp:5173 -i tcp:1234 -i tcp:4173 2>/dev/null | awk 'NR==1 || /LISTEN/' || echo "Nada escuchando en puertos dev."

# ────────────────────────────────────────────────────────────────────────────
# 2. ENTORNO DEV (npm local, SIN docker)
# ────────────────────────────────────────────────────────────────────────────

## install: Instala las dependencias de los 4 servicios (paralelo)
install:
	$(MAKE) -j4 install-backend install-frontend install-backoffice install-repo

## install-backend: Instala dependencias del backend
install-backend:
	@cd backend && npm install

## install-frontend: Instala dependencias del frontend
install-frontend:
	@cd frontend && npm install

## install-backoffice: Instala dependencias del backoffice
install-backoffice:
	@cd backoffice && npm install

## install-repo: Instala dependencias del repositorio (repo/)
install-repo:
	@cd repo && npm ci

## dev: Levanta los 4 servicios dev en paralelo (Ctrl+C detiene todo)
#  Puedes levantarlos por separado con dev-backend / dev-frontend / dev-backoffice / dev-repo.
#  Si algo se queda colgado, usa `make dev-stop`.
dev:
	@echo "Levantando backend (:3006), frontend (:5173), backoffice (:1234) y repo (:4173)... (Ctrl+C detiene todo)"
	@$(MAKE) dev-backend & \
	$(MAKE) dev-frontend & \
	$(MAKE) dev-backoffice & \
	$(MAKE) dev-repo & \
	wait

## dev-backend: Levanta el backend NestJS en :3006 con hot-reload (--watch)
dev-backend:
	@cd backend && npm run start:dev

## dev-frontend: Levanta el frontend Vite/React en :5173 (modo dev)
dev-frontend:
	@cd frontend && npm run dev

## dev-backoffice: Levanta el backoffice Vite/React en :1234 (modo dev)
dev-backoffice:
	@cd backoffice && npm run dev

## dev-repo: Levanta el repositorio Vite/React en :4173 (modo dev)
dev-repo:
	@cd repo && npm run dev

## dev-stop: Mata los procesos dev que estén en los puertos 3006/5173/1234/4173
dev-stop:
	@pids=$$(lsof -ti tcp:3006 -ti tcp:5173 -ti tcp:1234 -ti tcp:4173); \
	if [ -n "$$pids" ]; then \
		echo "Matando procesos dev: $$pids"; kill $$pids; \
	else \
		echo "No hay procesos corriendo en los puertos dev."; \
	fi

# ────────────────────────────────────────────────────────────────────────────
# 3. CALIDAD (lint, tests, formato)
# ────────────────────────────────────────────────────────────────────────────

## lint: Ejecuta el lint (oxlint) de los 4 servicios
lint: lint-backend lint-frontend lint-backoffice lint-repo

## lint-backend: Lint del backend
lint-backend:
	@cd backend && npm run lint

## lint-frontend: Lint del frontend
lint-frontend:
	@cd frontend && npm run lint

## lint-backoffice: Lint del backoffice
lint-backoffice:
	@cd backoffice && npm run lint

## lint-repo: Lint del repositorio
lint-repo:
	@cd repo && npm run lint

## test: Ejecuta los tests (jest) del backend
test:
	@cd backend && npm test

## format: Formatea el código del backend con prettier
format:
	@cd backend && npm run format

# ────────────────────────────────────────────────────────────────────────────
# 4. DOCKER (entorno local de contenedores, traefik en http://localhost)
# ────────────────────────────────────────────────────────────────────────────

## up: Levanta el entorno docker local (6 servicios) en segundo plano
#  Servicios: postgres (hq-db), backend, frontend, backoffice, repo y traefik.
#  Rutas: http://localhost  → frontend · http://localhost/admin → backoffice
#         http://localhost/repo → repositorio · http://localhost/api → backend
up:
	@$(DOCKER) up -d --build
	@echo "Levantando... revisa el estado con: make health"

## down: Detiene los contenedores (SIN borrar datos del volumen pgdata)
down:
	@$(DOCKER) down

## down-v: Detiene y BORRA el volumen de la base de datos (¡pide confirmación!)
#  ⚠ Destructivo: pierdes todos los datos de la db. Solo para reiniciar limpio.
down-v:
	@read -p "[!] Esto borrará la base de datos (datos perdidos). Escribe 'si' para continuar: " ans; \
		[ "$$ans" = "si" ] || { echo "Cancelado."; exit 1; }; \
		$(DOCKER) down -v

## ps: Estado y salud de los contenedores (tabla con puertos)
ps:
	@$(DOCKER) ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

## health: Salud compacta de los contenedores hq-*
health:
	@docker ps --filter "name=hq-" --format "{{.Names}}: {{.Status}}"

## logs: Logs en vivo. Uso: make logs SERVICE=backend (vacío = todos, --tail 100)
logs:
	@$(DOCKER) logs -f --tail=100 $(SERVICE)

## build: Construye las imágenes (modo docker: VITE_API_URL=http://localhost)
build:
	@$(DOCKER) build

## rebuild: Reconstruye imágenes y recrea contenedores (aplica .env.docker/código)
#  Úsalo cuando cambiaste código o variables de entorno docker y quieres actualizar.
rebuild:
	@$(DOCKER) up -d --build --force-recreate

## restart: Reinicia todos los contenedores (sin reconstruir)
restart:
	@$(DOCKER) restart

## config: Valida el compose base y muestra la config resuelta
config:
	@$(DOCKER) config

# ────────────────────────────────────────────────────────────────────────────
# 5. BASE DE DATOS
# ────────────────────────────────────────────────────────────────────────────

## db-shell: Entra a psql interactivo dentro de la db (usa credenciales del contenedor)
db-shell:
	@$(DOCKER) exec postgres sh -c 'exec psql -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"'

## db-logs: Logs del contenedor postgres en vivo
db-logs:
	@$(DOCKER) logs -f --tail=100 postgres

## db-reset: Destruye y recrea la base de datos desde cero (¡pide confirmación!)
#  ⚠ Destructivo: borra el volumen pgdata y levanta de nuevo la db en limpio.
db-reset:
	@read -p "[!] Esto BORRARÁ y recreará la base de datos (datos perdidos). Escribe 'si' para continuar: " ans; \
		[ "$$ans" = "si" ] || { echo "Cancelado."; exit 1; }; \
		$(DOCKER) down -v && $(DOCKER) up -d postgres --wait && echo "Base de datos recreada."

## db-schema: Aplica scripts/schema-db.sql a la db
#  ⚠ Obsoleto para producción: usa `make prod-db-init`, que genera el esquema
#    desde las entidades de TypeORM (backend/src/entities) y no puede desincronizarse.
#    scripts/schema-db.sql sigue como alternativa manual para entornos sin Node.
db-schema:
	@if [ ! -s scripts/schema-db.sql ]; then echo "[!] scripts/schema-db.sql está vacío. Usa 'make prod-db-init' en su lugar."; exit 1; fi
	@$(DOCKER) exec -T postgres sh -c 'exec psql -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"' < scripts/schema-db.sql && echo "Esquema aplicado."

## db-seed: Aplica scripts/seed.sql a la db (semilla inicial)
#  ⚠ Obsoleto para producción: `make prod-db-init` ya siembra usando el mismo
#    SeederService que usa la app, así que el contenido no puede divergir.
db-seed:
	@if [ ! -s scripts/seed.sql ]; then echo "[!] scripts/seed.sql está vacío. Usa 'make prod-db-init' en su lugar."; exit 1; fi
	@$(DOCKER) exec -T postgres sh -c 'exec psql -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"' < scripts/seed.sql && echo "Semilla aplicada."

# ────────────────────────────────────────────────────────────────────────────
# 6. CONTENEDORES (terminal dentro de un servicio)
# ────────────────────────────────────────────────────────────────────────────

## shell: Terminal dentro de un contenedor. Uso: make shell SERVICE=backend (default backend)
shell:
	@$(DOCKER) exec -it $(or $(SERVICE),backend) sh

# ────────────────────────────────────────────────────────────────────────────
# 7. PRODUCCIÓN (overlay docker-compose.prod.yml · credenciales y URL reales)
#    Requiere los .env.prod. Si fallan = te lo dice y te indica `make env-prod`.
#
#    FLUJO NORMAL: GitHub Actions construye y publica las imágenes en GHCR, y el
#    servidor solo hace pull + db-init + up (ver docs/despliegue-aws.md).
#    Nada de esto compila código, que es lo que tumba una instancia de 1 GB.
#    prod-build existe solo como plan B para reconstruir en el propio servidor.
# ────────────────────────────────────────────────────────────────────────────

# Guardia: los targets prod fallan con mensaje claro si no existen los .env.prod
infra/compose/.env.prod:
	@echo "[!] Falta $@. Primero genera los .env.prod así:"
	@echo "      make env-prod"
	@echo "  Luego EDITALOS con el password de la db y el dominio real antes de make prod-up."
	@exit 1

## env-prod: Genera los 2 archivos .env.prod que SÍ hacen falta
#  Crea: infra/compose/.env.prod (password de postgres + dominio) y
#        backend/.env.prod (credenciales de db + JWT_SECRET)
#  Los .env.prod de frontend/backoffice ya NO hacen falta: la URL de la API se
#  incrusta en la imagen como build-arg (VITE_API_URL), no como archivo.
#  En el servidor los genera automáticamente scripts/deploy/bootstrap.sh.
env-prod:
	@cp $(COMPOSE_DIR)/.env.prod.example $(COMPOSE_DIR)/.env.prod
	@cp backend/.env.prod.example backend/.env.prod
	@echo "Creados los .env.prod. EDÍTALOS antes de prod-up:"
	@echo "  · infra/compose/.env.prod → POSTGRES_PASSWORD y HQ_SITE_HOST (dominio real)"
	@echo "  · backend/.env.prod       → DB_PASSWORD (el MISMO) y un JWT_SECRET nuevo"
	@echo "  Para generar secretos: openssl rand -hex 24"

## prod-config: Valida el overlay de producción (config resuelta sin levantar)
prod-config: infra/compose/.env.prod
	@$(PROD) config

## prod-build: Construye las imágenes EN ESTA MÁQUINA (solo uso local / emergencia)
#  ⚠ En un servidor pequeño esto es lo que tumba la instancia (1 vCPU / 1 GB).
#    El flujo normal es que GitHub Actions construya y este comando solo descargue:
#    `make prod-deploy`. Déjalo solo como plan B si el registro no está disponible.
prod-build: infra/compose/.env.prod
	@$(PROD) build

## prod-pull: Descarga las imágenes publicadas en GHCR (sin compilar nada)
#  Es el paso que hace el servidor en cada despliegue.
prod-pull: infra/compose/.env.prod
	@$(PROD) pull

## prod-login: Guarda credenciales de GHCR en el servidor. Uso: make prod-login TOKEN=ghp_xxx
#  Necesario si el registro es privado y el bootstrap se hizo sin token.
prod-login:
	@[ -n "$(TOKEN)" ] || { echo "Uso: make prod-login TOKEN=ghp_xxx"; exit 1; }
	@printf '%s' "$(TOKEN)" | docker login ghcr.io -u "$$USER" --password-stdin
	@echo "Login en ghcr.io guardado."

## prod-db-init: Crea el esquema y siembra la db en producción (idempotente)
#  ⚠ Imprescindible la PRIMERA VEZ: en prod DB_SYNCHRONIZE=false, así que sin esto
#    el backend arranca contra una base de datos sin tablas y se cae.
#  · Crea y arranca primero PostgreSQL y llama a `node dist/cli/db-init.js`,
#    que sincroniza el esquema desde las entidades de TypeORM y luego siembra
#    las tablas vacías. Es idempotente y usa el MISMO SeederService que la app.
#  · `make db-schema` / `make db-seed` (SQL manual) quedan como alternativa para
#    entornos sin Node; ver la nota de "obsoleto" en sus comentarios.
#  Es lo que ejecuta scripts/deploy/deploy.sh en cada despliegue.
prod-db-init: infra/compose/.env.prod
	@$(PROD) up -d postgres
	@$(PROD) run --rm --no-deps -T backend node dist/cli/db-init.js
	@echo "Esquema y semilla aplicados."

## prod-rollback: Vuelve a una versión anterior. Uso: make prod-rollback TAG=v1.0.0
#  Fija los cuatro tags de imagen y rearranca.
#  TAG=previous (el valor por defecto de la etiqueta) vuelve a la versión
#  anterior: deploy.sh etiqueta la imagen en marcha como :previous ANTES de
#  descargar la nueva. Sin ese paso no habría a dónde volver.
#  La poda conserva KEEP_IMAGE_VERSIONS versiones por servicio (2 por defecto).
prod-rollback: infra/compose/.env.prod
	@[ -n "$(TAG)" ] || { echo "Uso: make prod-rollback TAG=previous (o un tag como v1.0.0)"; exit 1; }
	@echo "== Reverting a $(TAG) =="
	@HQ_BACKEND_IMAGE=ghcr.io/innovacion-eam/hq-backend:$(TAG) \
	 HQ_FRONTEND_IMAGE=ghcr.io/innovacion-eam/hq-frontend:$(TAG) \
	 HQ_BACKOFFICE_IMAGE=ghcr.io/innovacion-eam/hq-backoffice:$(TAG) \
	 HQ_REPO_IMAGE=ghcr.io/innovacion-eam/hq-repo:$(TAG) \
	 $(PROD) up -d
	@echo "Verifica con: make prod-smoke"

## prod-up: Levanta el entorno de producción (usa .env.prod)
prod-up: infra/compose/.env.prod
	@$(PROD) up -d

## prod-deploy: Descarga y levanta la última versión publicada (pull + db-init + up)
#  No compila: eso ocurre en GitHub Actions. Es exactamente lo que ejecuta el
#  despliegue automático por SSH (scripts/deploy/deploy.sh).
prod-deploy: prod-pull prod-db-init prod-up
	@echo "Desplegado. Verifica con: make prod-smoke"

## prod-down: Detiene producción (SIN borrar datos)
prod-down: infra/compose/.env.prod
	@$(PROD) down

## prod-down-v: Detiene y BORRA el volumen de la db en producción (¡pide confirmación!)
prod-down-v: infra/compose/.env.prod
	@read -p "[!] Esto borrará la base de datos de PRODUCCIÓN (datos perdidos). Escribe 'si' para continuar: " ans; \
		[ "$$ans" = "si" ] || { echo "Cancelado."; exit 1; }; \
		$(PROD) down -v

## prod-ps: Estado de los contenedores de producción
prod-ps: infra/compose/.env.prod
	@$(PROD) ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

## prod-logs: Logs de producción. Uso: make prod-logs SERVICE=backend (vacío = todos)
prod-logs: infra/compose/.env.prod
	@$(PROD) logs -f --tail=100 $(SERVICE)

## prod-restart: Reinicia los contenedores de producción
prod-restart: infra/compose/.env.prod
	@$(PROD) restart

## prod-shell: Terminal dentro de un contenedor de producción. Uso: make prod-shell SERVICE=backend (default backend)
prod-shell: infra/compose/.env.prod
	@$(PROD) exec -it $(or $(SERVICE),backend) sh

## prod-smoke: Smoke test de producción (verifica que la app responde de verdad)
#  Comprueba: contenedores healthy · frontend (/) · backoffice (/admin) · repo
#  (/repo) · backend (/api/health/db) · comportamiento de https (depende de la
#  decisión SSL pendiente).
#  OJO: se envía el Host de HQ_SITE_HOST porque los routers de Traefik filtran por
#  host. Sin esa cabecera, con el dominio real configurado todo respondería 404.
prod-smoke: infra/compose/.env.prod
	@echo "── Smoke test de producción ──"
	@HQ_HOST=$$(grep -E '^HQ_SITE_HOST=' $(COMPOSE_DIR)/.env.prod | cut -d= -f2- | tr -d '"'); \
	HQ_HOST="$${HQ_HOST:-localhost}"; \
	echo "  Host probado: $$HQ_HOST"; \
	echo "[1/6] Contenedores:"; \
	$(PROD) ps --format "  {{.Name}}: {{.Status}}"; \
	echo "[2/6] Frontend, backoffice y repo (vía traefik):"; \
	curl -sk -o /dev/null -w "  /        → HTTP %{http_code}\n" -H "Host: $$HQ_HOST" http://localhost/; \
	curl -sk -o /dev/null -w "  /admin   → HTTP %{http_code}\n" -H "Host: $$HQ_HOST" http://localhost/admin; \
	curl -sk -o /dev/null -w "  /repo    → HTTP %{http_code}\n" -H "Host: $$HQ_HOST" http://localhost/repo; \
	echo "[3/6] Assets reales:"; \
	echo "  (pedir /admin o /repo solo devuelve el HTML: el panel puede salir en blanco aunque dé 200)"; \
	for svc in frontend backoffice repo; do \
	  asset=$$($(PROD) exec -T $$svc sh -c 'ls /usr/share/nginx/html/assets/*.js 2>/dev/null | head -1' 2>/dev/null | tr -d '\r'); \
	  if [ -z "$$asset" ]; then echo "  [!] No se encontró ningún asset en $$svc"; continue; fi; \
	  base=$$(basename "$$asset"); \
	  prefix=""; \
	  if [ "$$svc" = "backoffice" ]; then prefix="/admin"; fi; \
	  if [ "$$svc" = "repo" ]; then prefix="/repo"; fi; \
	  code=$$(curl -sk -o /dev/null -w '%{http_code}' -H "Host: $$HQ_HOST" "http://localhost$$prefix$$asset"); \
	  if [ "$$code" = "200" ]; then \
	    echo "  OK       $$svc $$prefix$$base → HTTP 200"; \
	  else \
	    echo "  FALLO    $$svc $$prefix$$base → HTTP $$code"; \
	    echo "           [!] $$svc NO sirve sus assets: la página saldrá en blanco."; \
	  fi; \
	done; \
	echo "[4/6] Backend health (db):"; \
	curl -sk -H "Host: $$HQ_HOST" http://localhost/api/health/db | head -c 200; echo; \
	echo "[5/6] API del repositorio (pública):"; \
	curl -sk -H "Host: $$HQ_HOST" http://localhost/api/repositorio/estadisticas | head -c 120; echo; \
	echo "[6/6] HTTPS (neutro si aún no hay certificado):"; \
	if [ -s $(COMPOSE_DIR)/../traefik/certs/acme.json ] 2>/dev/null; then \
	  curl -sk -o /dev/null -w "  https://$$HQ_HOST → HTTP %{http_code}\n" -H "Host: $$HQ_HOST" https://localhost/ || echo "  (hay acme.json pero https no responde)"; \
	else \
	  echo "  (sin certificado todavía: esperado hasta que se active el TLS)"; \
	fi

## deploy: Despliegue MANUAL desde tu máquina (git pull + prod-deploy)
#  En el flujo normal esto no lo usas: haces `git push origin main` y GitHub
#  Actions construye, publica en GHCR y despliega en la instancia por SSH.
#  Este comando sirve para el despliegue manual o para probar el overlay en local.
#  OJO: `prod-deploy` descarga imágenes linux/amd64 construidas en CI, así que no
#  es lo que quieres si estás en una Mac con Apple Silicon.
deploy:
	@echo "── Desplegando la última versión (manual) ──"
	@git pull
	@$(MAKE) prod-deploy
	@echo "Desplegado. Verifica con: make prod-smoke"

# ────────────────────────────────────────────────────────────────────────────
# 8. BACKUPS DE LA BASE DE DATOS
#    pg_dump en streaming dentro del contenedor hq-db → backups/ con timestamp.
#    Funcionan con el stack docker o prod corriendo (misma db del proyecto).
# ────────────────────────────────────────────────────────────────────────────

## backup: Crea un dump (formato custom) de la db en backups/ con timestamp
backup:
	@mkdir -p backups
	@$(DOCKER) exec -T postgres sh -c 'exec pg_dump -U "$$POSTGRES_USER" -d "$$POSTGRES_DB" -F c' > backups/$$(date +%Y%m%d-%H%M%S)-back.pg
	@echo "Backup creado:"; ls -1t backups/*.pg | head -1

## backup-list: Lista los backups existentes (más reciente primero)
backup-list:
	@ls -1t backups/*.pg 2>/dev/null || echo "No hay backups todavía (usa: make backup)."

## backup-clean: Borra backups viejos dejando los N más recientes. Uso: make backup-clean N=14
backup-clean:
	@ls -1t backups/*.pg 2>/dev/null | tail -n +$$(($(N)+1)) | sed 's|^|backups/|' | xargs -r rm -v || echo "Nada que limpiar."

## restore: Restaura un dump a la db. Uso: make restore FILE=backups/XXX-back.pg (¡pide confirmación!)
#  ⚠ SOBRESCRIBE los datos actuales de la db (con --clean: elimina lo que exista).
restore:
	@[ -n "$(FILE)" ] || { echo "Uso: make restore FILE=backups/<archivo>.pg"; exit 1; }
	@[ -f "$(FILE)" ] || { echo "[!] No existe: $(FILE) (revisa make backup-list)"; exit 1; }
	@read -p "[!] SOBRESCRIBIRÁ la db actual con $(FILE). Escribe 'si' para continuar: " ans; \
		[ "$$ans" = "si" ] || { echo "Cancelado."; exit 1; }; \
		$(DOCKER) exec -T postgres sh -c 'exec pg_restore -U "$$POSTGRES_USER" -d "$$POSTGRES_DB" --clean --if-exists -F c' < $(FILE) && echo "Base restaurada desde $(FILE)."

# ────────────────────────────────────────────────────────────────────────────
# 9. MANTENIMIENTO DEL SERVER
# ────────────────────────────────────────────────────────────────────────────

## errors: Muestra solo las líneas con error/exception de los logs. Uso: make errors SERVICE=backend (vacío = todos)
errors:
	@$(DOCKER) logs --tail=500 $(SERVICE) 2>&1 | grep -iE 'error|exception' | tail -n 50 || echo "Sin errores recientes."

## docker-clean: Limpieza de docker sin tocar la db (no borra volúmenes ni .env). ¡pide confirmación!
#  Ejecuta `docker system prune` (contenedores/redes/imágenes no usados). El volumen
#  pgdata queda intacto.
docker-clean:
	@read -p "[!] Borrará contenedores/redes/imágenes no usados (la db queda intacta). Escribe 'si': " ans; \
		[ "$$ans" = "si" ] || { echo "Cancelado."; exit 1; }; \
		docker system prune -f

# ────────────────────────────────────────────────────────────────────────────
# 10. GIT
# ────────────────────────────────────────────────────────────────────────────

## status: git status corto (archivos modificados/creados)
status:
	@git status -s

# ────────────────────────────────────────────────────────────────────────────
# Targets sin archivo asociado (fuerzan a make a ejecutarlos siempre)
# ────────────────────────────────────────────────────────────────────────────
.PHONY: help doctor dev-status \
        install install-backend install-frontend install-backoffice install-repo \
        dev dev-backend dev-frontend dev-backoffice dev-repo dev-stop \
        lint lint-backend lint-frontend lint-backoffice lint-repo test format \
        up down down-v ps health logs build rebuild restart config \
        db-shell db-logs db-reset db-schema db-seed shell \
        env-prod prod-config prod-build prod-up prod-deploy prod-down \
        prod-down-v prod-ps prod-logs prod-restart prod-shell prod-smoke deploy \
        backup backup-list backup-clean restore \
        errors docker-clean status

# ════════════════════════════════════════════════════════════════════════════
#  FLUJOS TÍPICOS
# ════════════════════════════════════════════════════════════════════════════
#  Día a día (desarrollo local con contenedores):
#      make install  →  make up   →  make health   →  make logs SERVICE=backend
#  Cambiaste código docker:  make rebuild
#  Cambiaste VITE_API_URL / .env.docker:  make rebuild   (el build re-incrusta la URL)
#  Todo limpio:  make down          (preserva datos)
#  Reiniciar db desde cero:  make db-reset
#
#  Primera vez en el SERVIDOR:
#      git clone <repo> && cd <raíz>
#      make env-prod                    ← crea y EDITA los .env.prod
#      make prod-deploy                 ← build + up de producción
#      make prod-smoke                  ← verifica que responde de verdad
#  Cada vez que sacas cambios a producción:
#      make deploy                      ← git pull + build + up (listo)
#      make prod-smoke                  ← confirmar que todo responde
#  Respaldo de la db (¡hazlo frecuente!):
#      make backup                      ← dump en backups/ con fecha
#      make backup-list                 ← ver listados
#      make restore FILE=backups/XXX.pg ← volver a un dump (pide confirmación)
#  Mantenimiento:   make errors · make docker-clean · make prod-logs SERVICE=backend
# ════════════════════════════════════════════════════════════════════════════