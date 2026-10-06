import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { DeepPartial } from 'typeorm';
import { Public, Roles } from '../auth/public.decorator';
import { RepositorioItem } from '../entities/repositorio-item.entity';
import { RepositorioImportService } from './repositorio-import.service';
import { RepositorioService, type RepositorioQuery } from './repositorio.service';

/**
 * Repositorio de información: dos superficies, como noticias.
 *
 *   - Públicas (`facetas`, `estadisticas`, `GET /`, `GET /:id`): no exigen
 *     token y solo devuelven lo publicado. Es de lo que se alimenta el sitio
 *     del repositorio (/repo) y las mini-gráficas de la portada.
 *   - Panel (`panel`, `panel/:id`) y escritura: exigen sesión y rol
 *     admin/editor, e incluyen borradores.
 *
 * El orden de declaración importa: las rutas estáticas (`panel`, `facetas`,
 * `estadisticas`) viven ANTES de `@Get(':id')`, o Nest las atraparía como si
 * fueran un id y responderían 404.
 */
@Roles('admin', 'editor')
@Controller('repositorio')
export class RepositorioController {
  constructor(
    private readonly items: RepositorioService,
    private readonly importador: RepositorioImportService,
  ) {}

  /** Listado del panel: incluye borradores. Exige sesión. */
  @Get('panel')
  listPanel(@Query() query: RepositorioQuery) {
    return this.items.list({ ...query, includeAll: true });
  }

  /** Detalle del panel: cualquier ítem, publicado o no. */
  @Get('panel/:id')
  async detailPanel(@Param('id') id: string) {
    const item = await this.items.findOne(Number(id));
    if (!item) {
      throw new NotFoundException('Documento no encontrado');
    }
    return item;
  }

  /** Valores de los filtros con su conteo (solo publicado). */
  @Public()
  @Get('facetas')
  facetas() {
    return this.items.facetas();
  }

  /** Agregados para las gráficas (solo publicado). */
  @Public()
  @Get('estadisticas')
  estadisticas() {
    return this.items.estadisticas();
  }

  /** Catálogo público. */
  @Public()
  @Get()
  list(@Query() query: RepositorioQuery) {
    return this.items.list({ ...query, includeAll: false });
  }

  /** Ficha pública: solo publicado. */
  @Public()
  @Get(':id')
  async detail(@Param('id') id: string) {
    const item = await this.items.findPublished(Number(id));
    if (!item) {
      throw new NotFoundException('Documento no encontrado');
    }
    return item;
  }

  /** Importación masiva desde CSV (upsert por `codigo`). */
  @Post('importar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  importar(@UploadedFile() file: Express.Multer.File | undefined) {
    if (!file) {
      throw new BadRequestException('Archivo requerido');
    }
    return this.importador.importar(file.buffer);
  }

  /** Publica todo lo que esté en borrador/programado. */
  @Post('publicar-todos')
  publicarTodos() {
    return this.items.publicarTodos();
  }

  @Post()
  create(@Body() data: DeepPartial<RepositorioItem>) {
    return this.items.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: DeepPartial<RepositorioItem>) {
    return this.items.update(Number(id), data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.items.remove(Number(id));
  }
}