# Checklist Desarrollador: Activar Dominio y HTTPS

> **Para uso interno** — Qué solicitar, verificar y ejecutar después de que el propietario del dominio complete su parte.

---

## 📋 Qué solicitar al propietario del dominio

### Información obligatoria (checklist de recepción)

| ✅ | Dato | Formato esperado | Ejemplo |
|---|---|---|---|
| ☐ | **Dominio exacto** | FQDN | `prospectivaquindio2050.com` |
| ☐ | **Confirmación DNS** | `nslookup` resuelve a IP | `3.231.164.130` |
| ☐ | **Opción TLS elegida** | `auto` \| `manual` | `auto` |
| ☐ | **Proveedor DNS** | Nombre | `Cloudflare`, `Route53`, `GoDaddy` |
| ☐ | **Token API DNS** (si `auto`) | String (secreto) | `cf_ABC123...` |
| ☐ | **Archivos certificado** (si `manual`) | `fullchain.pem` + `privkey.pem` | Archivos adjuntos |

> **Nota**: Si eligen Opción 1 (auto), **solo necesitan el token y el proveedor**. Si eligen Opción 2 (manual), necesitan los dos archivos `.pem`.

---

## 🔍 Verificaciones previas (antes de tocar nada)

```bash
# 1. Verificar que el DNS ya apunta a la IP de la instancia
nslookup prospectivaquindio2050.com
# Debe devolver: 3.231.164.130

# 2. Verificar que NO hay registro AAAA (IPv6) conflictivo
nslookup -type=AAAA prospectivaquindio2050.com
# Debe devolver: "no AAAA records" o apuntar a la misma instancia

# 3. Verificar puertos en Security Group AWS
# 80 (HTTP) y 443 (HTTPS) abiertos a 0.0.0.0/0
```

---

## ⚙️ Pasos de activación (ejecutar en orden)

### Paso 1: Actualizar variable de host en el servidor

```bash
cd /opt/hq-prospectiva2050

# Cambiar IP por dominio en .env.prod
sed -i 's/^HQ_SITE_HOST=.*/HQ_SITE_HOST=prospectivaquindio2050.com/' \
  infra/compose/.env.prod

# Verificar cambio
grep HQ_SITE_HOST infra/compose/.env.prod
# HQ_SITE_HOST=prospectivaquindio2050.com
```

### Paso 2: Configurar TLS en Traefik

#### SI eligieron Opción 1 (Automática - Let's Encrypt)

```bash
# 1. Editar traefik.yml: descomentar bloque tls: y poner email real
vim infra/traefik/traefik.yml
# Descomentar y editar:
# certificatesResolvers:
#   letsencrypt:
#     acme:
#       email: admin@prospectivaquindio2050.com   # <-- EMAIL REAL
#       storage: /letsencrypt/acme.json
#       httpChallenge:
#         entryPoint: web

# 2. Si usan DNS challenge (no HTTP-01), configurar provider:
#    Route53, Cloudflare, etc. (ver ejemplos comentados en el archivo)

# 3. Activar tls: en los 3 routers de routes.yml
vim infra/traefik/dynamic/routes.yml
# Añadir en cada router (frontend, backoffice, api):
#   tls:
#     certResolver: letsencrypt

# 4. Recrear Traefik
HQ_TRAEFIK_RESTART=1 bash scripts/deploy/deploy.sh
```

#### SI eligieron Opción 2 (Certificado manual)

```bash
# 1. Subir certificados al servidor (desde tu máquina local)
scp fullchain.pem privkey.pem \
  ubuntu@3.231.164.130:/opt/hq-prospectiva2050/infra/traefik/certs/

# 2. En el servidor, verificar permisos
chmod 600 /opt/hq-prospectiva2050/infra/traefik/certs/*.pem

# 3. Activar tls: en los 3 routers (SIN certResolver)
vim infra/traefik/dynamic/routes.yml
# En cada router:
#   tls: {}   # vacío, usa los archivos del store default

# 4. Activar redirección HTTP -> HTTPS
vim infra/traefik/dynamic/redirect.yml
# Descomentar el router http-to-https

# 5. Recrear Traefik
HQ_TRAEFIK_RESTART=1 bash scripts/deploy/deploy.sh
```

