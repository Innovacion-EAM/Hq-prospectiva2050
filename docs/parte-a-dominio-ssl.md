# Dominio y HTTPS: estado final

> **Para el propietario del dominio.** Resumen: **ya está todo configurado y
> funcionando**. `https://horizontequindio2050.com` sirve el sitio con
> certificado válido y candado 🔒, y `www` redirige al dominio principal. No
> hace falta que nos envíen tokens de DNS ni certificados: el certificado es de
> **Let's Encrypt** y **se renueva solo**.

---

## ✅ Qué está funcionando ahora

| URL | Comportamiento |
|---|---|
| `https://horizontequindio2050.com/` | **200 OK** con certificado válido (Let's Encrypt) |
| `https://www.horizontequindio2050.com/` | **301** → `https://horizontequindio2050.com/` |
| `http://horizontequindio2050.com/` | **301** → `https://horizontequindio2050.com/` (fuerza HTTPS) |
| `http://www.horizontequindio2050.com/` | **301** → `https://...` (y de ahí, al dominio principal) |

- **Canónico**: el dominio **sin `www`**. Google indexa una sola URL.
- **Rutas**: el sitio público en `/`, el backoffice en `/admin/`, el repositorio
  de información en `/repo/` y la API en `/api/`.

---

## 1. Lo único que hizo falta desde el lado del dominio

Un **registro DNS tipo `A`** que apunte a la IP de la instancia:

| Campo | Valor |
|---|---|
| **Tipo** | `A` |
| **Nombre / Host** | `@` (y `www`) |
| **Valor / Apunta a** | `3.231.164.130` |
| **TTL** | `3600` |

Con eso, Let's Encrypt pudo comprobar el dominio automáticamente. ✅ Ya hecho.

---

## 2. ¿Por qué ya no necesitamos token de DNS ni certificados manuales?

Existen varias formas de obtener el certificado. Para este dominio usamos la
más sencilla y **automática**: **Let's Encrypt con validación HTTP-01**.

- Let's Encrypt comprueba que el dominio es de quien lo pide haciéndole una
  petición automática por el **puerto 80**; Traefik la responde.
- **No** requiere credenciales del proveedor de DNS.
- **No** requiere que nadie genere ni entregue un certificado `.pem`.
- El certificado **se renueva automáticamente** cada pocos meses, sin
  intervención humana.

> Alternativas que **no** hicieron falta: validación por DNS (token del
> proveedor) o certificado manual entregado por el propietario. Solo se usarían
> si el puerto 80 no pudiera estar abierto o hubiera un CDN por delante.

---

## 3. Cómo comprobarlo

Desde cualquier navegador o terminal:

```bash
curl -I http://horizontequindio2050.com/
# Debe responder 301 y Location: https://horizontequindio2050.com/

curl -I https://horizontequindio2050.com/
# Debe responder HTTP/2 200

curl -I https://www.horizontequindio2050.com/
# Debe responder 301 → https://horizontequindio2050.com/

# Ver el certificado:
openssl s_client -connect horizontequindio2050.com:443 \
  -servername horizontequindio2050.com </dev/null 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates
# Emisor: Let's Encrypt
# CN: horizontequindio2050.com
```

---

## 4. Qué NO hay que hacer

- ❌ No hay que renovar el certificado a mano: es automático.
- ❌ No hay que enviarnos ningún `.pem`.
- ❌ No hay que cambiar nada en el proveedor de DNS (el registro `A` ya está).

> **HSTS** (forzar HTTPS en el navegador durante meses) **no** está activado por
> ahora, a propósito: primero se confirma que todo funciona estable y se evalúa
> activarlo más adelante.

---

**Contacto técnico**: Para cualquier duda, escriban a quien les envió esta guía.
