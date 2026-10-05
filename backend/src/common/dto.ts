import { PartialType } from "@nestjs/mapped-types";
import { Transform, Type } from "class-transformer";
import {
  ArrayMaxSize,
  Equals,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";

export const TIPOS_DOCUMENTO = [
  'proyecto',
  'informes',
  'memorias',
  'boletines',
  'presentaciones',
  'publicaciones',
] as const;

export const FORMATOS_DOCUMENTO = ['PDF', 'DOCX', 'XLSX', 'PPTX', 'OTRO'] as const;

export const STATUS_TALLER = ['Próximo', 'Abierto', 'Realizado', 'Suspendido'] as const;

export const ROLES = ['admin', 'editor'] as const;

/** Convierte '' y null en undefined para que @IsOptional los trate como ausentes. */
export const VacioOpcional = () =>
  Transform(({ value }) => (value === '' || value === null ? undefined : value));

/**
 * Recorta los espacios de los bordes antes de validar.
 *
 * Sin esto, pegar un correo con un espacio al final —cosa que pasa siempre que
 * se copia de otro correo o de un formulario del navegador— lo hace fallar
 * `@IsEmail`, que es estricto. Los controladores ya guardaban el valor
 * recortado, pero la validación ocurre **antes** que ellos, así que la petición
 * moría con un 400 de «Escribe un correo válido» aunque la dirección fuera
 * buena. Se aplica en la entrada, no en la salida, para que lo que se valida y lo
 * que se guarda sean la misma cosa.
 */
const Recortado = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

const urlOpcional = () =>
  IsUrl(
    { require_protocol: true, protocols: ['http', 'https'] },
    { message: 'Debe ser una URL http(s) válida' },
  );

/**
 * Autorización expresa del titular para el tratamiento de sus datos personales
 * (Ley 1581 de 2012, artículos 4 y 11).
 *
 * No es opcional a propósito: los cuatro formularios públicos del sitio piden
 * nombre y correo, así que sin esta casilla marcada no se puede enviar nada. Se
 * valida en el servidor y no solo en el navegador, porque una casilla que solo
 * vive en el cliente se puede saltarse con una petición hecha a mano, y entonces
 * el "consentimiento" no sería evidencia de nada.
 *
 * El mensaje dice lo que falta —autorizar— en vez de repetir el nombre técnico
 * del campo, que es lo que vería quien recibe el 400. Se usa `@Equals(true)` y no
 * un `@IsBoolean()` + `@IsIn([true])` porque con los dos juntos, omitir el campo
 * devolvía los dos mensajes a la vez y la respuesta era un ruido.
 */
const Autorizado = () =>
  Equals(true, {
    message:
      'Debes autorizar el tratamiento de tus datos personales para enviar el formulario. Revisa el Aviso de Privacidad.',
  });

export class LoginDto {
  @IsEmail({}, { message: 'El correo no es válido' })
  @MaxLength(180)
  email!: string;

  @IsString()
  @MinLength(1, { message: 'La contraseña es obligatoria' })
  @MaxLength(200)
  password!: string;
}

export class CreateUserDto {
  @IsEmail({}, { message: 'El correo no es válido' })
  @MaxLength(180)
  email!: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(200)
  password!: string;

  @IsOptional()
  @IsIn(ROLES, { message: 'El rol debe ser admin o editor' })
  role?: (typeof ROLES)[number];
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'El correo no es válido' })
  @MaxLength(180)
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(200)
  password?: string;

  @IsOptional()
  @IsIn(ROLES, { message: 'El rol debe ser admin o editor' })
  role?: (typeof ROLES)[number];
}

export class ContactoDto {
  @IsString()
  @MinLength(2, { message: 'Escribe tu nombre' })
  @MaxLength(120)
  nombre!: string;

  @Recortado()
  @IsEmail({}, { message: 'Escribe un correo válido' })
  @MaxLength(180)
  email!: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(200)
  asunto?: string;

  @IsString()
  @MinLength(5, { message: 'Escribe tu mensaje' })
  @MaxLength(4000)
  mensaje!: string;

  @Autorizado()
  consentimiento!: boolean;
}

export class InscripcionDto {
  @IsString()
  @MinLength(1, { message: 'Selecciona un taller' })
  @MaxLength(200)
  taller!: string;

