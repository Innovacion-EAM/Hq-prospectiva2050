1. SSL / TLS in traefik (manual or automatic)
2. Validate structure docker compose
3. CI/CD
4. Completar los dos [PENDIENTE] del Aviso de Privacidad: nombre o razón
   social del responsable y canal para ejercer los derechos. Sin ellos la
   página se publica pero no cumple la Ley 1581. Bloqueante para publicar.
   (frontend/src/pages/PrivacidadPage.tsx)
5. `noticias.slug` y `users.email` son UNIQUE sin mirar la columna de borrado
   lógico: un slug de una noticia borrada queda ocupado para siempre y la
   siguiente noticia con ese slug devuelve 500 en vez de "ese slug ya existe".
   Arreglo: índice parcial UNIQUE ... WHERE eliminado_at IS NULL.
6. Subir las 12 fotos de municipios. El sistema ya está listo (URL relativa,
   botón de quitar imagen, asignación en lote); faltan las fotos.
7. Hosting y dominio definitivos (diferido por el usuario).
