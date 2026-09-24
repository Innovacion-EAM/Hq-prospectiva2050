import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { DeepPartial } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Noticia } from '../entities/noticia.entity';
import { NoticiasService } from './noticias.service';
import { Public } from '../auth/public.decorator';
import type { JwtPayload } from '../auth/auth.guard';

@Controller('noticias')
export class NoticiasController {
  constructor(
    private readonly noticias: NoticiasService,
    private readonly jwt: JwtService,
  ) {}

  @Public()
  @Get()
  list(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('categoria') categoria?: string,
    @Query('q') q?: string,
    @Headers('authorization') authorization?: string,
  ) {
    return this.noticias.list({
      page: Number(page),
      perPage: Number(perPage),
      categoria,
      q,
      includeAll: this.isAdmin(authorization),
    });
  }

  @Public()
  @Get(':slug')
  async detail(
    @Param('slug') slug: string,
    @Headers('authorization') authorization?: string,
  ) {
    const noticia = this.isAdmin(authorization)
      ? await this.noticias.findBySlug(slug)
      : await this.noticias.findBySlugPublic(slug);
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

  private isAdmin(authorization?: string): boolean {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return false;
    }
    try {
      const payload = this.jwt.verify<JwtPayload>(authorization.slice(7));
      return ['admin', 'editor'].includes(payload.role);
    } catch {
      return false;
    }
  }
}