  @IsString()
  @MinLength(2, { message: 'Escribe tu nombre' })
  @MaxLength(120)
  nombre!: string;

  @Recortado()
  @IsEmail({}, { message: 'Escribe un correo válido' })
  @MaxLength(180)
  email!: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(1000)
  adicional?: string;

  @Autorizado()
  consentimiento!: boolean;
}

export class BoletinDto {
  @Recortado()
  @IsEmail({}, { message: 'Escribe un correo válido' })
  @MaxLength(180)
  email!: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(120)
  nombre?: string;

  @Autorizado()
  consentimiento!: boolean;
}

export class SugerenciaDto {
  @IsString()
  @MinLength(2, { message: 'Escribe tu nombre' })
  @MaxLength(120)
  nombre!: string;

  // La caja «Pregunta o recomendación» del hero es anónima, pero admite correo
  // para quien quiera que le contesten. Vacío o ausente significa «sin canal», y
  // el controlador lo guarda como `null` en vez de inventar una dirección.
  @IsOptional()
  @VacioOpcional()
  @Recortado()
  @IsEmail({}, { message: 'Escribe un correo válido' })
  @MaxLength(180)
  email?: string;

  @IsString()
  @MinLength(5, { message: 'Escribe tu sugerencia' })
  @MaxLength(4000)
  sugerencia!: string;

  @Autorizado()
  consentimiento!: boolean;
}

export class NoticiaDto {
  @IsString()
  @MinLength(1, { message: 'El título es obligatorio' })
  @MaxLength(300)
  titulo!: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(320)
  slug?: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(120)
  categoria?: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(160)
  autor?: string;

  @IsOptional()
  @VacioOpcional()
  @IsDateString({}, { message: 'La fecha no es válida' })
  fecha?: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(1000)
  imagen?: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(1000)
  resumen?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  @MaxLength(20000, { each: true })
  contenido?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(40)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  etiquetas?: string[];

  @IsOptional()
  @IsBoolean()
  publicado?: boolean;

  @IsOptional()
  @IsBoolean()
  destacado?: boolean;

  @IsOptional()
  @VacioOpcional()
  @IsDateString({}, { message: 'La fecha de publicación no es válida' })
  publicadoEn?: string;
}

export class DocumentoDto {
  @IsString()
  @MinLength(1, { message: 'El título es obligatorio' })
  @MaxLength(300)
  titulo!: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(200)
  autor?: string;

  @IsOptional()
  @VacioOpcional()
  @IsDateString({}, { message: 'La fecha no es válida' })
  fecha?: string;

  @IsOptional()
  @VacioOpcional()
  @IsIn(TIPOS_DOCUMENTO, { message: 'Tipo de documento no válido' })
  tipo?: (typeof TIPOS_DOCUMENTO)[number];

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(120)
  delimitacion?: string;

  @IsOptional()
  @VacioOpcional()
  @IsIn(FORMATOS_DOCUMENTO, { message: 'Formato no válido' })
  formato?: (typeof FORMATOS_DOCUMENTO)[number];

  @IsOptional()
  @VacioOpcional()
  @urlOpcional()
  link?: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(1000)
  archivo?: string;
}

export class ConvocatoriaDto {
  @IsString()
  @MinLength(1, { message: 'El título es obligatorio' })
  @MaxLength(300)
  titulo!: string;

  @IsOptional()
  @VacioOpcional()
  @IsDateString({}, { message: 'La fecha no es válida' })
  fecha?: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(2000)
  descripcion?: string;

  @IsOptional()
  @VacioOpcional()
  @urlOpcional()
  enlace?: string;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}

/**
 * Ciclo de atención de un mensaje. No es un estado de la ciudadanía sino del
 * equipo: sirve para filtrar la bandeja y dejar claro qué está pendiente de mirar.
 *
 * `nuevo`        — acaba de llegar, nadie lo ha abierto.
 * `en_revision`  — alguien lo está leyendo o se ocupa de lo que cuenta.
 * `respondido`   — se le contestó por el canal que dejó y quedó anotado en `seguimiento`.
 * `archivado`    — cerrado sin respuesta (no dejó contacto, o no procedía).
 */
export const ESTADO_MENSAJE = ['nuevo', 'en_revision', 'respondido', 'archivado'] as const;

export type EstadoMensaje = (typeof ESTADO_MENSAJE)[number];

