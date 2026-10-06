import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { MensajesService } from './mensajes.service';
import { Public } from '../auth/public.decorator';

interface ContactoBody {
  nombre?: string;
  email?: string;
  asunto?: string;
  mensaje?: string;
}

interface InscripcionBody {
  taller?: string;
  nombre?: string;
  email?: string;
  adicional?: string;
}

function todayISO(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

@Public()
@Controller('forms')
export class FormsController {
  constructor(private readonly mensajes: MensajesService) {}

  private crear(data: DeepPartialMensaje) {
    return this.mensajes.create(data);
  }

  /**
   * 3 envíos por hora desde la misma IP.
   *
   * Estos dos endpoints escriben filas en `mensajes` sin pedir autenticación,
   * así que son la vía más barata para llenar la tabla de spam. Tres por hora
   * no estorba a nadie real: quien rellena un formulario de contacto lo hace
   * una vez. Un bot que repita se encuentra con un 429 enseguida.
   *
   * La clave es por IP (el `default` de la librería) porque un formulario no
   * tiene cuenta a la que atribuir el intento.
   */
  @Post('contacto')
  @Throttle({ forms: { limit: 3, ttl: 60 * 60 * 1000 } })
  contacto(@Body() body: ContactoBody) {
    const data: DeepPartialMensaje = {
      nombre: body.nombre ?? '',
      email: body.email ?? '',
      asunto: body.asunto ?? '',
      mensaje: body.mensaje ?? null,
      tipo: 'contacto',
      fecha: todayISO(),
      leido: false,
    };
    return this.crear(data);
  }

  @Post('inscripciones')
  @Throttle({ forms: { limit: 3, ttl: 60 * 60 * 1000 } })
  inscripciones(@Body() body: InscripcionBody) {
    const data: DeepPartialMensaje = {
      nombre: body.nombre ?? '',
      email: body.email ?? '',
      asunto: body.taller ?? 'Inscripción a taller',
      mensaje: body.adicional ?? null,
      tipo: 'inscripciones',
      fecha: todayISO(),
      leido: false,
    };
    return this.crear(data);
  }
}

type DeepPartialMensaje = {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string | null;
  tipo: string;
  fecha: string;
  leido: boolean;
};