import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Roles } from '../auth/public.decorator';
import { UploadService, fileFilter } from './upload.service';

/** La petición solo se usa para componer el origen; se declara el mínimo. */
interface UploadRequest extends Request {
  protocol: string;
  get(header: string): string | undefined;
}

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

  /**
   * Origen de la petición, tal y como lo vio el cliente.
   *
   * `protocol` y `host` llegan correctos gracias al `trust proxy` de
   * `main.ts`: si faltara, saldría `http` y la IP del contenedor de Traefik,
   * que es justo el bug que se arregló con el path relativo.
   */
  private origin(req: UploadRequest): string {
    return `${req.protocol}://${req.get('host')}`;
  }

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
      // BadRequest y no `Error`: un `Error` suelto lo convierte Nest en un
      // 500, y un archivo ausente es un 400. Antes el cliente recibía un error
      // de servidor por un fallo de su propia petición.
      throw new BadRequestException('Archivo requerido');
    }
    // La URL se guarda relativa (ver UploadService.save), así que el controlador
    // ya no necesita leer el protocolo ni el host de la petición.
    return this.uploads.save(file);
  }

  @Get()
  list(@Req() req: UploadRequest) {
    return this.uploads.list(this.origin(req));
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.uploads.remove(id);
  }
}
