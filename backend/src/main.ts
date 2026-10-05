import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as path from 'node:path';
import * as fs from 'node:fs';
import express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const uploadsDir = path.resolve(config.get<string>('UPLOAD_DIR', 'uploads'));
  fs.mkdirSync(uploadsDir, { recursive: true });
  // Dos montajes, a propósito. Las URLs que guarda el backend ya son públicas
  // (`${baseUrl}/api/uploads/...`), pero hay dos despliegues con distinto número
  // de prefijos:
  //   - npm dev:  nada quita prefijos → el backend recibe /api/uploads/...
  //   - docker:   traefik quita un /api  → el backend recibe /uploads/...
  // Sin el segundo montage, en producción toda imagen subida devolvería 404.
  app.use('/api/uploads', express.static(uploadsDir));
  app.use('/uploads', express.static(uploadsDir));

  const corsOrigins = config
    .get<string>(
      'CORS_ORIGINS',
      'http://localhost:5173,http://localhost:1234',
    )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({ origin: corsOrigins });
  app.setGlobalPrefix('api', { exclude: ['health', 'health/(.*)'] });

  await app.listen(config.get<number>('PORT') ?? 3000);
}
void bootstrap();