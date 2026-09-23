import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import type { DeepPartial } from 'typeorm';
import { Documento } from '../entities/documento.entity';
import { DocumentosService } from './documentos.service';

@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentos: DocumentosService) {}

  @Get()
  async list(@Query('tipo') tipo?: string, @Query('delimitacion') delimitacion?: string) {
    const data = await this.documentos.findFiltered(tipo, delimitacion);
    return { data };
  }

  @Post()
  create(@Body() data: DeepPartial<Documento>) {
    return this.documentos.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: DeepPartial<Documento>) {
    return this.documentos.update(Number(id), data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentos.remove(Number(id));
  }
}