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
    const isPublic = this.getMetadata<boolean>(context, IS_PUBLIC_KEY);
    // Las rutas públicas son ANÓNIMAS de verdad: no resuelven el token ni
    // adjuntan `request.user`. Si una ruta pública distinguiera visitantes
    // según trajeran token, se reintroduciría el agujero de las noticias (el
    // comentario de `NoticiasController` lo cuenta): bastaba con poner el
    // token de un editor en una ruta `@Public()` y el listado devolvía también
    // los borradores.
    if (isPublic) {
      return true;
    }

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