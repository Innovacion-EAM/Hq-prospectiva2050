import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { MensajesService } from './mensajes.service';

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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mensajes.remove(Number(id));
  }
}