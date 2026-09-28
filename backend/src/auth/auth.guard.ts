import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY, ROLES_KEY, type AuthUser } from './public.decorator';

export type { AuthUser };
export type JwtPayload = AuthUser;

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    // Rutas públicas con autenticación opcional: la petición entra igual, pero
    // si viene un JWT válido se adjunta a `request.user`. Es lo que permite que
    // el backoffice, al listar noticias, vea también los borradores que a un
    // visitante anónimo le llegarían filtrados.
    if (this.getMetadata<boolean>(context, IS_PUBLIC_KEY)) {
      if (token) {
        try {
          request.user = await this.jwt.verifyAsync<AuthUser>(token);
        } catch {
          // Token inválido en una ruta pública: no es un error, simplemente el
          // usuario se trata como anónimo.
        }
      }
      return true;
    }

    const requiredRoles = this.getMetadata<string[]>(context, ROLES_KEY) ?? [];
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

  async verify(token: string): Promise<AuthUser> {
    try {
      return await this.jwt.verifyAsync<AuthUser>(token);
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