import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Roles } from '../auth/public.decorator';
import { UploadService, fileFilter } from './upload.service';

export const TAMANO_MAXIMO_MB = 20;

/**
 * La galería es parte del flujo editorial: los formularios de noticias y de
 * documentos la usan para elegir la portada y el archivo adjunto, así que
 * cualquier usuario autenticado (admin o editor) puede listarla y subir.
 * Borrar sí queda reservado al administrador, junto con la gestión de usuarios.
 */
@Controller('media')
export class UploadController {
  constructor(private readonly uploads: UploadService) {}

  @Post('uploads')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: TAMANO_MAXIMO_MB * 1024 * 1024, files: 1 },
      fileFilter,
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File | undefined) {
    if (!file) {
      throw new BadRequestException('Archivo requerido');
    }
    // La URL se guarda relativa (ver UploadService.save), así que el controlador
    // ya no necesita leer el protocolo ni el host de la petición.
    return this.uploads.save(file);
  }

  @Get()
  list() {
    return this.uploads.list();
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.uploads.remove(id);
  }
}
