import { NotFoundException, ValidationPipe } from '@nestjs/common';
import type { ClassConstructor } from 'class-transformer';
import {
  DimensionDto,
  DimensionPatchDto,
  DocCategoriaDto,
  DocCategoriaPatchDto,
  MunicipioDto,
  MunicipioPatchDto,
  PaginaProyectoDto,
  PaginaProyectoPatchDto,
  StatDto,
  StatPatchDto,
  TallerDto,
  TallerPatchDto,
} from './dto';

export type AnyDto = ClassConstructor<unknown>;

/**
 * Cada colección de configuración tiene su propio DTO porque los campos varian
 * (una estadística no es un taller). El `ValidationPipe` global necesita la
 * clase concreta, y aquí depende del parámetro `:collection` de la ruta, así
 * que se resuelve en runtime.
 */
export const DTO_POR_COLECCION: Record<string, { create: AnyDto; patch: AnyDto }> = {
  stats: { create: StatDto, patch: StatPatchDto },
  municipios: { create: MunicipioDto, patch: MunicipioPatchDto },
  talleres: { create: TallerDto, patch: TallerPatchDto },
  'doc-categorias': { create: DocCategoriaDto, patch: DocCategoriaPatchDto },
  'proyecto-paginas': { create: PaginaProyectoDto, patch: PaginaProyectoPatchDto },
  dimensiones: { create: DimensionDto, patch: DimensionPatchDto },
};

export function dtoDeColeccion(collection: string, kind: 'create' | 'patch'): AnyDto {
  const entry = DTO_POR_COLECCION[collection];
  if (!entry) {
    throw new NotFoundException(`Colección de configuración "${collection}" no existe`);
  }
  return entry[kind];
}

const validator = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: { enableImplicitConversion: false },
});

/**
 * Valida y sanea el cuerpo de `/api/config/:collection` contra el DTO de esa
 * colección, y devuelve un objeto nuevo con solo los campos declarados.
 *
 * Se llama desde el controlador en vez de como `@Body(pipe)`, porque un pipe no
 * tiene acceso a `request.params`: la colección solo se conoce en runtime y por
 * eso no puede estar en la firma del método.
 *
 * @throws NotFoundException si la colección no existe
 * @throws BadRequestException con el detalle de class-validator si el cuerpo falla
 */
export async function validarBodyDeColeccion(
  collection: string,
  kind: 'create' | 'patch',
  body: unknown,
): Promise<Record<string, unknown>> {
  const metatype = dtoDeColeccion(collection, kind);
  // `ValidationPipe.transform` es asíncrono: hay que awaited, si no el
  // "resultado" sería una Promise y se asignaría tal cual a la entidad.
  const limpio = await validator.transform(body, { type: 'body', metatype, data: undefined });
  return limpio as Record<string, unknown>;
}

