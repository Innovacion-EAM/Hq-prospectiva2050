import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { Roles } from '../auth/public.decorator';
import { MensajesService } from './mensajes.service';
import { MensajePatchDto } from '../common/dto';

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
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() body: MensajePatchDto) {
    return this.mensajes.patch(id, body);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mensajes.remove(id);
  }
}
