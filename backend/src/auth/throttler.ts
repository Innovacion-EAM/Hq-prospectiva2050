import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

/**
 * Límite general de la API.
 *
 * Alto a propósito: una persona cargando la web dispara muchas peticiones, y
 * bloquearle sería peor que permitir un abuso. Su trabajo es frenar ataques
 * volumétricos, no a un usuario. Los límites que sí miran el riesgo de verdad
 * (login y formularios) están en los decoradores `@Throttle` de sus
 * controladores, porque dependen de la petición.
 *
 * Este valor sale de entorno para poder subirlo sin recompilar, que es lo que
 * hace falta el día que el tráfico real no sea el de las pruebas.
 */
const DEFAULT_TTL_SECONDS = 60;
const DEFAULT_LIMIT = 120;

/**
 * Módulo que registra el guard de límites en toda la aplicación.
 *
 * Va como módulo aparte, y no dentro de `AuthModule`, porque protege toda la
 * API y no solo lo que tiene que ver con la autenticación.
 *
 * El orden de los guards no es un detalle:
 *
 *   1. `AuthGuard` primero. Si una ruta protegida recibe una petición sin
 *      token, responde 401 sin llegar a gastar un cupo del contador. Al revés,
 *      un atacante que llame a una ruta protegida sin token consumiría también
 *      el límite general, y podría dejar sin servicio a los usuarios reales.
 *   2. `ThrottlerGuard` después, sobre lo que ya pasó el guard de sesión.
 *
 * En `app.module.ts`, `AuthGuard` se registra como provider de `AppModule` y
 * este módulo se importa después, que es lo que produce ese orden.
 */
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          name: 'default',
          ttl: seconds(config.get<number>('THROTTLE_TTL_DEFAULT', DEFAULT_TTL_SECONDS)),
          limit: config.get<number>('THROTTLE_LIMIT_DEFAULT', DEFAULT_LIMIT),
        },
      ],
    }),
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class ThrottlerConfigModule {}