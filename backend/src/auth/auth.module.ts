import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret) {
          // Fallar al arrancar es la única opción segura. Con un valor por
          // defecto, un arranque manual sin la variable deja TODOS los tokens
          // firmados con una clave que está publicada en el repositorio:
          // quien la conozca puede fabricar el token de administrador que
          // quiera. Es mejor no arrancar que arrancar con la puerta abierta.
          throw new Error(
            'Falta JWT_SECRET. Genera una con: openssl rand -hex 24',
          );
        }
        return {
          secret,
          signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN', '12h') },
        };
      },
    }),
  ],
  controllers: [AuthController, UsersController],
  providers: [AuthService, UsersService, AuthGuard],
  exports: [AuthService, UsersService, AuthGuard, JwtModule],
})
export class AuthModule {}