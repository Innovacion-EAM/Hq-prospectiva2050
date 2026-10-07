import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser, Public, type AuthUser, Roles } from '../auth/public.decorator';
import { NoticiasService } from './noticias.service';
import { NoticiaDto, NoticiaPatchDto } from '../common/dto';

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
   * `includeAll` solo se activa si el token lo trae un usuario del backoffice.
   * Antes este método re-verificaba el JWT por su cuenta; ahora se apoya en el
   * `AuthGuard` global, que ya dejó el payload verificado en `request.user`.
   */
  private static esBackoffice(user?: AuthUser): boolean {
    return user?.role === 'admin' || user?.role === 'editor';
  }

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
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('perPage', new DefaultValuePipe(30), ParseIntPipe) perPage: number,
    @Query('categoria') categoria?: string,
    @Query('q') q?: string,
    @CurrentUser() user?: AuthUser,
  ) {
    return this.noticias.list({
      page,
      perPage,
      categoria,
      q,
      includeAll: NoticiasController.esBackoffice(user),
    });
  }

  /**
   * Papelera. Va antes de `@Get(':slug')` a propósito: si fuera después, Nest
   * lo interpretaría como una noticia cuyo slug es "papelera".
   */
  @Roles('admin')
  @Get('papelera')
  papelera() {
    return this.noticias.findTrashed();
  }

  @Roles('admin')
  @Post(':id/restaurar')
  restaurar(@Param('id', ParseIntPipe) id: number) {
    return this.noticias.restore(id);
  }

  @Public()
  @Get(':slug')
  async detail(@Param('slug') slug: string, @CurrentUser() user?: AuthUser) {
    const noticia = NoticiasController.esBackoffice(user)
      ? await this.noticias.findBySlug(slug)
      : await this.noticias.findBySlugPublic(slug);
    if (!noticia) {
      throw new NotFoundException('Noticia no encontrada');
    }
    return noticia;
  }

  @Post()
  create(@Body() body: NoticiaDto) {
    return this.noticias.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: NoticiaPatchDto) {
    return this.noticias.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.noticias.remove(id);
  }
}
