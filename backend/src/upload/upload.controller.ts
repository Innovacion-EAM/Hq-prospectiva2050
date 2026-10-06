import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Roles } from '../auth/public.decorator';
import { UploadService } from './upload.service';

interface UploadRequest extends Request {
  protocol: string;
  get(header: string): string | undefined;
}

@Roles('admin')
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
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      // BadRequest y no `Error`: un `Error` suelto lo convierte Nest en un
      // 500, y un archivo ausente es un 400. Antes el cliente recibía un error
      // de servidor por un fallo de su propia petición.
      throw new BadRequestException('Archivo requerido');
    }
    return this.uploads.save(file);
  }

  @Get()
  list(@Req() req: UploadRequest) {
    return this.uploads.list(this.origin(req));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.uploads.remove(Number(id));
  }
}