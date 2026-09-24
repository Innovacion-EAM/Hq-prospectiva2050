import {
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

  @Post('uploads')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: UploadRequest,
  ) {
    if (!file) {
      throw new Error('Archivo requerido');
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return this.uploads.save(file, baseUrl);
  }

  @Get()
  list() {
    return this.uploads.list();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.uploads.remove(Number(id));
  }
}