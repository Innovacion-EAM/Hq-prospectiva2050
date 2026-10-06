# HQ Prospectiva 2050

Monorepo con **backend (NestJS)**, **frontend**, **backoffice** y **repositorio de información** (React + Vite), PostgreSQL, Docker Compose y Traefik. Tres formas de correr: **dev (npm)**, **docker local** y **producción**.

## Stack

| Servicio | Stack | Puerto dev (npm) | Entorno docker |
|---|---|---|---|
| backend | TypeScript · NestJS 12 · TypeORM · Node 24 | :3006 | `/api` |
| frontend | TypeScript · React 19 · Vite 8 | :5173 | `/` |
| backoffice | TypeScript · React 19 · Vite 8 | :1234 | `/admin` |
| repo | TypeScript · React 19 · Vite 8 · Recharts | :4173 | `/repo` |
| Infra | PostgreSQL 16 · Traefik v3.5 · nginx 1.27 | — | `localhost` vía Traefik |

## Documentación

- ▶ **Guía completa (cómo correr cada servicio, puertos, compose, producción): [`docs/guia-del-proyecto.md`](docs/guia-del-proyecto.md)**
- ▶ **Repositorio de información (la cuarta app, /repo): [`docs/repositorio-de-informacion.md`](docs/repositorio-de-informacion.md)**
- ▶ **Despliegue en AWS EC2 con CI/CD (paso a paso): [`docs/despliegue-aws.md`](docs/despliegue-aws.md)**
- ▶ **Dominio y HTTPS (para los dueños del dominio y para nosotros): [`docs/dominio-y-ssl.md`](docs/dominio-y-ssl.md)**

## Comandos rápidos

`make help` muestra el menú completo. Lo esencial:

```bash
make install       # dependencias de los 4 servicios
make dev           # backend + frontend + backoffice + repo (npm, hot-reload)
make up            # entorno docker local (6 contenedores)
make prod-deploy   # producción: descarga imágenes de GHCR y rearranca
make prod-smoke    # verificar que producción responde
make backup        # respaldo de la base de datos
make doctor        # diagnóstico del entorno
```

> **Base de datos:** en dev/docker el esquema y los datos iniciales se crean solos al arrancar el backend (TypeORM `synchronize` + seeder). En producción `DB_SYNCHRONIZE=false`, así que el esquema se crea explícitamente con `make prod-db-init` (idempotente, genera el esquema desde las entidades de TypeORM y siembra las tablas vacías).

## Despliegue

El flujo de producción es **construir en CI, desplegar sin compilar**:

```
git push main  →  GitHub Actions (lint + tests → buildx → GHCR)  →  SSH  →  pull + up
```

Las imágenes nunca se compilan en la instancia: una t3.micro (1 vCPU / 1 GB) se
queda sin memoria. El arranque inicial de la instancia es un comando:

```bash
sudo HQ_SITE_HOST=tudominio.com \
     GHCR_DEPLOY_USER=tu_usuario \
     GHCR_DEPLOY_TOKEN=ghp_xxx \
     ./scripts/deploy/bootstrap.sh
```

Detalle completo, secretos incluidos, en [`docs/despliegue-aws.md`](docs/despliegue-aws.md).

**Pendientes:** SSL/TLS y migraciones del esquema — ver [TODO.md](TODO.md).