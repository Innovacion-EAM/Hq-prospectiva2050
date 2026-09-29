import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { MensajesService } from './mensajes.service';
import { MensajePatchDto } from '../common/dto';

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

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mensajes.remove(id);
  }
}
