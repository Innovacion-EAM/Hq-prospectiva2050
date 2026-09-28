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
  app.setGlobalPrefix('api', { exclude: ['health', 'health/(.*)'] });

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