/**
 * PATCH de un mensaje. Antes solo aceptaba `leido` y el servicio se llamaba
 * `setLeido`; ahora el backoffice actualiza estado y seguimiento en la misma
 * llamada, así que los tres campos son opcionales y se ignora lo que no llegue.
 */
export class MensajePatchDto {
  @IsOptional()
  @IsBoolean()
  leido?: boolean;

  @IsOptional()
  @IsIn(ESTADO_MENSAJE, {
    message: `El estado debe ser uno de: ${ESTADO_MENSAJE.join(', ')}`,
  })
  estado?: EstadoMensaje;

  /**
   * La nota de seguimiento se puede **borrar**, y para eso el vacío tiene que
   * llegar al servicio como `null`.
   *
   * Aquí no se usa `VacioOpcional`, que convierte el vacío en `undefined`: un
   * campo ausente no se asigna, así que borrar la nota respondía `200` sin quitar
   * nada —la interfaz anunciaba que estaba guardada y la nota seguía ahí—. Con
   * este `Transform` el vacío pasa a `null`, `@IsOptional` lo deja pasar y
   * `Object.assign` sí lo escribe.
   */
  @Transform(({ value }) =>
    typeof value === 'string' && value.trim() === '' ? null : value,
  )
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  seguimiento?: string | null;
}

/**
 * Un enlace del encabezado. Es un objeto anidado dentro de `navLinks`, así que
 * necesita `@ValidateNested` + `@Type`: sin la declaración de clase que_class-
 * transformer no sabe qué clase instanciar por elemento y la validación se
 * saltaría el interior del objeto.
 *
 * El `href` acepta rutas internas (`/noticias`) y direcciones completas
 * (`https://…`), que es lo que hace falta si algún día el menú enlaza a una
 * página externa.
 */
export class NavLinkDto {
  @IsString()
  @MinLength(1, { message: 'El texto del enlace es obligatorio' })
  @MaxLength(80)
  label!: string;

  @IsString()
  @MinLength(1, { message: 'La dirección del enlace es obligatoria' })
  @MaxLength(300)
  @Matches(/^(\/|https?:\/\/)/, {
    message: 'La dirección debe empezar por "/" o por "https://"',
  })
  href!: string;
}

export class SiteConfigDto {
  @IsString()
  @MinLength(1, { message: 'El nombre es obligatorio' })
  @MaxLength(200)
  nombre!: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(300)
  tagline?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  headline?: string[];

  @IsOptional()
  @VacioOpcional()
  @IsEmail({}, { message: 'El correo no es válido' })
  @MaxLength(180)
  email?: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(40)
  telefono?: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(40)
  telefonoHref?: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(200)
  direccion?: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(200)
  ciudad?: string;

  @IsOptional()
  @VacioOpcional()
  @urlOpcional()
  facebook?: string;

  @IsOptional()
  @VacioOpcional()
  @urlOpcional()
  instagram?: string;

  @IsOptional()
  @VacioOpcional()
  @urlOpcional()
  x?: string;

  // --- Encabezado del sitio (módulo "Header" de los ajustes) ---

  /**
 * El logo se sube a la biblioteca, así que lo normal es una ruta interna
 * (`/uploads/…`). Se admite una dirección completa porque puede que alguien
 * quiere apuntar a una imagen que ya está en otro lado.
 *
 * El patrón no es un adorno: sin él, `javascript:…` se guardaría como logo y
 * quedaría a un paso de acabar en un atributo que sí lo ejecuta. Va el mismo
 * criterio que en el `href` de los enlaces del menú.
 *
 * Y aquí **no** se usa `VacioOpcional`, a propósito: ese decorador convierte el
 * vacío en `undefined`, y un campo ausente no se asigna, así que el botón
 * "Quitar imagen" no quitaría nada —se pondría en 200 y el logo seguiría ahí sin
 * explicación—. Aquí el vacío se convierte en `null`, que sí es un valor que se
 * guarda, y `null` es lo que el sitio lee como "usa la marca propia".
 */
@Transform(({ value }) =>
  typeof value === 'string' && value.trim() === '' ? null : value,
)
@IsOptional()
  @IsString()
  @MaxLength(500)
  @Matches(/^(\/|https?:\/\/)/, {
    message: 'La imagen del logo debe empezar por "/" o por "https://"',
  })
  logoUrl?: string | null;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(200)
  logoTitulo?: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(300)
  logoSubtitulo?: string;

