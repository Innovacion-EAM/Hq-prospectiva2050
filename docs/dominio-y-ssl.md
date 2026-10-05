# Dominio y HTTPS: lo que falta para pasar de http://IP a https://dominio

> **Estado actual**: la aplicación está desplegada y funcionando en la instancia,
> accesible por su **IP elástica** en `http://IP/` y `http://IP/admin`.
>
> Este documento es el paso pendiente: que el dominio apunte a la instancia y
> que el sitio sirva por HTTPS. Está escrito para dos lectores:
>
> - **Parte A**: lo que tienen que hacer los dueños del dominio (DNS + certificado).
> - **Parte B**: lo que hacemos nosotros cuando lo handover.
>
> Todo lo técnico de esta parte ya está preparado en el repositorio. No hay que
> tocar código: cuando llegue el DNS y el certificado, son unos comandos.

---

## Resumen: qué necesitamos de vosotros

| # | Qué | Para qué | Quién lo hace |
|---|---|---|---|
| 1 | Registro DNS `A` que apunte a la IP de la instancia | Que el dominio llegue al sitio | **Dueños del dominio** |
| 2 | Puertos 80 y 443 abiertos en el puerto de entrada de la instancia | Que el tráfico llegue a Traefik | Ya hecho / verificar |
| 3 | Un certificado TLS (o un token de API del DNS) | Que el sitio sirva `https://` | **Dueños del dominio** |
| 4 | Decirnos qué proveedor de DNS usáis | Para saber cómo automatizar el certificado | **Dueños del dominio** |

Los puntos 1 y 3 son los únicos que bloquean. El 2 conviene verificarlo una vez.

---

# PARTE A — Para los dueños del dominio

## A.1 DNS: apuntar el dominio a la instancia

En el panel del proveedor del dominio, crear este registro:

| Campo | Valor |
|---|---|
| Tipo | `A` |
| Nombre / Host | `@` (o el subdominio que queráis, por ejemplo `www`) |
| Valor / Apunta a | `IP_ELASTICA_DE_LA_INSTANCIA` |
| TTL | `3600` |

Y **no crear un registro `AAAA`** (IPv6) salvo que ALSO apunte a nuestra
instancia. Un `AAAA` obsoleto hace que en redes con IPv6 el navegador se vaya a
otro sitio y la web parezca caída aunque el `A` sea correcto.

### Tres avisos importantes

**1. Si usáis Cloudflare, dejadlo en DNS-only.**

Poner el modo "nube naranja" (proxy activado) rompe la emisión del certificado
automático: Cloudflare responde por el dominio y el servidor nunca recibe la
petición de validación. Dejadlo en **solo DNS** hasta que confirmemos que el
certificado está emitido.

**2. El TTL de 3600 significa hasta 1 hora de propagación.**

Aunque el registro se guards al instante, hay caching en resolvers e
intermediarios. El sitio puede tardar en aparecer. Es normal.

**3. No cambiéis nada más del DNS actual.**

Si el dominio ya apunta a otro sitio (una web previa, un parked domain),
cambiad solo el `A` indicado y dejad el resto de registros (MX, TXT de
verificación de correo, NS) intactos. Borrar registros MX deja sin correo el
dominio.

## A.2 HTTPS: necesitamos el certificado

Para servir `https://` hay que emitir un certificado para el dominio. Hay dos
vías y necesitamos **una** de las dos. La diferencia es quién lo emite y quién lo
renueva.

### Opción 1 — Nos dais acceso a la zona DNS (recomendada)

Nos creáis un **token de API** de la zona DNS, con permiso para crear y borrar
registros de tipo `TXT`.

Con eso:
- emitimos el certificado nosotros mismos, **sin que el dominio tenga que apuntar
  todavía** (la validación se hace sobre un registro TXT, no sobre el tráfico web);
- se renueva solo cada 90 días, sin que nadie tenga que intervenir.

Necesitamos saber **qué proveedor de DNS usáis** (Route53, Cloudflare, GoDaddy,
Namecheap, Hostinger, DonGodomains...) porque el token se crea de forma distinta
en cada uno.

### Opción 2 — Nos entregáis el certificado ya emitido

Os descargáis el certificado SSL del dominio desde vuestro panel y nos lo
pasáis en dos ficheros:

- `fullchain.pem` — el certificado
- `privkey.pem` — la clave privada

Con esto el sitio sirve `https://` desde el primer día, pero el certificado hay
que **renovarlo a mano una vez al año**. Si el panel os lo renueva solo y os avisa
por correo, basta con que nos lo reenvíes cuando llegue ese aviso.

---

# PARTE B — Lo que hacemos nosotros

Nada de esto requiere escribir código: la configuración de Traefik para TLS ya
está en el repositorio, escrita y probada.

## B.1 Cuando el DNS ya apunta

