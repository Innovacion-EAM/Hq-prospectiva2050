# HQ Prospectiva 2050

Monorepo con **backend (NestJS)**, **frontend** y **backoffice** (React + Vite), PostgreSQL, Docker Compose y Traefik. Tres formas de correr: **dev (npm)**, **docker local** y **producción**.

## Stack

| Servicio | Stack | Puerto dev (npm) | Entorno docker |
|---|---|---|---|
| backend | TypeScript · NestJS 12 · TypeORM · Node 24 | :3006 | `/api` |
| frontend | TypeScript · React 19 · Vite 8 | :5173 | `/` |
| backoffice | TypeScript · React 19 · Vite 8 | :1234 | `/admin` |
| Infra | PostgreSQL 16 · Traefik v3.5 · nginx 1.27 | — | `localhost` vía Traefik |

## Documentación

▶ **Guía completa (cómo correr cada servicio, puertos, compose, producción): [`docs/guia-del-proyecto.md`](docs/guia-del-proyecto.md)**

## Comandos rápidos

`make help` muestra el menú completo (54 comandos). Lo esencial:

```bash
make install       # dependencias de los 3 servicios
make dev           # backend + frontend + backoffice (npm, hot-reload)
make up            # entorno docker local (5 contenedores)
make prod-deploy   # desplegar producción              (previo: make env-prod)
make prod-smoke    # verificar que producción responde
make backup        # respaldo de la base de datos
make doctor        # diagnóstico del entorno
```

**Pendientes:** SSL/TLS, migraciones del esquema, CI/CD — ver [Pendientes en la guía](docs/guia-del-proyecto.md#12-pendientes).