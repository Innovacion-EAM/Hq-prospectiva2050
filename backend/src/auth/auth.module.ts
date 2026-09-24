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
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'dev-secret'),
        signOptions: { expiresIn: '12h' },
      }),
    }),
  ],
  controllers: [AuthController, UsersController],
  providers: [AuthService, UsersService, AuthGuard],
  exports: [AuthService, UsersService, AuthGuard, JwtModule],
})
export class AuthModule {}