  /**
   * El orden de los enlaces es el del arreglo, y eso es lo que se reordena en el
   * backoffice. Se limita a 20 porque es un menú de navegación, no un listado: más
   * de eso ya no cabe en la barra y el sitio se vería roto en pantallas
   * normales.
   */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20, { message: 'El encabezado admite máximo 20 enlaces' })
  @ValidateNested({ each: true })
  @Type(() => NavLinkDto)
  navLinks?: NavLinkDto[];
}

export class StatDto {
  @IsString()
  @MaxLength(40)
  value!: string;

  @IsString()
  @MaxLength(120)
  label!: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(200)
  subtext?: string;
}

export class EntidadDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  nombre!: string;
}

/**
 * Los doce municipios del departamento. `dato` y `descripcion` son opcionales a
 * proposito: el nombre es lo que no puede faltar, el resto es texto de apoyo que
 * el panel puede dejar vacio sin romper nada.
 */
export class MunicipioDto {
  @IsString()
  @MinLength(1, { message: 'El nombre del municipio es obligatorio' })
  @MaxLength(120)
  nombre!: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(120)
  dato?: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;
}

export class TallerDto {
  @IsOptional()
  @VacioOpcional()
  @IsDateString({}, { message: 'La fecha no es válida' })
  date?: string;

  @IsString()
  @MinLength(1, { message: 'El título es obligatorio' })
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(200)
  place?: string;

  @IsOptional()
  @VacioOpcional()
  @IsIn(STATUS_TALLER, { message: 'Estado no válido' })
  status?: (typeof STATUS_TALLER)[number];
}

export class DocCategoriaDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  slug!: string;

  @IsString()
  @MinLength(1, { message: 'El título es obligatorio' })
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(60)
  icon?: string;
}

export class PaginaProyectoDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  slug!: string;

  @IsString()
  @MinLength(1, { message: 'El título es obligatorio' })
  @MaxLength(300)
  title!: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(120)
  kicker?: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(1000)
  image?: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(1000)
  excerpt?: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(2000)
  lead?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  @MaxLength(20000, { each: true })
  body?: string[];
}

export class DimensionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  slug!: string;

  @IsString()
  @MinLength(1, { message: 'El título es obligatorio' })
  @MaxLength(300)
  title!: string;

  /**
   * 'dimension' = una de las 4 dimensiones de análisis del proyecto.
   * 'bloque'    = contenido de apoyo (misiones, retos, iniciativas, hallazgos).
   * Si no viene, se asume 'dimension'.
   */
  @IsOptional()
  @IsIn(['dimension', 'bloque'], { message: 'El tipo debe ser "dimension" o "bloque"' })
  tipo?: 'dimension' | 'bloque';

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(300)
  short?: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(60)
  icon?: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(2000)
  summary?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  @MaxLength(20000, { each: true })
  body?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  layers?: unknown[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  steps?: unknown[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  charts?: unknown[];
}

/** Payload libre para los CRUD de configuración genéricos ya validados arriba. */
export const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Variantes de actualización parcial. El backoffice alterna campos sueltos
 * (por ejemplo `PATCH /api/noticias/:id { publicado: true }`), así que un PATCH
 * no puede exigir los campos obligatorios del POST.
 */
export class NoticiaPatchDto extends PartialType(NoticiaDto) {}
export class DocumentoPatchDto extends PartialType(DocumentoDto) {}
export class ConvocatoriaPatchDto extends PartialType(ConvocatoriaDto) {}
export class SiteConfigPatchDto extends PartialType(SiteConfigDto) {}
export class StatPatchDto extends PartialType(StatDto) {}
export class EntidadPatchDto extends PartialType(EntidadDto) {}
export class MunicipioPatchDto extends PartialType(MunicipioDto) {}
export class TallerPatchDto extends PartialType(TallerDto) {}
export class DocCategoriaPatchDto extends PartialType(DocCategoriaDto) {}
export class PaginaProyectoPatchDto extends PartialType(PaginaProyectoDto) {}
export class DimensionPatchDto extends PartialType(DimensionDto) {}

/** Convierte el `:id` de la ruta a entero validado. */
export class IdParamDto {
  @Type(() => Number)
  @IsInt({ message: 'El identificador debe ser un número entero' })
  id!: number;
}
