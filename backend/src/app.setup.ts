import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'node:path';
import * as fs from 'node:fs';
import express from 'express';
import { MulterExceptionFilter } from './common/http-exception.filter';

/**
 * Configuración de la aplicación: prefijo global, CORS, archivos estáticos y
 * validación.
 *
 * Vive en su propio archivo, y no dentro de `main.ts`, para que los tests e2e
 * monten la app exactamente igual que producción sin importar `main.ts` (que
 * además levantaría un servidor al ser importado). Si esto no se compartiera,
 * los tests pasarían sin el `ValidationPipe` y no podrían comprobar que la API
 * rechaza entradas inválidas.
 */
export function configureApp(app: INestApplication): void {
  const config = app.get(ConfigService);

  // Detrás de Traefik/ingress hay un proxy: sin esto `req.protocol` siempre
  // sería http y las URLs de los archivos subidos quedarían sin https.
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  const uploadsDir = path.resolve(config.get<string>('UPLOAD_DIR', 'uploads'));
  fs.mkdirSync(uploadsDir, { recursive: true });
  app.use('/api/uploads', express.static(uploadsDir));

  const corsOrigins = config
    .get<string>('CORS_ORIGINS', 'http://localhost:5173,http://localhost:1234')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });
  // El prefijo global es `api`, y las rutas internas no lo repiten: el
  // controlador de mensajes escucha en `/mensajes` y públicalmente responde en
  // `/api/mensajes`. El frontend SIEMPRE pide con `/api` delante —`site-context`
  // hace `fetch("${API_BASE}/api/site")`, las listas `${API_BASE}/api/noticias`,
  // los formularios `${API_BASE}/api/forms/...` y los archivos
  // `${API_BASE}/api/uploads/...`—, así que `API_BASE` es el origen (sin `/api`)
  // y **Traefik NO quita el prefijo** (ver `infra/traefik/dynamic/routes.yml`).
  // Quitar este prefijo y confiar en un middleware que recorte `/api` habría
  // dejado el sitio con el contenido de respaldo: las peticiones al panel de
  // configuración llegaban a una ruta que no existía y el front tenía que
  // mostrar lo que trae por defecto.
  //
  // El health también queda bajo el prefijo (`/api/health` y `/api/health/db`),
  // sin exclusiones: es la URL pública que documenta el proyecto (`smoke.sh` y
  // `make prod-smoke` la comprueban por `traefik`, y el healthcheck del
  // contenedor llama a `http://127.0.0.1:3000/api/health` directo al backend).
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      // Rechaza campos que el cliente manda y el DTO no declara, en vez de
      // dejarlos pasar hacia un `Object.assign(entity, body)` sin control.
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );
  app.useGlobalFilters(new MulterExceptionFilter());
}
