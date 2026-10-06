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
import { Public } from '../auth/public.decorator';

/**
 * Noticias: dos superficies, dos conjuntos de rutas.
 *
 * Antes estas rutas eran una sola cosa pública que, si el llamante enviaba un
 * Bearer, se ponía a devolver también los borradores. Eso era un agujero: la
 * ruta era `@Public()`, o sea que el AuthGuard no la vigilaba, y el rol
 * `editor` pasaba el filtro. Bastaba con poner el token de un editor en la
 * barra de direcciones o en un `fetch` para leer noticias sin publicar.
 *
 * Ahora la separación es explícita:
 *
 *   - `GET /noticias` y `GET /noticias/:slug`  → públicas, solo publicadas.
 *     No miran el token en absoluto. Es lo que consume el sitio web.
 *   - `GET /noticias/panel`, `GET /noticias/panel/:slug` → con sesión. Sin
 *     `@Public()`, así que el AuthGuard las exige y devuelve borradores.
 *     Es lo que consume el backoffice.
 *
 * El detalle no es decorativo: si las rutas públicas siguieran siendo
 * "públicas que a veces filtran", cualquier futuro `@Public()` mal puesto
 * reabre el agujero. Con dos superficies, cada una dice en su firma quién la
 * puede usar.
 */
@Controller('noticias')
export class NoticiasController {
  constructor(private readonly noticias: NoticiasService) {}

  /**
   * Listado para el panel: incluye borradores.
   *
   * Va declarado ANTES que `@Get(':slug')` a propósito. Nest registra las
   * rutas en el orden en que se declaran y prueba la primera que encaja, así
   * que si `:slug` estuviera primero se tragaría la palabra "panel" y
   * devolvería un 404 al backoffice. Por eso estas dos rutas viven aquí
   * arriba y no en un controller aparte, donde el orden dependería de cómo se
   * registraran los controllers.
   *
   * Sin `@Public()`: el AuthGuard exige sesión. Es lo que hace que un editor
   * vea los borradores y un visitante anónimo no.
   */
  @Get('panel')
  listPanel(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('categoria') categoria?: string,
    @Query('q') q?: string,
  ) {
    return this.noticias.list({
      page: Number(page),
      perPage: Number(perPage),
      categoria,
      q,
      includeAll: true,
    });
  }

  /** Detalle para el panel: cualquier noticia, publicada o no. */
  @Get('panel/:slug')
  async detailPanel(@Param('slug') slug: string) {
    const noticia = await this.noticias.findBySlug(slug);
    if (!noticia) {
      throw new NotFoundException('Noticia no encontrada');
    }
    return noticia;
  }

  /** Listado público: únicamente noticias publicadas y ya visibles. */
  @Public()
  @Get()
  list(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('categoria') categoria?: string,
    @Query('q') q?: string,
  ) {
    return this.noticias.list({
      page: Number(page),
      perPage: Number(perPage),
      categoria,
      q,
      includeAll: false,
    });
  }

  /** Detalle público: solo si la noticia está publicada. */
  @Public()
  @Get(':slug')
  async detail(@Param('slug') slug: string) {
    const noticia = await this.noticias.findBySlugPublic(slug);
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