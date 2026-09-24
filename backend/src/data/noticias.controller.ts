import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { DeepPartial } from 'typeorm';
import { Noticia } from '../entities/noticia.entity';
import { NoticiasService } from './noticias.service';

@Controller('noticias')
export class NoticiasController {
  constructor(private readonly noticias: NoticiasService) {}

  @Get()
  list(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('categoria') categoria?: string,
    @Query('q') q?: string,
  ) {
    return this.noticias.list({ page: Number(page), perPage: Number(perPage), categoria, q });
  }

  @Get(':slug')
  async detail(@Param('slug') slug: string) {
    const noticia = await this.noticias.findBySlug(slug);
    if (!noticia) {
      throw new NotFoundException('Noticia no encontrada');
    }
    return noticia;
  }

  @Post()
  create(@Body() data: DeepPartial<Noticia>) {
    return this.noticias.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: DeepPartial<Noticia>) {
    return this.noticias.update(Number(id), data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.noticias.remove(Number(id));
  }
}