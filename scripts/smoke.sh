#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════════════════
#  HQ PROSPECTIVA 2050 — Smoke test
# ════════════════════════════════════════════════════════════════════════════
#  Comprueba que el sistema realmente funciona de punta a punta contra el stack
#  que esté levantado, no solo que los contenedores están "healthy".
#
#  Qué cubre:
#    · las 8 páginas /dimensiones/:slug (4 dimensiones + 4 bloques de apoyo)
#    · los 4 formularios públicos, incluidos boletin y sugerencias
#    · que los 4 rechacen el envío sin la autorización de la Ley 1581
#    · los 12 municipios cargados y la página del Aviso de Privacidad
#    · la validación de entrada (400 en vez de aceptar basura)
#    · la autenticación y los dos roles (admin / editor)
#    · el rechazo de archivos peligrosos en la galería
#
#  Uso:
#    make smoke                       # contra http://localhost
#    BASE=https://dominio make smoke  # contra otro despliegue
#
#  Sale con código 1 si algo falla, para poder encadenarlo en CI.
# ════════════════════════════════════════════════════════════════════════════
set -uo pipefail

BASE="${BASE:-http://localhost}"
# La API pública es el origen más `/api`: el prefijo lo pone el backend
# (prefijo global de Nest) y Traefik pasa la petición tal cual — ver
# backend/src/app.setup.ts y infra/traefik/dynamic/routes.yml.
API="$BASE/api"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@prospectiva.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Admin123*}"

ROJO=$'\033[31m'; VERDE=$'\033[32m'; GRIS=$'\033[90m'; FIN=$'\033[0m'
fallos=0

ok()   { printf "  ${VERDE}✓${FIN} %s\n" "$1"; }
fail() { printf "  ${ROJO}✗${FIN} %s ${GRIS}(esperado %s, recibido %s)${FIN}\n" "$1" "$2" "$3"; fallos=$((fallos+1)); }
info() { printf "  ${GRIS}·${FIN} %s\n" "$1"; }

# code <descripción> <url> <código esperado> [método] [cuerpo]
code() {
  local desc="$1" url="$2" esperado="$3" metodo="${4:-GET}" cuerpo="${5:-}"
  local got
  if [ -n "$cuerpo" ]; then
    got=$(curl -sk -o /dev/null -w '%{http_code}' -X "$metodo" -H 'content-type: application/json' -d "$cuerpo" "$url")
  else
    got=$(curl -sk -o /dev/null -w '%{http_code}' -X "$metodo" "$url")
  fi
  [ "$got" = "$esperado" ] && ok "$desc" || fail "$desc" "$esperado" "$got"
}

section() { printf "\n${GRIS}── %s ──${FIN}\n" "$1"; }

# ════════════════════════════════════════════════════════════════════════════
section "1. Contenedores"
if command -v docker >/dev/null 2>&1; then
  docker ps --filter "name=hq-" --format '    {{.Names}}: {{.Status}}'
  no_sanos=$(docker ps --filter "name=hq-" --filter "health=unhealthy" --format '{{.Names}}' | wc -l)
  [ "$no_sanos" -eq 0 ] && ok "ninguno está unhealthy" || fail "contenedores unhealthy" 0 "$no_sanos"
else
  info "docker no disponible, se omite"
fi

# ════════════════════════════════════════════════════════════════════════════
section "2. Rutas públicas del sitio web"
code "frontend  /"                       "$BASE/"                        200
code "backoffice /admin"                "$BASE/admin"                   200
code "noticias"                         "$BASE/noticias"                200
code "documentos"                       "$BASE/documentos"              200
# El Aviso de Privacidad es a lo que apunta la casilla de autorización de los
# cuatro formularios. Si la ruta no existiera, la autorización no sería
# "informada" y la página 404 se vería solo después de marcar la casilla.
code "aviso de privacidad"               "$BASE/privacidad"              200

# Estas 8 devolvían una pantalla en blanco: body venía como texto y el frontend
# hacía body.map(). Son 4 dimensiones de análisis y 4 bloques de apoyo.
for slug in politico-institucional economica-productiva fisico-ambiental \
            socio-cultural misiones retos iniciativas hallazgos; do
  code "dimensión /$slug" "$BASE/dimensiones/$slug" 200