El servidor ya está escuchando, así que en cuanto el DNS resuelva a la instancia
el sitio responde por el dominio. Aun así hay que actualizar la variable de host,
porque los routers de Traefik filtran por nombre de host.

En el servidor:

```bash
cd /opt/hq-prospectiva2050

# Cambiar el host: IP -> dominio
sed -i 's/^HQ_SITE_HOST=.*/HQ_SITE_HOST=prospectivaquindio2050.com/' \
  infra/compose/.env.prod

# Recrear Traefik para que aplique el nuevo host
HQ_TRAEFIK_RESTART=1 bash scripts/deploy/deploy.sh
```

En GitHub (`Settings → Secrets and variables → Actions → Variables`):

| Variable | Nuevo valor |
|---|---|
| `PROD_API_URL` | `https://prospectivaquindio2050.com/api` |
| `PROD_SITE_URL` | `https://prospectivaquindio2050.com` |

Y después un `git push origin main`, porque esas URLs van **incrustadas dentro
del bundle** en el momento del build: no se pueden cambiar en caliente.

## B.2 Emitir el certificado (Opción 1, automática)

1. Editar `infra/traefik/dynamic/tls-letsencrypt.yml` y poner un email real
   (donde pone `cambia-este-email@ejemplo.com`). Let's Encrypt avisa por ahí
   antes de que caduque.

2. Si usáis un CDN por delante, o el puerto 80 no se puede usar, cambiar
   `httpChallenge` por `dnsChallenge` y pegar el token. El fichero trae
   commented el esquema de Route53, Cloudflare, Gandi y otros.

3. Añadir el bloque `tls:` a los tres routers de `infra/traefik/dynamic/routes.yml`
   (el fichero trae el bloque escrito y comentado, con instrucciones):

   ```yaml
   tls:
     certResolver: letsencrypt
   ```

4. Recrear Traefik:

   ```bash
   cd /opt/hq-prospectiva2050 && HQ_TRAEFIK_RESTART=1 bash scripts/deploy/deploy.sh
   ```

5. Comprobar que se emitió:

   ```bash
   docker compose -f infra/compose/docker-compose.yml \
     -f infra/compose/docker-compose.prod.yml exec traefik \
     cat /etc/traefik/certs/acme.json | head -c 100
   ```

   Si sale `{}`, el challenge falló. Repasar A.1: casi siempre es que el DNS
   todavía no ha propagado o que el puerto 80 no está abierto.

## B.3 Usar el certificado que nos entreguéis (Opción 2)

1. Subir los ficheros al servidor:

   ```bash
   scp fullchain.pem privkey.pem \
     ubuntu@IP:/opt/hq-prospectiva2050/infra/traefik/certs/
   ```

   Esa carpeta está en `.gitignore`: los certificados nunca se commitean.

2. Añadir `tls:` (sin `certResolver`) a los tres routers de `routes.yml`.

3. Activar la redirección de http a https descomentando
   `infra/traefik/dynamic/redirect.yml`.

4. `HQ_TRAEFIK_RESTART=1 bash scripts/deploy/deploy.sh`

## B.4 Verificación

```bash
cd /opt/hq-prospectiva2050
make prod-smoke
```

El paso `[5/5]` ahora comprueba el certificado: si `acme.json` (o los `.pem`)
existen, pide la página por `https://` y muestra el código de respuesta.

Comprobación a mano, desde cualquier equipo:

```bash
curl -I https://prospectivaquindio2050.com/
curl -I https://prospectivaquindio2050.com/admin
```

Ambos deben devolver `200` y `strict-transport-security` en la cabecera.

---

## Si algo sale mal

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| El dominio no carga | DNS sin propagar | `nslookup prospectivaquindio2050.com` debe devolver la IP de la instancia |
| Carga en IPv4 pero no en general | Registro `AAAA` obsoleto | Quitar el `AAAA` (A.1, punto 2) |
| `acme.json` sigue en `{}` | Challenge fallido | Verificar DNS propagado y puerto 80 abierto |
| El certificado se emite pero `https://` no carga | Puerto 443 cerrado | Abrir el 443 en el puerto de entrada de la instancia |
| Sale "too many certificates" / rate limit | Se han pedido demasiados certificados | Esperar; Let's Encrypt limita a 5 certificados nuevos por semana y a duplicados por semana |

---

## Anexo: por qué el certificado va "a medias" hoy

Mientras el dominio no apunta a la instancia, el sitio se sirve por `http://`
usando la IP. Es una medida provisional para poder probar el sistema; en cuanto
el dominio esté listo, se cambia a `https://` y la IP deja de usarse como
dirección pública del sitio.

La configuración de TLS que está en el repositorio **ya está escrita y probada**:
el resolver de Let's Encrypt (`tls-letsencrypt.yml`), el volumen de certificados,
la redirección de http a https y la instrucción de activar el bloque `tls:` en los
routers. Está todo listo para cuando llegue el DNS.