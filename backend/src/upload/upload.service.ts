import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { Media } from '../entities/media.entity';

const ALLOWED: Record<string, string[]> = {
  images: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
};

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
};

@Injectable()
export class UploadService implements OnModuleInit {
  private readonly logger = new Logger(UploadService.name);
  private readonly dir = path.resolve(process.env.UPLOAD_DIR ?? 'uploads');

  constructor(
    @InjectRepository(Media)
    private readonly repo: Repository<Media>,
  ) {}

  onModuleInit(): void {
    fs.mkdirSync(this.dir, { recursive: true });
    this.logger.log(`Directorio de uploads: ${this.dir}`);
  }

  diskPath(filename: string): string {
    return path.join(this.dir, filename);
  }

  /**
   * Guarda un archivo y devuelve su fila.
   *
   * El campo `url` guarda SOLO el path (`/api/uploads/nombre.png`), sin
   * dominio. Antes se guardaba la URL absoluta del momento de la subida, y
   * eso era una bomba de relojería: el día que la web pase de
   * `http://3.231.164.130` a `https://dominio.com`, todas las imágenes ya
   * subidas seguirían apuntando a la IP, en http, que a la vez ya no es el
   * sitio. Y el arreglo obligaba a editar fila por fila en la base de datos.
   *
   * Guardando el path, el mismo registro sirve para la IP, para el dominio y
   * para http o https. El que compone la URL es quien la muestra, y para eso
   * está `absoluteUrl()`.
   */
  async save(file: Express.Multer.File): Promise<Media> {
    const mime = file.mimetype;
    const ext = EXTENSIONS[mime] ?? path.extname(file.originalname ?? '').toLowerCase();
    const allowed =
      ALLOWED.images.includes(mime) ||
      ALLOWED.documents.includes(mime) ||
      Boolean(ext && mime.startsWith('image/'));
    if (!allowed || !ext) {
      throw new BadRequestException(
        'Tipo de archivo no permitido (imágenes: JPG, PNG, WEBP, GIF, SVG; documentos: PDF, DOC, XLS, PPT)',
      );
    }
    const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
    fs.writeFileSync(this.diskPath(filename), file.buffer);

    const entity = this.repo.create({
      filename,
      url: this.publicPath(filename),
      mime,
      size: file.size,
    });
    const saved = await this.repo.save(entity);
    this.logger.log(`Guardado archivo ${filename} (${file.size} bytes)`);
    return this.toDto(saved);
  }

  /** Path público de un fichero, tal y como lo consume el navegador. */
  private publicPath(filename: string): string {
    return `/api/uploads/${filename}`;
  }

  /**
   * Convierte una fila de `media` en lo que ve el panel, con la URL ya
   * absoluta respecto al host de la petición.
   *
   * Sin esto, un `<img src="/api/uploads/x.png">` en el panel apuntaría al
   * origen del panel (`/admin`) y no a la API. Como las dos cosas están bajo
   * el mismo dominio en producción, basta con el origen de la petición.
   */
  absoluteUrl(media: Media, origin: string): Media {
    return {
      ...media,
      url: media.url.startsWith('/') ? `${origin}${media.url}` : media.url,
    };
  }

  async list(origin: string): Promise<Media[]> {
    const items = await this.repo.find({ order: { createdAt: 'DESC' } });
    return items.map((item) => this.absoluteUrl(item, origin));
  }

  async list(): Promise<Media[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async remove(id: number): Promise<void> {
    const media = await this.repo.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException('Archivo no encontrado');
    }
    try {
      fs.unlinkSync(this.diskPath(media.filename));
    } catch {
      // el archivo tal vez ya no existe en disco; se procede igual
    }
    await this.repo.remove(media);
  }
}