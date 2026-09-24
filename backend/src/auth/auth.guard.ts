import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY, ROLES_KEY } from './public.decorator';

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.getMetadata<boolean>(context, IS_PUBLIC_KEY);
    if (isPublic) return true;

    const requiredRoles = this.getMetadata<string[]>(context, ROLES_KEY) ?? [];
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('No autenticado');
    }
    const payload = await this.verify(token);
    request.user = payload;

    if (requiredRoles.length > 0 && !requiredRoles.includes(payload.role)) {
      throw new ForbiddenException('No tienes permisos para esta operación');
    }
    return true;
  }

  async verify(token: string): Promise<JwtPayload> {
    try {
      return await this.jwt.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  private extractToken(request: {
    headers: Record<string, string | string[] | undefined>;
  }): string | null {
    const header = request.headers['authorization'];
    if (typeof header !== 'string' || !header.startsWith('Bearer ')) {
      return null;
    }
    return header.slice(7);
  }

  private getMetadata<T>(context: ExecutionContext, key: string): T | undefined {
    return (
      Reflect.getMetadata(key, context.getHandler()) ??
      Reflect.getMetadata(key, context.getClass())
    );
  }
}