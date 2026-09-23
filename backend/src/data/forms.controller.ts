import { Body, Controller, Post } from '@nestjs/common';
import { MensajesService } from './mensajes.service';

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

@Controller('forms')
export class FormsController {
  constructor(private readonly mensajes: MensajesService) {}

  private crear(data: DeepPartialMensaje) {
    return this.mensajes.create(data);
  }

  @Post('contacto')
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