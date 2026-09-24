import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { JwtPayload } from './auth.guard';
import { UsersService } from './users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.users.findOneByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: await this.jwt.signAsync(payload),
      user: this.users.toDto(user),
    };
  }
}