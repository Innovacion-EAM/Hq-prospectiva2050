import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import type { DeepPartial } from 'typeorm';
import { Convocatoria } from '../entities/convocatoria.entity';
import { ConvocatoriasService } from './convocatorias.service';

@Controller('convocatorias')
export class ConvocatoriasController {
  constructor(private readonly convocatorias: ConvocatoriasService) {}

  @Get()
  list() {
    return this.convocatorias.listActiveFirst();
  }

  @Post()
  create(@Body() data: DeepPartial<Convocatoria>) {
    return this.convocatorias.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: DeepPartial<Convocatoria>) {
    return this.convocatorias.update(Number(id), data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.convocatorias.remove(Number(id));
  }
}