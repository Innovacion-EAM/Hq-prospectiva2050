# Checklist Desarrollador: Dominio y HTTPS (implementado)

> **Para uso interno.** Estado: **COMPLETADO**. El sitio sirve HTTPS con
> Let's Encrypt, fuerza la redirección HTTP→HTTPS y `www` va al dominio canónico.
> Este documento explica **cómo quedó montado**, cómo verificarlo y las trampas
> que ya nos encontramos (para no repetirlas).

---

## ✅ Estado actual

| Comprobación | Resultado |
|---|---|
| DNS `horizontequindio2050.com` | `A` → `3.231.164.130` |
| DNS `www.horizontequindio2050.com` | `CNAME` al apex → `3.231.164.130` |
| `https://horizontequindio2050.com/` | **200** (cert Let's Encrypt válido) |
| `https://www.horizontequindio2050.com/` | **301** → apex |
| `http://horizontequindio2050.com/` | **301** → `https://` |
| `/admin/`, `/repo/`, `/api/...` | **200** |
| Renovación del certificado | Automática (HTTP-01, cada ~60 días) |

- **Resolver ACME**: `letsencrypt`, email `prospectiva@horizontequindio2050.com`,
  método **HTTP-01**, almacenamiento en `/etc/traefik/certs/acme.json`
  (volumen persistente, sobrevive a los despliegues).
- **GitHub Variables** (Actions): `PROD_API_URL` y `PROD_SITE_URL` =
  `https://horizontequindio2050.com`.
- **HSTS**: NO activado (decisión consciente: se evalúa más adelante).

---

## 🧠 Cómo está montado (y por qué así)

### 1. Config estática: el resolver ACME

En `infra/traefik/traefik.yml`, en el **primer nivel** (NO dentro de `tls:`):

```yaml
certificatesResolvers:
  letsencrypt:
    acme:
      email: prospectiva@horizontequindio2050.com
      storage: /etc/traefik/certs/acme.json
      httpChallenge:
        entryPoint: web
```

> ⚠️ `certificatesResolvers` **solo** es válido en la config estática. Si se
> pone en un fichero de `dynamic/`, Traefik descarta ese fichero entero y se
> queda con **cero routers** (todo el sitio responde 404). Ya pasó: no lo muevas.

### 2. Config dinámica: DOS juegos de routers (clave)

**En Traefik v3, un router con `tls:` SOLO se sirve por entrypoints TLS
(`websecure`).** En el entrypoint en claro (`web`) no se enruta y responde 404.
Y al revés: un router **sin** `tls` no se sirve por un entrypoint TLS.
(Comprobado con `traefik:v3.5`: router con `tls: {}` por `web` = 404.)

Por eso en `infra/traefik/dynamic/routes.yml` cada ruta existe **dos veces**:

| Router | Entrypoint | TLS | Para qué |
|---|---|---|---|
| `frontend-http`, `backoffice-http`, `repo-http`, `api-http` | `web` | no | Acceso directo por IP/localhost; **en producción el dominio no entra aquí** |
| `https-redirect` | `web` | no | Manda **dominio + www** a HTTPS con 301 |
| `frontend`, `backoffice`, `repo`, `api` | `websecure` | sí | Sirve el sitio con certificado |
| `www-redirect` | `websecure` | sí | `www` → apex (301) |

- Los routers TLS declaran los dominios **explícitos** en `tls.domains`
  (apex + `www`). Es **imprescindible**: el parser de dominios de ACME no
  entiende la regla compuesta `Host(...) || HostRegexp(...) || Host(localhost)`
  y, sin `domains`, falla con *"Error parsing domains in provider ACME"* y no
  emite el certificado.

### 3. Redirecciones

- **HTTP → HTTPS**: router `https-redirect` (`infra/traefik/dynamic/routes.yml`)
  + middleware `redirect-https` (`middlewares.yml`). Está **acotado al dominio
  y su www** y **excluye `localhost`** (`!Host(localhost)`) para no romper el
  desarrollo local (donde `HQ_SITE_HOST=localhost`) ni el health-check del
  despliegue (que usa `Host: localhost` sobre HTTP y debe recibir 200).
- **www → apex**: router `www-redirect` (HTTPS) + middleware `redirect-www`.
- El **challenge HTTP-01** de ACME lo sirve el router interno
  `acme-http@internal`, con **prioridad máxima** (`MaxInt64`), así que ni el
  redirect ni ningún catch-all lo tapan. Verificado.

### 3.b Alternativa NO usada

`infra/traefik/dynamic/redirect.yml` (redirección global) sigue **comentado**.
No se usó porque una redirección global también atraparía `localhost` (rompería
el desarrollo local y el health-check). La redirección real vive en
`routes.yml` (router `https-redirect`), acotada al dominio. **No** descomentes
`redirect.yml` salvo que sepas lo que haces.

---

## ⚙️ Procedimiento (si hubiera que hacerlo de nuevo / en otro dominio)

### Paso 1: DNS

```bash
nslookup horizontequindio2050.com          # debe devolver 3.231.164.130
```

Requisitos: registro `A` del apex apuntando a la IP de la instancia, `www`
resolviendo a lo mismo, y **puertos 80 y 443 abiertos** en el Security Group.
Si se usa Cloudflare, dejar el registro en **DNS-only** (nube gris).

### Paso 2: Variable de host en el servidor

```bash
cd /opt/hq-prospectiva2050
sed -i 's/^HQ_SITE_HOST=.*/HQ_SITE_HOST=horizontequindio2050.com/' \
  infra/compose/.env.prod
grep HQ_SITE_HOST infra/compose/.env.prod
```

### Paso 3: TLS (ya versionado en el repo)

El resolver ACME (config estática) y los routers TLS (config dinámica) ya están
en `main`. Un despliegue normal los aplica:

```bash
HQ_TRAEFIK_RESTART=1 bash scripts/deploy/deploy.sh
```

> `HQ_TRAEFIK_RESTART=1` recrea Traefik. Hace falta cuando cambia la **config
> estática** (`traefik.yml`) o el entorno (`HQ_SITE_HOST`); un cambio solo en
> `dynamic/` se recarga **en caliente** (no hace falta).

### Paso 4: GitHub Variables

En **Settings → Secrets and variables → Actions → Variables**:

| Variable | Valor |
|---|---|
| `PROD_API_URL` | `https://horizontequindio2050.com` |
| `PROD_SITE_URL` | `https://horizontequindio2050.com` |

Se incrustan en el bundle en el build → hace falta push para recompilar.

### Paso 5: Verificación

```bash
cd /opt/hq-prospectiva2050
make prod-smoke          # contenedores, /, /admin, /repo, /api/health/db, https

# Desde cualquier máquina:
curl -I https://horizontequindio2050.com/
curl -I https://www.horizontequindio2050.com/
curl -I http://horizontequindio2050.com/
```

**Resultado esperado**:
- `https://apex` → `HTTP/2 200`.
- `https://www` y `http://apex` → `301` con `Location`.
- Certificado válido, emisor Let's Encrypt, `CN = horizontequindio2050.com`.
- (HSTS **no** aparece; no está activado.)

---

## 🚨 Troubleshooting (con lo que ya aprendimos)

| Síntoma | Causa real | Solución |
|---|---|---|
| **404 en TODO** (dominio, IP y localhost) por HTTP y trabajo con HTTPS | Un router con `tls:` **no se sirve por el entrypoint `web`** | Cada ruta necesita un router sin `tls` en `web` (ver `*-http` en `routes.yml`) |
| `404` en dominio pero IP funciona | `HQ_SITE_HOST` no actualizado | `sed` + `HQ_TRAEFIK_RESTART=1 deploy.sh` |
| Todo el sitio 404 (nada enruta) | Un fichero de `dynamic/` con `http:` como único elemento, o `certificatesResolvers` mal ubicado | Traefik descarta el fichero entero. Revisar `docker logs hq-traefik` |
| `Error parsing domains in provider ACME` | Falta `tls.domains` en los routers TLS | Añadir `domains: [main, sans]` (la regla compuesta no se parsea) |
| `acme.json` = `{}` | Challenge HTTP-01 falló | Verificar DNS propagado + puerto 80 abierto |
-| `https://` no carga, `http://` sí | Puerto 443 cerrado | Abrir 443 en el Security Group |
| `too many certificates` | Rate limit Let's Encrypt | Esperar; usar staging mientras se prueba |

---

## 🚨 La trampa que más tiempo nos costó (léela antes de tocar TLS)

En **Traefik v3**, un router con la clave `tls:` (aunque sea `tls: {}`) **solo
se sirve por entrypoints TLS** (`websecure`). En un entrypoint en claro (`web`)
**no se enruta y responde 404**. Y un router **sin** `tls` **no** se sirve por
`websecure`.

Consecuencia: **cada ruta necesita dos routers**, uno por cada entrypoint:

- `*-http` → `entryPoints: [web]`, **sin** `tls` → sirve por HTTP o redirige.
- `<ruta>` → `entryPoints: [websecure]`, **con** `tls` → sirve con certificado.

Comprobado con `traefik:v3.5`:

| Router | HTTP (`web`) | HTTPS (`websecure`) |
|---|---|---|
| con `tls: {}` | **404** | 200 |
| sin `tls` | 200 | **404** |

Otras trampas ya documentadas en el código:
- `certificatesResolvers` **solo** en la config estática (si va en `dynamic/`,
  se descarta el fichero entero → 0 routers → todo 404).
- Un fichero dinámico cuyo único contenido sea `http:` ("http cannot be a
  standalone element") descarta **todos** los dinámicos → sitio entero 404.
- Los routers TLS **deben** declarar `tls.domains` explícitos; el parser de ACME
  no entiende la regla compuesta y falla.
- El router interno `acme-http@internal` tiene prioridad **MaxInt64**: ningún
  catch-all lo tapa (por eso la redirección HTTP no rompe el challenge).

---

## 📝 Cambios en el repo (histórico)

| Commit | Contenido |
|---|---|
| `e5efc18` | Servir `horizontequindio2050.com` y redirigir `www` con 301 |
| `6b9a5a1` | SSL automático con Let's Encrypt (ACME HTTP-01) en Traefik |
| `ff6b895` | Servir HTTP y HTTPS a la vez: routers `*-http` (sin tls) + `https-redirect` |

| Archivo | Qué contiene |
|---|---|
| `infra/traefik/traefik.yml` | `certificatesResolvers.letsencrypt` (ACTIVO, primer nivel) |
| `infra/traefik/dynamic/routes.yml` | Routers `*-http` (web) + TLS (websecure) + `https-redirect` + `www-redirect` |
| `infra/traefik/dynamic/middlewares.yml` | `redirect-https`, `redirect-www`, `strip-admin`, `strip-repo` |
| `infra/traefik/dynamic/redirect.yml` | Redirección global http→https **comentada** (no se usa) |
| `infra/compose/.env.prod` (servidor) | `HQ_SITE_HOST=horizontequindio2050.com` |
| GitHub Variables | `PROD_API_URL`, `PROD_SITE_URL` |

---

## ✅ Checklist final de entrega

- [x] `nslookup` devuelve la IP correcta (apex y `www`)
- [x] `HQ_SITE_HOST` = dominio en `.env.prod` (servidor)
- [x] TLS activo (Let's Encrypt, HTTP-01)
- [x] Routers HTTP y HTTPS funcionando (dos juegos)
- [x] `http://` → 301 `https://` (acotado al dominio, sin romper localhost)
- [x] `www` → 301 apex
- [x] GitHub Variables actualizadas (`PROD_API_URL`, `PROD_SITE_URL`)
- [x] Deploy verde (`Build & Deploy`) y `make prod-smoke` OK
- [x] Certificado válido (fechas, CN correcto)
- [ ] HSTS (no activado a propósito; pendiente de evaluación)
