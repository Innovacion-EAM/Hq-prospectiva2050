import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { MensajesService } from './mensajes.service';
import { LIMITE_FORMS_OK } from '../auth/throttler';
import { Public } from '../auth/public.decorator';
import {
  BoletinDto,
  ContactoDto,
  InscripcionDto,
  SugerenciaDto,
} from '../common/dto';

function todayISO(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

/**
 * Respuesta común de los formularios. Antes cada handler devolvía la entidad
 * `Mensaje` creada, así que un visitante anónimo recibía el id interno y el
 * campo `leido`. Ahora solo se confirma la recepción.
 */
function recibido(): { ok: true } {
  return { ok: true };
}

/**
 * Bandeja de entrada de los formularios públicos del sitio. Todos los endpoints
 * son `@Public()` porque los visita gente sin sesión; el `ValidationPipe` global
 * es lo que impide que entren filas vacías o basura.
 *
 * Además, cada endpoint lleva `@Throttle` con el contador `forms`: 3 envíos por
 * hora desde la misma IP. Estos endpoints escriben filas en `mensajes` sin pedir
 * autenticación, así que son la vía más barata para llenar la tabla de spam.
 * Tres por hora no estorba a nadie real: quien rellena un formulario de
 * contacto lo hace una vez. Un bot que repita se encuentra con un 429 enseguida.
 * La clave es por IP (el `default` de la librería) porque un formulario no
 * tiene cuenta a la que atribuir el intento.
 */
@Public()
@Controller('forms')
export class FormsController {
  constructor(private readonly mensajes: MensajesService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('contacto')
  @Throttle({ forms: { limit: LIMITE_FORMS_OK, ttl: 60 * 60 * 1000 } })
  async contacto(@Body() body: ContactoDto) {
    await this.mensajes.create({
      nombre: body.nombre.trim(),
      email: body.email.trim().toLowerCase(),
      asunto: body.asunto?.trim() || 'Formulario de contacto',
      mensaje: body.mensaje.trim(),
      tipo: 'contacto',
      fecha: todayISO(),
      leido: false,
      estado: 'nuevo',
      // El DTO ya exigio la autorizacion: si llego aqui, el titular la dio.
      consentimiento: true,
    });
    return recibido();
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('inscripciones')
  @Throttle({ forms: { limit: LIMITE_FORMS_OK, ttl: 60 * 60 * 1000 } })
  async inscripciones(@Body() body: InscripcionDto) {
    await this.mensajes.create({
      nombre: body.nombre.trim(),
      email: body.email.trim().toLowerCase(),
      asunto: body.taller.trim(),
      mensaje: body.adicional?.trim() || null,
      tipo: 'inscripciones',
      fecha: todayISO(),
      leido: false,
      estado: 'nuevo',
      // El DTO ya exigio la autorizacion: si llego aqui, el titular la dio.
      consentimiento: true,
    });
    return recibido();
  }

  /** Newsletter del pie de página. */
  @HttpCode(HttpStatus.CREATED)
  @Post('boletin')
  @Throttle({ forms: { limit: LIMITE_FORMS_OK, ttl: 60 * 60 * 1000 } })
  async boletin(@Body() body: BoletinDto) {
    await this.mensajes.create({
      nombre: body.nombre?.trim() || 'Suscriptor del boletín',
      email: body.email.trim().toLowerCase(),
      asunto: 'Solicitud de suscripción al boletín',
      mensaje: null,
      tipo: 'boletin',
      fecha: todayISO(),
      leido: false,
      estado: 'nuevo',
      // El DTO ya exigio la autorizacion: si llego aqui, el titular la dio.
      consentimiento: true,
    });
    return recibido();
  }

  /**
   * Caja «Pregunta o recomendación» del hero.
   *
   * Es anónima, pero admite un correo opcional para quien quiera que le
   * contesten. Si no lo deja, se guarda `null`: antes se ponía
   * `anonimo@prospectiva.local`, una dirección inventada que el backoffice
   * mostraba como si fuera real y contra la que no se podía escribir nada.
   */
  @HttpCode(HttpStatus.CREATED)
  @Post('sugerencias')
  @Throttle({ forms: { limit: LIMITE_FORMS_OK, ttl: 60 * 60 * 1000 } })
  async sugerencias(@Body() body: SugerenciaDto) {
    const correo = body.email?.trim().toLowerCase() ?? '';
    await this.mensajes.create({
      nombre: body.nombre.trim(),
      email: correo || null,
      asunto: 'Pregunta o recomendación',
      mensaje: body.sugerencia.trim(),
      tipo: 'sugerencias',
      fecha: todayISO(),
      leido: false,
      estado: 'nuevo',
      // El DTO ya exigio la autorizacion: si llego aqui, el titular la dio.
      consentimiento: true,
    });
    return recibido();
  }
}