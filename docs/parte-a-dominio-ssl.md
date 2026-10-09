# Guía para el Propietario del Dominio: Configurar DNS y HTTPS

> **Contexto**: El software "Horizonte Quindío 2050" ya está desplegado y funcionando en una instancia AWS EC2, accesible por su IP elástica (`http://3.231.164.130/`). Ahora necesitamos que el dominio propio (`horizontequindio2050.com`) apunte a esa instancia y el sitio sirva por HTTPS.

---

## ✅ Resumen rápido: lo que necesitamos de usted

| # | Acción | Detalle |
|---|---|---|
| 1 | **Registro DNS A** | Apuntar `@` (o `www`) a la IP: `3.231.164.130` |
| 2 | **Puertos 80 y 443** | Verificar que estén abiertos en el Security Group de AWS (ya están) |
| 3 | **Certificado TLS** | Elegir **una** opción: acceso a API de DNS (recomendado) **O** entregarnos `fullchain.pem` + `privkey.pem` |
| 4 | **Proveedor de DNS** | Decirnos cuál usan (Route53, Cloudflare, GoDaddy, Namecheap, Hostinger, etc.) |

---

## 1. Configurar el DNS (Registro A)

En el panel de su proveedor de dominios, cree/edite este registro:

| Campo | Valor |
|---|---|
| **Tipo** | `A` |
| **Nombre / Host** | `@` (o `www` si prefieren) |
| **Valor / Apunta a** | `3.231.164.130` |
| **TTL** | `3600` (1 hora) |

### ⚠️ Tres avisos importantes

1. **Si usan Cloudflare**: déjenlo en **DNS-only** (nube gris), **no** en proxy (nube naranja). El proxy rompe la validación automática del certificado.
2. **El TTL de 3600** significa hasta 1 hora de propagación. Es normal que tarde en verse.
3. **No toquen otros registros** (MX, TXT de correo, NS). Solo cambien el registro `A`.

---

## 2. HTTPS: el certificado (elegir **una** opción)

### Opción 1 — Acceso a la API de DNS (recomendada, automática)

Creen un **token de API** de la zona DNS con permiso para **crear y borrar registros TXT**.

| Proveedor | Cómo crear el token |
|---|---|
| **Cloudflare** | My Profile → API Tokens → Create Token → Zone → DNS → Edit |
| **Route53 (AWS)** | IAM → Create user → Policy: `route53:ChangeResourceRecordSets` en la hosted zone |
| **GoDaddy** | Developer Portal → API Keys → Production |
| **Namecheap** | Profile → API Access → Whitelisted IPs (añadir IP de la instancia) |
| **Hostinger** | hPanel → Advanced → DNS Zone Editor → API |
| **Otros** | Buscar "API token DNS TXT records" en su panel |

Con este token **nosotros emitimos y renovamos el certificado solos** (cada 90 días). No tienen que hacer nada más.

### Opción 2 — Nos entregan el certificado ya emitido (manual)

Descarguen del panel de su proveedor dos archivos:

- `fullchain.pem` — el certificado (incluye cadena intermedia)
- `privkey.pem` — la clave privada

**Renovación**: tendrán que volver a descargárnoslos cada año (o cuando caduque). Si su panel lo renueva solo y avisa por email, solo reenvíennoslo.

---

## 3. Qué nos deben enviar

| Si eligieron Opción 1 | Si eligieron Opción 2 |
|---|---|
| ✅ Token de API de DNS | ✅ `fullchain.pem` |
| ✅ Nombre del proveedor (Cloudflare, Route53, etc.) | ✅ `privkey.pem` |
| ✅ Confirmación: "el DNS ya apunta a 3.231.164.130" | ✅ Confirmación: "el DNS ya apunta a 3.231.164.130" |

---

## ✅ Checklist final (para que nos confirmen)

- [ ] Registro `A` creado apuntando a `3.231.164.130`
- [ ] Si usan Cloudflare: **DNS-only** (nube gris)
- [ ] Puerto 80 y 443 abiertos en AWS Security Group (ya están)
- [ ] **Opción 1**: Token API DNS + nombre del proveedor
- [ ] **Opción 2**: Archivos `fullchain.pem` + `privkey.pem`
- [ ] Confirmación: "El dominio ya resuelve a 3.231.164.130" (`nslookup horizontequindio2050.com` devuelve la IP)

---

## Qué pasará después (nosotros nos encargamos)

1. Cambiamos `HQ_SITE_HOST` de IP a dominio
2. Activamos TLS en Traefik (con su token o sus archivos)
3. Desplegamos (`bash scripts/deploy/deploy.sh`)
4. Verificamos: `https://horizontequindio2050.com/` → **200 OK** con candado verde 🔒

---

**Contacto técnico**: Para cualquier duda, escriban a quien les envió esta guía. El proceso técnico de nuestra parte tarda ~5 minutos una vez recibimos lo anterior.