done

# ════════════════════════════════════════════════════════════════════════════
section "3. API — salud y datos"
code "health de base de datos"          "$BASE/api/health/db"           200
code "bundle del sitio"                 "$API/site"                     200

# Las 4 comprobaciones siguientes verifican que el sitio viene con el contenido
# del documento de arquitectura: las 8 dimensiones, los 14 aliados, los 12
# municipios. Con la base vacía a propósito (`make db-vacia`) ese contenido no
# existe, así que no pueden pasar. Omitirlas con un aviso es más honesto que
# dejar cuatro X rojas que parecen un error del sitio y son solo que está vacío.
n_contenido=$(curl -sk "$API/site" | python3 -c "
import json,sys
try:
    d=json.load(sys.stdin)
except Exception:
    print(0); raise SystemExit
print(len(d.get('dimensiones',[]))+len(d.get('entidades',[]))+len(d.get('municipios',[])))
" 2>/dev/null)
SIN_CONTENIDO=0
if [ "${n_contenido:-0}" = "0" ]; then
  SIN_CONTENIDO=1
  printf "\n  ${VERDE}!${FIN} La base está SIN contenido de muestra (SEED_CONTENIDO=false).\n"
  printf "  ${GRIS}Las 4 comprobaciones de contenido se omiten: no fallan, es que no hay\n"
  printf "  nada que comprobar. Todo lo demás (formularios, bandeja, auth, roles) sí se\n"
  printf "  verifica igual. Para comprobar el contenido también: make db-reset${FIN}\n"
fi

dims=$(curl -sk "$API/site" | python3 -c "
import json,sys
try:
    d=json.load(sys.stdin).get('dimensiones',[])
except Exception:
    print(0); raise SystemExit
mal=[x['slug'] for x in d if not isinstance(x.get('body'),list) or not x['body']]
print(f'{len(d)-len(mal)}/{len(d)}')
" 2>/dev/null)
if [ "$SIN_CONTENIDO" = "1" ]; then
  info "entradas con body como lista — omitida (base sin contenido)"
elif [ "${dims%%/*}" = "${dims##*/}" ] && [ "$dims" != "0/0" ]; then
  ok "las $dims entradas traen body como lista de párrafos"
else
  fail "entradas con body como lista" "todas" "$dims"
fi

# El documento de arquitectura define exactamente 4 dimensiones de análisis; las
# otras entradas deben estar marcadas como bloques de apoyo, no como dimensiones.
tipos=$(curl -sk "$API/site" | python3 -c "
import json,sys
try:
    d=json.load(sys.stdin).get('dimensiones',[])
except Exception:
    print('0/0'); raise SystemExit
dims=[x for x in d if x.get('tipo')=='dimension']
bloq=[x for x in d if x.get('tipo')=='bloque']
sin=[x['slug'] for x in d if x.get('tipo') not in ('dimension','bloque')]
print(f'{len(dims)}|{len(bloq)}|{len(sin)}')
" 2>/dev/null)
n_dims=${tipos%%|*}; resto=${tipos#*|}; n_bloq=${resto%%|*}; sin_tipo=${resto##*|}
if [ "$SIN_CONTENIDO" = "1" ]; then
  info "dimensiones de análisis — omitida (base sin contenido)"
elif [ "$n_dims" = "4" ] && [ "$sin_tipo" = "0" ]; then
  ok "hay exactamente 4 dimensiones de análisis (+$n_bloq bloques de apoyo)"
else
  fail "dimensiones de análisis" "4" "$n_dims (bloques: $n_bloq, sin tipo: $sin_tipo)"
fi

# Los 14 aliados del documento, no 11.
aliados=$(curl -sk "$API/site" | python3 -c "
import json,sys
try:
    print(len(json.load(sys.stdin).get('entidades',[])))
except Exception:
    print(0)
" 2>/dev/null)
if [ "$SIN_CONTENIDO" = "1" ]; then
  info "aliados — omitida (base sin contenido)"
elif [ "$aliados" = "14" ]; then
  ok "los 14 aliados del documento están cargados"
else
  fail "aliados" "14" "$aliados"
fi

# Los 12 municipios del Quindío. No basta con que sean 12: la sección del sitio
# muestra el nombre y la ficha, así que una fila sin `nombre` o sin `dato` se
# vería como un hueco en la página en vez de un municipio.
municipios=$(curl -sk "$API/site" | python3 -c "
import json,sys
try:
    ms=json.load(sys.stdin).get('municipios',[])
except Exception:
    print('0/0/0'); raise SystemExit
nombres=[m.get('nombre') for m in ms]
vacios=[m for m in ms if not (m.get('nombre') or '').strip() or not (m.get('dato') or '').strip()]
print('%d|%d|%d' % (len(ms), len(vacios), len(set(nombres))))
" 2>/dev/null)
n_mun=${municipios%%|*}; resto=${municipios#*|}; mun_vacios=${resto%%|*}; mun_unicos=${resto##*|}
if [ "$SIN_CONTENIDO" = "1" ]; then
  info "municipios — omitida (base sin contenido)"
elif [ "$n_mun" = "12" ] && [ "$mun_vacios" = "0" ] && [ "$mun_unicos" = "12" ]; then
  ok "los 12 municipios del Quindío, con nombre y dato, sin repetir"
else
  fail "municipios" "12 con nombre y dato, sin repetir" \
       "$n_mun (sin nombre o dato: $mun_vacios, nombres distintos: $mun_unicos)"
fi

# ════════════════════════════════════════════════════════════════════════════
section "4. Formularios públicos"
# `consentimiento: true` es lo que exige la Ley 1581: sin esa casilla marcada, el
# formulario no se puede enviar. Abajo se comprueba que sin ella da 400.
code "contacto (válido)"      "$API/forms/contacto"     201 POST \
  '{"nombre":"Smoke Test","email":"smoke@example.com","mensaje":"Mensaje de prueba del smoke test.","consentimiento":true}'
code "inscripciones (válido)" "$API/forms/inscripciones" 201 POST \
  '{"nombre":"Smoke Test","email":"smoke@example.com","taller":"Mesa técnica","consentimiento":true}'
code "boletín (válido)"       "$API/forms/boletin"      201 POST \
  '{"email":"smoke@example.com","consentimiento":true}'
# La caja del hero admite correo opcional. Se manda con él y con espacios al
# alrededor a propósito: pegar un correo con un espacio sobrante es lo más
# normal, y antes el backend lo rechazaba con un 400 aunque la dirección fuera
# buena, porque validaba antes de recortar.
code "sugerencias (válido)"   "$API/forms/sugerencias"  201 POST \
  '{"nombre":"Smoke Test","email":"  smoke@example.com  ","sugerencia":"Sugerencia de prueba del smoke test.","consentimiento":true}'
# Y sin correo, que es el caso normal de una caja anónima: no debe inventar una
# dirección, la guarda vacía.
code "sugerencias sin correo" "$API/forms/sugerencias"  201 POST \
  '{"nombre":"Smoke Test","sugerencia":"Sugerencia anónima de prueba del smoke.","consentimiento":true}'
code "sugerencias con correo inválido" "$API/forms/sugerencias" 400 POST \
  '{"nombre":"Smoke Test","email":"esto-no-es-correo","sugerencia":"Correo inválido a propósito.","consentimiento":true}'

# La casilla del sitio deshabilita el botón, pero eso es solo interfaz. Lo que
# obliga es el servidor: un `curl` con el cuerpo completo pero sin la
# autorización tiene que ser rechazado, que es lo que exige el artículo 7 de la
# Ley 1581 y lo que hace que el consentimiento sea prueba de algo.
code "contacto sin consentimiento"       "$API/forms/contacto"     400 POST \
  '{"nombre":"Smoke Test","email":"smoke@example.com","mensaje":"Mensaje completo sin la casilla."}'
code "inscripciones sin consentimiento"  "$API/forms/inscripciones" 400 POST \
  '{"nombre":"Smoke Test","email":"smoke@example.com","taller":"Mesa técnica"}'
code "boletín sin consentimiento"        "$API/forms/boletin"      400 POST \
  '{"email":"smoke@example.com"}'
code "sugerencias sin consentimiento"    "$API/forms/sugerencias"  400 POST \
  '{"nombre":"Smoke Test","sugerencia":"Sugerencia completa sin la casilla."}'

# `false` explícito es lo mismo que omitirlo: la autorización se concede marcando
# la casilla, y `false` es no haberla marcado.
code "contacto con consentimiento en false" "$API/forms/contacto"    400 POST \
  '{"nombre":"Smoke Test","email":"smoke@example.com","mensaje":"Mensaje completo con la casilla en false.","consentimiento":false}'

# ════════════════════════════════════════════════════════════════════════════
section "5. Validación de entrada"
code "contacto sin cuerpo"       "$API/forms/contacto"    400 POST '{}'
code "news sin autenticación"   "$API/noticias"          401 POST '{}'
code "sugerencias sin texto"     "$API/forms/sugerencias" 400 POST '{"nombre":"X"}'

# ════════════════════════════════════════════════════════════════════════════
section "6. Autenticación y roles"
login() {
  curl -sk -X POST "$API/auth/login" -H 'content-type: application/json' \
    -d "{\"email\":\"$1\",\"password\":\"$2\"}" | python3 -c \
    'import json,sys; print(json.load(sys.stdin).get("accessToken",""))' 2>/dev/null
}

ADMIN_TOKEN=$(login "$ADMIN_EMAIL" "$ADMIN_PASSWORD")
if [ -n "$ADMIN_TOKEN" ]; then
  ok "login de admin"
  auth=(-H "authorization: Bearer $ADMIN_TOKEN")

  got=$(curl -sk -o /dev/null -w '%{http_code}' "${auth[@]}" "$API/noticias")
  [ "$got" = "200" ] && ok "admin lee /noticias" || fail "admin lee /noticias" 200 "$got"

  got=$(curl -sk -o /dev/null -w '%{http_code}' "$API/media")
  [ "$got" = "401" ] && ok "sin token /media responde 401" || fail "sin token /media" 401 "$got"

  # Un slug inexistente no debe devolver otro artículo.
  got=$(curl -sk -o /dev/null -w '%{http_code}' "$API/noticias/no-existe-este-slug")
  [ "$got" = "404" ] && ok "slug de noticia inexistente → 404" || fail "slug inexistente" 404 "$got"

  # Validación en rutas de escritura.
  got=$(curl -sk -o /dev/null -w '%{http_code}' -X POST "${auth[@]}" \
    -H 'content-type: application/json' -d '{}' "$API/noticias")
  [ "$got" = "400" ] && ok "POST /noticias sin cuerpo → 400" || fail "POST /noticias vacío" 400 "$got"

  got=$(curl -sk -o /dev/null -w '%{http_code}' -X POST "${auth[@]}" \
    -H 'content-type: application/json' -d '{"label":"x","value":"1","inventado":true}' "$API/config/stats")
  [ "$got" = "400" ] && ok "campo no declarado en /config/stats → 400" || fail "campo no declarado" 400 "$got"

  got=$(curl -sk -o /dev/null -w '%{http_code}' -X POST "${auth[@]}" \
    -H 'content-type: application/json' -d '{}' "$API/config/coleccion-inexistente")
  [ "$got" = "404" ] && ok "colección inexistente → 404" || fail "colección inexistente" 404 "$got"

  # La colección de municipios es la que hace editable la sección del sitio.
  got=$(curl -sk -o /dev/null -w '%{http_code}' "${auth[@]}" "$API/config/municipios?perPage=100")
  [ "$got" = "200" ] && ok "admin lee /config/municipios" || fail "admin lee /config/municipios" 200 "$got"

  # Sin token, la colección no se puede leer ni escribir: si se pudiera, cualquiera
  # podría reescribir la cobertura territorial del sitio.
  got=$(curl -sk -o /dev/null -w '%{http_code}' "$API/config/municipios")
  [ "$got" = "401" ] && ok "sin token /config/municipios → 401" || fail "sin token /config/municipios" 401 "$got"

  # ── Ciclo de atención de los mensajes ───────────────────────────────────
  # Lo que se escribe en el hero tiene que poder seguir un ciclo de atención:
  # sin esto, el mensaje llega y se queda, porque no hay a quién responderle ni
  # dónde anotar que ya se respondió.
  smoke_id=$(curl -sk -H "authorization: Bearer $ADMIN_TOKEN" "$API/mensajes" 2>/dev/null \
    | python3 -c 'import json,sys
d=json.load(sys.stdin); d=d.get("data",d) if isinstance(d,dict) else d
print(next((str(m["id"]) for m in d if m.get("nombre")=="Smoke Test" and m.get("tipo")=="sugerencias"), ""))' 2>/dev/null)
  if [ -n "$smoke_id" ]; then
    ok "la sugerencia del smoke llegó a la bandeja"
  else
    fail "la sugerencia del smoke llegó a la bandeja" "1 mensaje" "0"
  fi

  # El estado solo puede ser uno de los cuatro del ciclo. Inventar otro tiene que
  # ser rechazado, no guardado medio tonto: el filtro de la bandeja depende de que
  # el valor sea uno de los conocidos.
  got=$(curl -sk -o /dev/null -w '%{http_code}' -X PATCH "${auth[@]}" \
    -H 'content-type: application/json' -d '{"estado":"inventado"}' "$API/mensajes/$smoke_id")
  [ "$got" = "400" ] && ok "estado inventado → 400" || fail "estado inventado" 400 "$got"

  if [ -n "$smoke_id" ]; then
    got=$(curl -sk -o /dev/null -w '%{http_code}' -X PATCH "${auth[@]}" \
      -H 'content-type: application/json' \
      -d '{"estado":"respondido","seguimiento":"Respondido durante el smoke test."}' "$API/mensajes/$smoke_id")
    [ "$got" = "200" ] && ok "estado y seguimiento se guardan" || fail "estado y seguimiento" 200 "$got"

    # El texto que envió la ciudadanía es evidencia: no puede reescribirse desde
    # el backoffice. Si se pudiera, alguien podría hacer pasar por suyo un mensaje
    # que nunca llegó así.
    got=$(curl -sk -o /dev/null -w '%{http_code}' -X PATCH "${auth[@]}" \
      -H 'content-type: application/json' \
      -d '{"mensaje":"Texto reescrito a mano","consentimiento":false}' "$API/mensajes/$smoke_id")
    [ "$got" = "400" ] && ok "el mensaje original no se puede reescribir" || fail "re-escritura del original" 400 "$got"
  fi
else
  fail "login de admin" "200" "credenciales rechazadas"
fi

# ════════════════════════════════════════════════════════════════════════════
section "7. Galería — archivos peligrosos"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
printf '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>' > "$tmp/evil.svg"
printf '<html><script>alert(1)</script></html>' > "$tmp/evil.html"

if [ -n "$ADMIN_TOKEN" ]; then
  for archivo in evil.svg evil.html; do
    got=$(curl -sk -o /dev/null -w '%{http_code}' -X POST "${auth[@]}" \
      -F "file=@$tmp/$archivo" "$API/media/uploads")
    [ "$got" = "400" ] && ok "$archivo rechazado (XSS)" || fail "$archivo rechazado" 400 "$got"
  done
else
  info "sin token de admin, se omite la prueba de subidas"
fi

# ════════════════════════════════════════════════════════════════════════════
section "8. Limpieza"
# Los 4 formularios escriben mensajes de verdad. Si el smoke no los borrara,
# cada corrida dejaría 4 filas más y la bandeja de admin se llenaría de ruido.
# Se borran por el marcador "Smoke Test" que ponen los propios formularios.
if [ -n "$ADMIN_TOKEN" ]; then
  antes=$(curl -sk -H "authorization: Bearer $ADMIN_TOKEN" "$API/mensajes" 2>/dev/null \
    | python3 -c 'import json,sys
d=json.load(sys.stdin); d=d.get("data",d) if isinstance(d,dict) else d
print(sum(1 for m in d if m.get("nombre")=="Smoke Test" or m.get("email")=="smoke@example.com"))' 2>/dev/null || echo 0)
  [ "$antes" -gt 0 ] 2>/dev/null && info "$antes mensaje(s) de smoke de corridas anteriores"

  # Que el 201 no se haya dado con la autorización de adorno: los mensajes que
  # acaba de escribir el smoke tienen que traerla en `true`. Es el mismo dato que
  # necesita el backoffice para saber a quién se le pidió consentimiento, así que
  # si aquí no se guarda, no sirve de nada que el 400 exista.
  sin_consent=$(curl -sk -H "authorization: Bearer $ADMIN_TOKEN" "$API/mensajes?perPage=100" 2>/dev/null \
    | python3 -c 'import json,sys
try:
    d=json.load(sys.stdin); d=d.get("data",d) if isinstance(d,dict) else d
except Exception:
    print(-1); raise SystemExit
mios=[m for m in d if m.get("nombre")=="Smoke Test" or m.get("email")=="smoke@example.com"]
print(sum(1 for m in mios if m.get("consentimiento") is not True))' 2>/dev/null || echo -1)
  if [ "$sin_consent" = "0" ]; then
    ok "los mensajes del smoke guardan la autorización"
  else
    fail "mensajes sin autorización guardada" 0 "$sin_consent"
  fi

  # Todo mensaje nuevo entra en `nuevo`. Si alguno llegara con otro estado, el
  # filtro de la bandeja mentiría: mostraría como ya atendido algo que nadie tocó.
  mal_estado=$(curl -sk -H "authorization: Bearer $ADMIN_TOKEN" "$API/mensajes?perPage=100" 2>/dev/null \
    | python3 -c 'import json,sys
try:
    d=json.load(sys.stdin); d=d.get("data",d) if isinstance(d,dict) else d
except Exception:
    print(-1); raise SystemExit
mios=[m for m in d if m.get("nombre")=="Smoke Test" or m.get("email")=="smoke@example.com"]
print(sum(1 for m in mios if m.get("tipo")=="sugerencias" and m.get("estado") not in ("nuevo","respondido")))' 2>/dev/null || echo -1)
  if [ "$mal_estado" = "0" ]; then
    ok "las sugerencias del smoke nacen en estado nuevo"
  else
    fail "sugerencias con estado inesperado" 0 "$mal_estado"
  fi

  # La sugerencia sin correo tiene que quedar sin correo, no con una dirección
  # inventada: la bandeja muestra «Sin contacto» y no muestra un correo falso.
  anonimos=$(curl -sk -H "authorization: Bearer $ADMIN_TOKEN" "$API/mensajes?perPage=100" 2>/dev/null \
    | python3 -c 'import json,sys
try:
    d=json.load(sys.stdin); d=d.get("data",d) if isinstance(d,dict) else d
except Exception:
    print(-1); raise SystemExit
mios=[m for m in d if m.get("nombre")=="Smoke Test" and m.get("tipo")=="sugerencias"]
print(sum(1 for m in mios if m.get("email")))' 2>/dev/null || echo -1)
  if [ "$anonimos" = "1" ]; then
    ok "la sugerencia sin correo se guardó sin correo"
  else
    fail "sugerencias con correo inesperado" 1 "$anonimos"
  fi

  for id in $(curl -sk -H "authorization: Bearer $ADMIN_TOKEN" "$API/mensajes" 2>/dev/null \
      | python3 -c 'import json,sys
d=json.load(sys.stdin); d=d.get("data",d) if isinstance(d,dict) else d
print(" ".join(str(m["id"]) for m in d if m.get("nombre")=="Smoke Test" or m.get("email")=="smoke@example.com"))' 2>/dev/null); do
    curl -sk -o /dev/null -X DELETE -H "authorization: Bearer $ADMIN_TOKEN" "$API/mensajes/$id"
  done

  quedan=$(curl -sk -H "authorization: Bearer $ADMIN_TOKEN" "$API/mensajes" 2>/dev/null \
    | python3 -c 'import json,sys
d=json.load(sys.stdin); d=d.get("data",d) if isinstance(d,dict) else d
print(sum(1 for m in d if m.get("nombre")=="Smoke Test" or m.get("email")=="smoke@example.com"))' 2>/dev/null || echo 0)
  if [ "$quedan" = "0" ]; then
    ok "mensajes del smoke borrados"
  else
    info "quedan $quedan mensaje(s) del smoke (borrado manual pendiente)"
  fi
else
  info "sin token de admin, se omite la limpieza"
fi

# ════════════════════════════════════════════════════════════════════════════
printf "\n"
if [ "$fallos" -eq 0 ]; then
  printf "${VERDE}══ Smoke test superado: todo responde como debe ══${FIN}\n"
  exit 0
fi
printf "${ROJO}══ Smoke test fallido: %d comprobación(es) ══${FIN}\n" "$fallos"
exit 1
