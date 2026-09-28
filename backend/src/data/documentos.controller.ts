import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { DocumentosService } from './documentos.service';
import { Public, Roles } from '../auth/public.decorator';
import { DocumentoDto, DocumentoPatchDto } from '../common/dto';

@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentos: DocumentosService) {}

  @Public()
  @Get()
  async list(@Query('tipo') tipo?: string, @Query('delimitacion') delimitacion?: string) {
    const data = await this.documentos.findFiltered(tipo, delimitacion);
    return { data };
  }

  @Roles('admin')
  @Get('papelera')
  papelera() {
    return this.documentos.findTrashed();
  }

  @Roles('admin')
  @Post(':id/restaurar')
  restaurar(@Param('id', ParseIntPipe) id: number) {
    return this.documentos.restore(id);
  }

  @Post()
  create(@Body() data: DocumentoDto) {
    return this.documentos.create(data);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: DocumentoPatchDto) {
    return this.documentos.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.documentos.remove(id);
  }
}
