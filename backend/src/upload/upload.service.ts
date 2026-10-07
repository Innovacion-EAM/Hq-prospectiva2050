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

/**
 * Lista blanca por tipo MIME real. La extensión del archivo **nunca** decide
 * el tipo: se decide exclusivamente por el MIME declarado en el multipart, y
 * la extensión se la pone el servidor desde un mapa fijo. Así nadie puede
 * subir un `x.html` declarando `Content-Type: image/png` y servirse después
 * como HTML desde el directorio público de /api/uploads.
 *
 * SVG se excluye a propósito: es XML que puede llevar <script> y al servirse
 * desde el mismo origen del API es XSS almacenado.
 */
export const MIME_PERMITIDOS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
};

/**
 * Prefijo con el que se guarda la URL en la base de datos, **sin el host**.
 *
 * Es la contraparte de `app.setup.ts`, que sirve los archivos en `/api/uploads`:
 * la fila guarda `/uploads/<archivo>` y cada cliente la resuelve contra su
 * `API_BASE` añadiendo el `/api` que su base ya no trae. Ver `resolveUrl()` en
 * frontend/src/lib/api.ts.
 */
export const RUTA_UPLOADS = '/uploads/';

export const EXTENSION_ACEPTADA: Record<string, string[]> = {
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
  '.webp': ['image/webp'],
  '.gif': ['image/gif'],
  '.pdf': ['application/pdf'],
  '.doc': ['application/msword'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  '.xls': ['application/vnd.ms-excel'],
  '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  '.ppt': ['application/vnd.ms-powerpoint'],
  '.pptx': ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
};

export const MENSAJE_TIPO = [
  'Tipo de archivo no permitido.',
  'Se aceptan imágenes (JPG, PNG, WEBP, GIF) y documentos (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX).',
].join(' ');

/**
 * Filtro de multer: rechaza antes de leer el archivo entero a memoria. Al
 * menos una de las dos señales (MIME o extensión) tiene que estar en la lista,
 * y la extensión nunca se usa para decidir el tipo final.
 */
export function fileFilter(
  _req: unknown,
  file: { mimetype?: string; originalname?: string },
  cb: (error: Error | null, acceptFile: boolean) => void,
): void {
  const mime = (file.mimetype ?? '').toLowerCase();
  const ext = path.extname(file.originalname ?? '').toLowerCase();
  const mimeOk = Object.hasOwn(MIME_PERMITIDOS, mime);
  const extOk = (EXTENSION_ACEPTADA[ext] ?? []).includes(mime);
  if (mimeOk && extOk) {
    cb(null, true);
    return;
  }
  cb(new BadRequestException(MENSAJE_TIPO), false);
}

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

  /** Segunda verificación, por si el archivo llegó desde otro camino. */
  extensionFor(mime: string, originalName: string): string {
    const mimeLower = mime.toLowerCase();
    const ext = MIME_PERMITIDOS[mimeLower];
    const original = path.extname(originalName ?? '').toLowerCase();
    if (!ext || !(EXTENSION_ACEPTADA[original] ?? []).includes(mimeLower)) {
      throw new BadRequestException(MENSAJE_TIPO);
    }
    return ext;
  }

  /**
   * Guarda el archivo y devuelve la fila de `media` con la URL **relativa**.
   *
   * Antes se armaba aquí `${req.protocol}://${req.get('host')}/api/uploads/...`,
   * y eso ataba cada imagen al host por el que se había subido: cambiar de
   * dominio, pasar de http a https o montar el sitio en otro servidor obligaba a
   * reescribir fila por fila. Guardando `/uploads/<archivo>` la fila es
   * portable y es el cliente —frontend y panel— quien la resuelve contra su
   * `API_BASE`, que es el host con el que ese cliente sí se comunica.
   *
   * Las filas que ya tenían la URL absoluta se reconvierten con la migración
   * `0006-privacidad-y-urls-relativas.sql`.
   */
  async save(file: Express.Multer.File): Promise<Media> {
    const mime = file.mimetype.toLowerCase();
    const ext = this.extensionFor(mime, file.originalname);
    const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
    fs.writeFileSync(this.diskPath(filename), file.buffer);

    const entity = this.repo.create({
      filename,
      url: `${RUTA_UPLOADS}${filename}`,
      mime,
      size: file.size,
    });
    const saved = await this.repo.save(entity);
    this.logger.log(`Guardado archivo ${filename} (${file.size} bytes)`);
    return this.absoluteUrl(saved, '');
  }

    // Alias para mantener compatibilidad
  toDto(media: Media, origin = ''): Media {
    return this.absoluteUrl(media, origin);
  }

  findAll(origin = ''): Promise<Media[]> {
    return this.repo
      .find({ order: { createdAt: 'DESC' } })
      .then((items) => items.map((item) => this.absoluteUrl(item, origin)));
  }

  list(origin = ''): Promise<Media[]> {
    return this.repo
      .find({ order: { createdAt: 'DESC' } })
      .then((items) => items.map((item) => this.absoluteUrl(item, origin)));
  }

  findAllWithoutOrigin(): Promise<Media[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  /**
   * Convierte una fila de `media` en lo que ve el panel, con la URL ya
   * absoluta respecto al host de la petición.
   *
   * Sin esto, un `<img src="/api/uploads/x.png">` en el panel apuntaría al
   * origen del panel (`/admin`) y no a la API. Como las dos cosas están bajo
   * el mismo dominio en producción, basta con el origen de la petición.
   */
  absoluteUrl(media: Media, origin = ''): Media {
    return {
      ...media,
      url: media.url.startsWith('/') ? `${origin}${media.url}` : media.url,
    };
  }

  listAll(origin = ''): Promise<Media[]> {
    return this.repo
      .find({ order: { createdAt: 'DESC' } })
      .then((items) => items.map((item) => this.absoluteUrl(item, origin)));
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
