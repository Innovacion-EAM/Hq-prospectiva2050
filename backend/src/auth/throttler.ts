import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

/**
 * Límite general de la API: 120 peticiones por minuto.
 *
 * Alto a propósito. Una persona cargando la web dispara muchas peticiones, y
 * bloquearle sería peor que permitir un abuso: este contador frena ataques
 * volumétricos, no a un usuario. Sale de entorno para poder ajustarlo sin
 * recompilar.
 */
const DEFAULT_TTL_SECONDS = 60;
const DEFAULT_LIMIT = 120;

/**
 * Suelo de los contadores de `login` y `forms`.
 *
 * Los límites buenos de esos dos los ponen los decoradores `@Throttle` de
 * `auth.controller.ts` (5 por cuenta, 15 min) y `forms.controller.ts` (3 por
 * IP, 1 hora), porque son específicos de la ruta: la clave del login se
 * construye con el correo del cuerpo.
 *
 * Estos de aquí son SOLO el suelo, y tienen que ser altísimos a propósito:
 * el guard de la librería aplica todos los contadores registrados a TODAS
 * las rutas, no solo a las que llevan decorador. Un suelo pequeño (5 o 3)
 * acabaría limitando también al sitio público: cualquier endpoint devolvería
 * 429 después de 3 peticiones por hora desde la misma IP. Eso pasaba de
 * verdad; lo encontraron los e2e (`GET /api/site` → 429 al cuarto acceso) y
 * es el mismo motivo por el que la CI usa 10000.
 *
 * El suelo existe solo para que el contador esté registrado —un contador que
 * solo aparezca en un decorador no se aplica nunca— y para que, si alguien
 * quita el decorador, la ruta siga teniendo un tope: el volumétrico general
 * de `default` (120/min por IP), que es quien protege de verdad la API.
 */
const LOGIN_TTL_SECONDS = 15 * 60;
const FORMS_TTL_SECONDS = 60 * 60;
/** Suelo de login/forms: nunca limita en la práctica (mismo valor que el CI). */
const FLOOR_ALTO = 10000;

/**
 * Límites que imponen los decoradores `@Throttle` (los valores buenos).
 */
const LOGIN_DECORADOR = 5;
const FORMS_DECORADOR = 3;

/**
 * Interruptor maestro del throttling. Con `THROTTLE_ENABLED=false` se
 * desactivan TAMBIÉN los límites de los decoradores, no solo los suelos del
 * módulo.
 *
 * Se lee de `process.env` y no de `ConfigService` a propósito: los decoradores
 * se evalúan al importar el módulo, antes de que dotenv cargue los `.env`, así
 * que aquí solo es fiable lo que viene del entorno real (make, CI, docker).
 * Las variables de TTL/límite de los `.env` siguen leyéndose con
 * `ConfigService` dentro del `useFactory`.
 */
const THROTTLE_OFF = process.env.THROTTLE_ENABLED === 'false';

/**
 * Límite del login para el decorador de `auth.controller.ts`: 5 intentos por
 * 15 min y por cuenta (correo + IP). Con el throttling apagado (`test:e2e:api`,
 * que ejercita el mismo endpoint decenas de veces) pasa al suelo de 10000; los
 * límites de verdad se comprueban en `throttle.e2e-spec.ts` con todo activo.
 */
export const LIMITE_LOGIN_OK = THROTTLE_OFF ? FLOOR_ALTO : LOGIN_DECORADOR;
/** Límite de los formularios para los decoradores de `forms.controller.ts`. */
export const LIMITE_FORMS_OK = THROTTLE_OFF ? FLOOR_ALTO : FORMS_DECORADOR;

/**
 * Registra el guard de límites en toda la aplicación.
 *
 * Va como módulo aparte, y no dentro de `AuthModule`, porque protege toda la
 * API y no solo lo que tiene que ver con la autenticación.
 *
 * Cada contador debe aparecer AQUÍ para que exista. El guard recorre la lista
 * de contadores configurados, y para cada uno busca si la ruta lleva un
 * `@Throttle` con ese mismo nombre. Un contador que solo exista en un
 * decorador no se aplica nunca: es la lista de este módulo la que decide qué
 * se comprueba. Por eso los tres están declarados, aunque `login` y `forms`
 * tengan sus números buenos en el decorador.
 *
 * El orden de los guards no es un detalle:
 *
 *   1. `AuthGuard` primero. Si una ruta protegida recibe una petición sin
 *      token, responde 401 sin llegar a gastar un cupo del contador. Al revés,
 *      un atacante podría agotar el límite general solo con llamar a rutas
 *      protegidas sin token y dejar sin servicio a los usuarios de verdad.
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
      useFactory: (config: ConfigService) => {
        const isCi = config.get<string>('APP_ENV') === 'ci' || config.get<string>('THROTTLE_ENABLED') === 'false';
        return [
          {
            name: 'default',
            ttl: seconds(
              config.get<number>('THROTTLE_TTL_DEFAULT', DEFAULT_TTL_SECONDS),
            ),
            limit: isCi ? 10000 : config.get<number>('THROTTLE_LIMIT_DEFAULT', DEFAULT_LIMIT),
          },
          {
            name: 'login',
            ttl: seconds(
              config.get<number>('THROTTLE_TTL_LOGIN', LOGIN_TTL_SECONDS),
            ),
            limit: isCi ? FLOOR_ALTO : config.get<number>('THROTTLE_LIMIT_LOGIN', FLOOR_ALTO),
          },
          {
            name: 'forms',
            ttl: seconds(
              config.get<number>('THROTTLE_TTL_FORMS', FORMS_TTL_SECONDS),
            ),
            limit: isCi ? FLOOR_ALTO : config.get<number>('THROTTLE_LIMIT_FORMS', FLOOR_ALTO),
          },
        ];
      },
    }),
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class ThrottlerConfigModule {}