### Paso 3: Actualizar variables de build en GitHub

En **GitHub → Settings → Secrets and variables → Actions → Variables**:

| Variable | Valor nuevo |
|---|---|
| `PROD_API_URL` | `https://prospectivaquindio2050.com/api` |
| `PROD_SITE_URL` | `https://prospectivaquindio2050.com` |

> **Importante**: Estas URLs se **incrustan en el bundle** en el build. Hay que hacer push para que se recompilen.

### Paso 4: Forzar rebuild y deploy

```bash
# Opción A: Push vacío (forza rebuild en Actions)
git commit --allow-empty -m "chore: trigger rebuild with HTTPS URLs"
git push origin main

# Opción B: Desde GitHub Actions UI → Build & Deploy → Run workflow → deploy: true
```

### Paso 5: Verificación final

```bash
cd /opt/hq-prospectiva2050
make prod-smoke

# Verificación manual
curl -I https://prospectivaquindio2050.com/
curl -I https://prospectivaquindio2050.com/admin
curl -I https://prospectivaquindio2050.com/api/health

# Verificar certificado
openssl s_client -connect prospectivaquindio2050.com:443 -servername prospectivaquindio2050.com </dev/null 2>/dev/null | openssl x509 -noout -dates
```

**Resultado esperado**:
- Todos los `curl -I` → `HTTP/2 200` + cabecera `strict-transport-security`
- `openssl` → certificado válido, fechas correctas, CN = prospectivaquindio2050.com

---

## 📝 Resumen de cambios en el repo (para commit posterior)

| Archivo | Cambio |
|---|---|
| `infra/compose/.env.prod` | `HQ_SITE_HOST=prospectivaquindio2050.com` |
| `infra/traefik/traefik.yml` | Email real en `certificatesResolvers.letsencrypt.acme.email` |
| `infra/traefik/dynamic/routes.yml` | Bloque `tls: { certResolver: letsencrypt }` en 3 routers |
| `infra/traefik/dynamic/redirect.yml` | (Solo Opción 2) Router `http-to-https` descomentado |
| GitHub Variables | `PROD_API_URL`, `PROD_SITE_URL` actualizadas |

> **Commit sugerido**:
> ```bash
> git add infra/compose/.env.prod infra/traefik/traefik.yml infra/traefik/dynamic/routes.yml
> git commit -m "feat(https): activar TLS para prospectivaquindio2050.com"
> git push origin main
> ```

---

## 🚨 Troubleshooting rápido

| Síntoma | Causa | Solución |
|---|---|---|
| `acme.json` = `{}` | Challenge falló | Verificar DNS propagado + puerto 80 abierto |
| `https://` no carga, `http://` sí | Puerto 443 cerrado | Abrir 443 en Security Group AWS |
| `too many certificates` | Rate limit Let's Encrypt | Esperar 1 semana o usar certificado manual |
| `404` en dominio pero IP funciona | `HQ_SITE_HOST` no actualizado | `sed` + `HQ_TRAEFIK_RESTART=1 deploy.sh` |
| Certificado manual expira | Renovación anual | Calendar reminder: 30 días antes, pedir nuevos `.pem` |

---

## ✅ Checklist final de entrega

- [ ] `nslookup` devuelve IP correcta
- [ ] `HQ_SITE_HOST` actualizado en `.env.prod`
- [ ] TLS configurado en Traefik (Opción 1 o 2)
- [ ] `HQ_TRAEFIK_RESTART=1 deploy.sh` ejecutado
- [ ] GitHub Variables actualizadas (`PROD_API_URL`, `PROD_SITE_URL`)
- [ ] Push a `main` ejecutado (rebuild automático)
- [ ] `make prod-smoke` → todo verde
- [ ] `curl -I https://dominio.com/` → 200 + HSTS
- [ ] Certificado válido (fechas, CN correcto)

---

**Tiempo estimado total**: 15-20 minutos (si el DNS ya propagó).