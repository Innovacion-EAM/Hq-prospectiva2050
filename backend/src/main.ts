import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:1234'],
  });

  await app.listen(config.get<number>('PORT') ?? 3000);
}
void bootstrap();