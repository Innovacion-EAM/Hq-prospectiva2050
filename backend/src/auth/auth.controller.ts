import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LIMITE_LOGIN_OK } from './throttler';
import { Public } from './public.decorator';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { LoginDto } from '../common/dto';
import type { JwtPayload } from './auth.guard';

interface AuthedRequest extends Request {
  user?: JwtPayload;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
  ) {}

  /**
 * Login: 5 intentos cada 15 minutos.
 *
 * El contador `login` tiene que existir también en `throttler.ts`, porque el
 * guard solo recorre los contadores declarados ahí. Este decorador pone sus
 * números y, sobre todo, la clave de conteo; los del módulo son el suelo por si
 * alguien quita el decorador.
 *
 * La clave NO es solo la IP, sino el correo normalizado. Es la diferencia
 * entre frenar el ataque y solo molestarlo:
   *
   *   - por IP, un atacante con una máquina reintenta 5 veces, espera 15
   *     minutos y vuelve. Son unas 480 intentos al día contra una cuenta, y
   *     si reparte los intentos entre muchas IP, ilimitados.
   *   - por cuenta, el tope es el mismo venga de donde venga. Probar 5
   *     millones de correos distintos sigue sin abrir ninguno, porque abrir
   *     una cuesta 5 intentos y después 15 minutos de espera.
   *
   * Se combinan correo e IP (`${throttlerName}:${tracker}:${email}`) porque
   * una clave solo por correo permite un bloqueo denegación de servicio
   * gratis: basta con que el atacante mande 5 intentos usando el correo de la
   * víctima para dejarle el panel bloqueado 15 minutos. Al meter también la
   * IP, quien se bloquea es él mismo y no molesta a nadie más.
   *
   * `email ?? ''` es deliberado: un intento sin correo tiene que contar para
   * algún lado, y no puede saltarse el límite por no traer el campo.
   */
  @Public()
  @Throttle({
    login: {
      limit: LIMITE_LOGIN_OK,
      ttl: 15 * 60 * 1000,
      generateKey: (context, tracker, throttlerName) => {
        const body = context.switchToHttp().getRequest().body as
          | { email?: string }
          | undefined;
        const email = (body?.email ?? '').toLowerCase().trim();
        return `${throttlerName}:${tracker}:${email}`;
      },
    },
  })
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.auth.login(body.email, body.password);
  }

  /**
   * Cambia la contraseña de quien está conectado.
   *
   * Sin `@Public()`, así que el AuthGuard exige un token válido y `request.user`
   * lleva el `sub` de la cuenta. El id sale del token, nunca del cuerpo de la
   * petición: si viniera del body, cualquiera podría cambiarle la contraseña
   * al usuario que quisiera poniendo su id ahí.
   *
   * El servicio además pide la contraseña actual, así que tener el token no
   * basta para cambiar nada.
   */
  @Post('password')
  async changePassword(
    @Req() req: AuthedRequest,
    @Body() body: { currentPassword?: string; newPassword?: string },
  ) {
    // El guard pone `user` cuando pasa, así que aquí solo falta narrowear el
    // tipo. Se lanza en vez de asumir con `!`: si algún día se llegara a esta
    // ruta sin token, es mejor un 401 explícito que un error de TypeScript
    // silenciado en tiempo de ejecución.
    if (!req.user) {
      throw new UnauthorizedException('No autenticado');
    }
    return this.users.changePassword(
      req.user.sub,
      body.currentPassword ?? '',
      body.newPassword ?? '',
    );
  }
}
