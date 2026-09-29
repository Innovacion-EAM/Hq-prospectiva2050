# HQ Prospectiva 2050

Monorepo con **backend (NestJS)**, **frontend** y **backoffice** (React + Vite), PostgreSQL, Docker Compose y Traefik. Tres formas de correr: **dev (npm)**, **docker local** y **producción**.

## Stack

| Servicio | Stack | Puerto dev (npm) | Entorno docker |
|---|---|---|---|
| backend | TypeScript · NestJS 12 · TypeORM · Node 24 | :3006 | `/api` |
| frontend | TypeScript · React 19 · Vite 8 | :5173 | `/` |
| backoffice | TypeScript · React 19 · Vite 8 | :1234 | `/admin` |
| Infra | PostgreSQL 16 · Traefik v3.5 · nginx 1.27 | — | `localhost` vía Traefik |

## Qué hace

- **Sitio público** (dinámico, sin rebuild para cambiar textos): portada, las 8 dimensiones del proyecto, noticias, documentos por categoría, convocatorias, entidades, talleres, estadísticas, páginas del proyecto y la cobertura territorial —los 12 municipios del Quindío—.
- **Formularios públicos** que llegan a la misma bandeja de mensajes: contacto, inscripciones a talleres, boletín y sugerencias (esta última admite correo opcional para quien quiera que le contesten).
- **Ciclo de atención de los mensajes**: cada mensaje se puede mover por los estados *nuevo → en revisión → respondido / archivado* y lleva una nota interna de a quién se le respondió y por qué canal. El sistema **no envía correos** (requiere SMTP/hosting); el registro es interno.
- **Backoffice** con sesión y dos roles para todo el contenido: noticias, documentos, convocatorias, mensajes, configuración editorial (incluida la de municipios), usuarios y galería de archivos.

### Datos personales

Los cuatro formularios públicos piden nombre y correo (o un texto libre que puede contenerlos), así que tratan datos personales. Por eso:

- Cada uno tiene una **casilla de autorización obligatoria** que enlaza al Aviso de Privacidad (`/privacidad`). Sin marcar, el botón no se envía.
- El backend **también la exige**: `POST /api/forms/*` responde `400` si el campo no llega o llega en `false`. Una casilla que solo vive en el navegador se puede saltar con una petición hecha a mano, y entonces no sería prueba de nada. La fila guardada lleva `consentimiento`, que es lo que el backoffice muestra como «Sin constancia» en los mensajes anteriores al aviso.
- ⚠️ **El aviso tiene dos `[PENDIENTE]` visibles** que hay que completar antes de publicar: el nombre o razón social del responsable y el canal para ejercer los derechos. Son datos de la organización, no se deducen. Está en `frontend/src/pages/PrivacidadPage.tsx`.
- La caja del hero guarda el correo **solo si lo dejan**: la columna es nullable y el backoffice muestra «Sin contacto» en lugar de una dirección inventada.

### Roles

| | **admin** | **editor** |
|---|---|---|
| Noticias, documentos, convocatorias, mensajes | ✅ | ✅ |
| Configuración editorial (dimensiones, estadísticas, entidades, municipios, talleres, categorías, páginas) | ✅ | ✅ |
| Galería: ver y subir | ✅ | ✅ |
| Galería: eliminar | ✅ | ❌ |
| Usuarios | ✅ | ❌ |
| Ajustes del sitio | ✅ | ❌ |

La primera cuenta se siembra sola: `admin@prospectiva.com` / `Admin123*`. **Cámbiala antes de salir de desarrollo** (o edita `SEED_USERS` en `backend/src/seed-data.ts`).

## Documentación

▶ **Guía completa (cómo correr cada servicio, puertos, compose, producción): [`docs/guia-del-proyecto.md`](docs/guia-del-proyecto.md)**

## Comandos rápidos

`make help` muestra el menú completo (54 comandos). Lo esencial:

```bash
make install       # dependencias de los 3 servicios
make dev           # backend + frontend + backoffice (npm, hot-reload)
make up            # entorno docker local (5 contenedores)
make test          # tests unitarios
make test-e2e      # 33 tests e2e de la API (requiere la db levantada)
make smoke         # recorrido http contra el entorno que esté corriendo
make db-migrate    # aplicar migraciones pendientes del esquema
make prod-deploy   # desplegar producción              (previo: make env-prod)
make prod-smoke    # verificar que producción responde
make backup        # respaldo de la base de datos
make doctor        # diagnóstico del entorno
```

> **Base de datos:** en dev/docker el esquema y los datos iniciales se crean solos al arrancar el backend (TypeORM `synchronize` + seeder). En producción corre con `DB_SYNCHRONIZE=false`, así que **el esquema no se crea solo**: sin él el backend no arranca (`relation "config_stats" does not exist`). Por eso `make prod-up` —y por tanto `make prod-deploy`— aplica `db-schema` y `db-migrate` antes de levantar. Si levantas el backend a mano, ese orden es obligatorio.
>
> **Migraciones:** `scripts/migrations/NNNN-*.sql`. `make db-migrate` aplica solo las que falten y las registra en `schema_migrations`; se puede volver a correr las veces que haga falta. El esquema completo para una base vacía está en `scripts/schema-db.sql` (se regenera con `pg_dump --schema-only`; el procedimiento está escrito en su propia cabecera). A partir de la 0001, los cambios incrementales van como migración numerada, no editando ese archivo.

## Pendientes

- **SSL/TLS** en Traefik.
- **Despliegue automatizado**: la CI (`.github/workflows/deploy.yml`) valida lint, typecheck, build y e2e en cada push, pero el `make deploy` sigue siendo manual.
- **Los e2e corren contra la base de desarrollo** (`.env.e2e`) y borran lo que crean. `make test-e2e` fija `APP_ENV=e2e` a propósito, pero invocar `npm run test:e2e` a mano con otro `APP_ENV` haría que los tests apuntaran a esa base y borraran datos reales.
- **⚠️ Los dos `[PENDIENTE]` del Aviso de Privacidad** (nombre del responsable y canal de peticiones). Sin ellos la página se publica pero no cumple la Ley 1581. Bloqueante para publicar.
- **⚠️ `noticias.slug` y `users.email` son UNIQUE sin mirar la columna de borrado lógico.** Consecuencia: un slug que se borró queda ocupado para siempre y la siguiente noticia con ese slug se come un 500 en vez de un «ese slug ya existe». Se detectó al hacer repetible la suite e2e. Afecta también a los correos de usuarios dados de baja.
- **12 fotos de municipios por subir**: el sistema de imágenes ya guarda la URL relativa (`/uploads/…`), deja quitar la imagen y permite asignarla en lote, pero las fotos no están.
