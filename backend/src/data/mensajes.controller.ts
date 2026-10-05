import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { Roles } from '../auth/public.decorator';
import { MensajesService } from './mensajes.service';

// Lectura y marcado de leídos: cualquier usuario con sesión.
// El borrado es exclusivo de admin (la guía §11 lo documenta así y el
// backoffice ya oculta el botón a los editores).
@Controller('mensajes')
export class MensajesController {
  constructor(private readonly mensajes: MensajesService) {}

  @Get()
  list() {
    return this.mensajes.listNewestFirst();
  }

  @Patch(':id')
  setLeido(@Param('id') id: string, @Body() body: { leido?: boolean }) {
    return this.mensajes.setLeido(Number(id), Boolean(body.leido));
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mensajes.remove(Number(id));
  }
}