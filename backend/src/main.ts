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

  // Traefik es el único proxy delante del backend y corre en la red de Docker.
  // Sin esto, Express toma la IP del contenedor de Traefik como IP del
  // cliente, y eso rompe dos cosas a la vez: el rate limiting (contaría todas
  // las peticiones como si vinieran de la misma IP, o sea que bloquearía a
  // todo el mundo a la vez) y `req.protocol`, que se quedaría en http aunque
  // haya TLS delante.
  //
  // Se pone `1` y no `true` a propósito: `true` haría caso de la cabecera
  // X-Forwarded-For que envíe el cliente, y entonces bastaría con mandar esa
  // cabecera para inventarse la IP y esquivar los límites. Con `1` solo se
  // confía en el primer salto, que es Traefik.
  const expressApp = app.getHttpAdapter().getInstance() as express.Express;
  expressApp.set('trust proxy', 1);

  await app.listen(config.get<number>('PORT') ?? 3000);
}
void bootstrap();