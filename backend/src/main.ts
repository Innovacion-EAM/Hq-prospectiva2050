import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as path from 'node:path';
import * as fs from 'node:fs';
import express from 'express';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  configureApp(app);

  // Segundo montaje además del `/api/uploads` que hace configureApp: los datos
  // de instalaciones anteriores guardaron imágenes con la ruta sin `/api`
  // (`/uploads/...`), y este montaje mantiene vivas esas URLs. El backend de
  // producción anterior servía también en /uploads porque el proxy le recortaba
  // el prefijo; hoy el proxy pasa `/api` tal cual, pero la carpeta sigue
  // llegando por ambas rutas por compatibilidad hacia atrás.
  const uploadsDir = path.resolve(config.get<string>('UPLOAD_DIR', 'uploads'));
  fs.mkdirSync(uploadsDir, { recursive: true });
  app.use('/uploads', express.static(uploadsDir));

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