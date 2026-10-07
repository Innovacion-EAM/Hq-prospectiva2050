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

## Qué hace

- **Sitio público** (dinámico, sin rebuild para cambiar textos): portada, las 8 dimensiones del proyecto, noticias, documentos por categoría, convocatorias, entidades, talleres, estadísticas, páginas del proyecto y la cobertura territorial —los 12 municipios del Quindío—.
- **Formularios públicos** que llegan a la misma bandeja de mensajes: contacto, inscripciones a talleres, boletín y sugerencias (esta última admite correo opcional para quien quiera que le contesten).
- **Ciclo de atención de los mensajes**: cada mensaje se puede mover por los estados *nuevo → en revisión → respondido / archivado* y lleva una nota interna de a quién se le respondió y por qué canal. El sistema **no envía correos** (requiere SMTP/hosting); el registro es interno.
- **Bandeja que se refresca sola** y con **contador de sin leer** en el menú, como el globito de WhatsApp: la lista se vuelve a pedir cada 30 segundos y el número baja cuando el mensaje se marca como leído, no al archivarlo.
- **Backoffice** con sesión y dos roles para todo el contenido: noticias, documentos, convocatorias, mensajes, configuración editorial (incluida la de municipios), usuarios y galería de archivos.
- **Ajustes del sitio sin tocar código**: el encabezado se edita desde el panel —logo, los textos que van al lado y el **orden de los enlaces del menú**, que se mueve con las flechas de cada fila. Del menú solo se cambia el orden, que es lo único que hace falta; si la lista llega a quedar vacía, el sitio no se queda sin barra (usa el menú de respaldo) y el panel ofrece **«Poner el menú del sitio»** para reponerla con un clic. También se editan **el titular del hero** (Ajustes → Home, renglón por renglón) y **la columna de «El proyecto» del pie** (Ajustes → Footer: hasta seis páginas elegidas de Configuración → Proyecto, con su orden; sin ninguna elegida, el pie muestra las suyas). El resto de rótulos de bloque son fijos y las demás columnas del pie también.

### Datos personales

Los cuatro formularios públicos piden nombre y correo (o un texto libre que puede contenerlos), así que tratan datos personales. Por eso:

- Cada uno tiene una **casilla de autorización obligatoria** que enlaza al Aviso de Privacidad (`/privacidad`). Sin marcar, el botón no se envía.
- El backend **también la exige**: `POST /api/forms/*` responde `400` si el campo no llega o llega en `false`. Una casilla que solo vive en el navegador se puede saltar con una petición hecha a mano, y entonces no sería prueba de nada. La fila guardada lleva `consentimiento`, que es lo que el backoffice muestra como «Sin constancia» en los mensajes anteriores al aviso.
- ⚠️ **El aviso (`/privacidad`) es una sola página con tres secciones** —Aviso de privacidad (Ley 1581), Política de tratamiento y Derechos del titular (ARCO)— y los datos que solo conoce la organización van **entre corchetes `[ … ]`**: nombre o razón social del responsable, canal para ejercer los derechos, plazo de conservación y quiénes acceden. Se rellenan **antes de publicar**; mientras quede un corchete, la página se publica pero no cumple la ley. Está en `frontend/src/pages/PrivacidadPage.tsx`.
- La caja del hero guarda el correo **solo si lo dejan**: la columna es nullable y el backoffice muestra «Sin contacto» en lugar de una dirección inventada.

### Roles

| | **admin** | **editor** |
|---|---|---|
| Noticias, documentos, convocatorias, mensajes | ✅ | ✅ |
| Configuración editorial (dimensiones, estadísticas, entidades, municipios, talleres, categorías, páginas) | ✅ | ✅ |
| Galería: ver y subir | ✅ | ✅ |
| Galería: eliminar | ✅ | ❌ |
| Usuarios | ✅ | ❌ |
| Ajustes del sitio (por módulos, uno por bloque del sitio) | ✅ | ❌ |

La primera cuenta se siembra sola: `prospectiva@horizontequindio2050.com` / `prospectiva@horizontequindio2050.com`. **Cámbiala antes de salir de desarrollo** (o edita `SEED_USERS` en `backend/src/seed-data.ts`).

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
make test          # tests unitarios
make test-e2e      # e2e de la API: core con throttling activo + api con throttling apagado
make smoke         # recorrido http contra el entorno que esté corriendo
make db-vacia      # vaciar la base de contenido, para probar el sitio desde cero
make db-migrate    # aplicar migraciones pendientes del esquema
make prod-deploy   # desplegar producción              (previo: make env-prod)
make prod-smoke    # verificar que producción responde
make backup        # respaldo de la base de datos
make doctor        # diagnóstico del entorno
```

> **Base de datos:** en dev/docker el esquema y los datos iniciales se crean solos al arrancar el backend (TypeORM `synchronize` + seeder). Para probar el sitio desde cero, `make db-vacia` borra el contenido de muestra y deja solo la cuenta de admin y la configuración del sitio —lo mínimo para poder entrar al backoffice y escribirlo todo a mano—; `make db-reset` recupera la semilla. En producción `DB_SYNCHRONIZE=false`, así que el esquema se crea explícitamente con `make prod-db-init` (idempotente: genera el esquema desde las entidades de TypeORM y siembra las tablas vacías).
>
> **Migraciones:** `scripts/migrations/NNNN-*.sql`. `make db-migrate` aplica solo las que falten y las registra en `schema_migrations`; se puede volver a correr las veces que haga falta. El esquema completo para una base vacía está en `scripts/schema-db.sql` (se regenera con `pg_dump --schema-only`; el procedimiento está escrito en su propia cabecera). A partir de la 0001, los cambios incrementales van como migración numerada, no editando ese archivo.

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

## Pendientes

**Pendientes:** SSL/TLS, migraciones del esquema, backups y más — ver [TODO.md](TODO.md).

- **Los e2e corren contra la base de desarrollo** (`.env.e2e`) y borran lo que crean. `make test-e2e` fija `APP_ENV=e2e` a propósito, pero invocar `npm run test:e2e` a mano con otro `APP_ENV` haría que los tests apuntaran a esa base y borraran datos reales.
- **⚠️ Los corchetes del Aviso de Privacidad** (nombre del responsable, canal para ejercer los derechos, plazo de conservación y quiénes acceden), en `frontend/src/pages/PrivacidadPage.tsx`. Sin ellos la página se publica pero no cumple la Ley 1581. Bloqueante para publicar.
- **⚠️ `noticias.slug` y `users.email` son UNIQUE sin mirar la columna de borrado lógico.** Consecuencia: un slug que se borró queda ocupado para siempre y la siguiente noticia con ese slug se come un 500 en vez de un «ese slug ya existe». Se detectó al hacer repetible la suite e2e. Afecta también a los correos de usuarios dados de baja.
- **12 fotos de municipios por subir**: el sistema de imágenes ya guarda la URL relativa (`/uploads/…`), deja quitar la imagen y permite asignarla en lote, pero las fotos no están.
