import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

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