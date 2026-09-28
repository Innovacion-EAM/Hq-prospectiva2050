import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ConfigService } from './config.service';
import { Roles } from '../auth/public.decorator';
import { validarBodyDeColeccion } from '../common/config-collection.pipe';
import { SiteConfigPatchDto } from '../common/dto';

/**
 * Los ajustes del sitio (nombre, titular del hero, contacto, redes) gobiernan
 * la cabecera y el pie de página de todas las páginas, así que quedan
 * reservados al administrador. El contenido editorial —noticias, documentos,
 * dimensiones, páginas del proyecto, convocatorias— lo puede editar cualquier
 * usuario autenticado, incluido el rol `editor`.
 */
@Controller('config')
export class ConfigController {
  constructor(private readonly config: ConfigService) {}

  @Get('site')
  site() {
    return this.config.getSite();
  }

  @Roles('admin')
  @Put('site')
  setSite(@Body() data: SiteConfigPatchDto) {
    return this.config.setSite(data);
  }

  @Get(':collection')
  list(@Param('collection') collection: string) {
    return this.config.list(collection);
  }

  @Post(':collection')
  async create(
    @Param('collection') collection: string,
    // Se declara como `Record<string, unknown>` para que el `ValidationPipe`
    // global lo salte (su metatipo es Object) y la validación real la haga
    // `validarBodyDeColeccion`, que sí sabe qué DTO le toca.
    @Body() body: Record<string, unknown>,
  ) {
    const data = await validarBodyDeColeccion(collection, 'create', body);
    return this.config.create(collection, data);
  }

  @Patch(':collection/:id')
  async update(
    @Param('collection') collection: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, unknown>,
  ) {
    const data = await validarBodyDeColeccion(collection, 'patch', body);
    return this.config.update(collection, id, data);
  }

  @Delete(':collection/:id')
  remove(@Param('collection') collection: string, @Param('id', ParseIntPipe) id: number) {
    return this.config.remove(collection, id);
  }

  /**
   * Papelera y restauración. Solo el administrador: sacar contenido de la papelera
   * es una decisión de gobernanza del contenido, no una tarea editorial.
   * Las rutas van antes de `:collection` para que "papelera" no se interprete
   * como el nombre de una colección.
   */
  @Roles('admin')
  @Get('papelera/:collection')
  papelera(@Param('collection') collection: string) {
    return this.config.listTrashed(collection);
  }

  @Roles('admin')
  @Post('papelera/:collection/:id/restaurar')
  restaurar(
    @Param('collection') collection: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.config.restore(collection, id);
  }
}
