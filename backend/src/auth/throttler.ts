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
 * Valores por defecto de los contadores de `login` y `forms`.
 *
 * Los límites buenos de esos dos los ponen los decoradores `@Throttle` de
 * `auth.controller.ts` y `forms.controller.ts`, porque dependen de la
 * petición (la clave del login se construye con el correo del cuerpo).
 *
 * Estos de aquí son el suelo: si alguien quita el decorador por error, el
 * contador sigue existiendo y aplicando un límite razonable en vez de dejar
 * la ruta sin ninguna protección.
 *
 * Poner aquí el valor "bueno" no serviría de nada: en la librería, el
 * decorador siempre gana sobre la configuración del módulo, así que al revés
 * el entorno no tendría efecto y sería configuración muerta.
 */
const LOGIN_TTL_SECONDS = 15 * 60;
const LOGIN_LIMIT = 5;
const FORMS_TTL_SECONDS = 60 * 60;
const FORMS_LIMIT = 3;

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
      useFactory: (config: ConfigService) => [
        {
          name: 'default',
          ttl: seconds(
            config.get<number>('THROTTLE_TTL_DEFAULT', DEFAULT_TTL_SECONDS),
          ),
          limit: config.get<number>('THROTTLE_LIMIT_DEFAULT', DEFAULT_LIMIT),
        },
        {
          name: 'login',
          ttl: seconds(
            config.get<number>('THROTTLE_TTL_LOGIN', LOGIN_TTL_SECONDS),
          ),
          limit: config.get<number>('THROTTLE_LIMIT_LOGIN', LOGIN_LIMIT),
        },
        {
          name: 'forms',
          ttl: seconds(
            config.get<number>('THROTTLE_TTL_FORMS', FORMS_TTL_SECONDS),
          ),
          limit: config.get<number>('THROTTLE_LIMIT_FORMS', FORMS_LIMIT),
        },
      ],
    }),
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class ThrottlerConfigModule {}