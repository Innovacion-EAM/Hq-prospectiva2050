import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ConvocatoriasService } from './convocatorias.service';
import { Public, Roles } from '../auth/public.decorator';
import { ConvocatoriaDto, ConvocatoriaPatchDto } from '../common/dto';

@Controller('convocatorias')
export class ConvocatoriasController {
  constructor(private readonly convocatorias: ConvocatoriasService) {}

  @Public()
  @Get()
  list() {
    return this.convocatorias.listActiveFirst();
  }

  @Roles('admin')
  @Get('papelera')
  papelera() {
    return this.convocatorias.findTrashed();
  }

  @Roles('admin')
  @Post(':id/restaurar')
  restaurar(@Param('id', ParseIntPipe) id: number) {
    return this.convocatorias.restore(id);
  }

  @Post()
  create(@Body() data: ConvocatoriaDto) {
    return this.convocatorias.create(data);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: ConvocatoriaPatchDto) {
    return this.convocatorias.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.convocatorias.remove(id);
  }
}
