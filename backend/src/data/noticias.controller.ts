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
