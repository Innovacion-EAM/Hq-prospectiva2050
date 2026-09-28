import {
  ArgumentsHost,
  Catch,
  HttpStatus,
  type ExceptionFilter,
} from '@nestjs/common';
import { MulterError } from 'multer';
import { TAMANO_MAXIMO_MB } from '../upload/upload.controller';

/**
 * Los errores de multer no son excepciones de Nest, así que sin este filtro un
 * archivo demasiado grande o de un tipo no permitido salía como 500 en vez de
 * 400, y el backoffice no podía explicarle al usuario qué pasó.
 */
@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(error: MulterError, host: ArgumentsHost): void {
    let message = `No se pudo procesar el archivo: ${error.message}`;

    if (error.code === 'LIMIT_FILE_SIZE') {
      message = `El archivo supera el límite de ${TAMANO_MAXIMO_MB} MB`;
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'El archivo debe enviarse en el campo "file"';
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      message = 'Solo se puede subir un archivo a la vez';
    }

    host.switchToHttp().getResponse().status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message,
      error: 'Bad Request',
    });
  }
}
