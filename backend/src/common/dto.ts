import { PartialType } from "@nestjs/mapped-types";
import { applyDecorators } from "@nestjs/common";
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
 * Como `VacioOpcional`, pero para los campos de imagen de la portada.
 *
 * La diferencia —y el motivo de que esto exista— es que el vacío significa aquí
 * **"usa la imagen que trae el sitio"**, y es un valor que el editor tiene que
 * poder guardar: es lo que hace el botón «Usar la del sitio» del panel. Con
 * `VacioOpcional` el vacío llegaba como `undefined` y el guardado respondía `400`
 * ("La imagen de fondo debe empezar por "/" o por "https://""), porque
 * `@Matches` no acepta la cadena vacía y el campo vacío sí llega al validador.
 *
 * O sea: sin esto **no se podía quitar una imagen de la portada**. Subir una
 * nueva funcionaba, pero volver a la del sitio —justo lo que hace ese botón—
 * no, y la causa era que el campo vacío y el campo "no vine a tocarlo" se
 * confundían en el mismo hueco.
 *
 * Se aplica a las imágenes de la portada (`hero.fondo`, `proyecto.fondo` y
 * `elProyecto.fondo`), que son las que el panel edita con ese botón.
 */
export const VacioEnPortada = () =>
  Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? null : value));

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

/**
 * Colores del botón del hero.
 *
 * No es libre, y a propósito. El botón lleva el texto dentro de un color
 * concreto, así que aceptar cualquier hexadecimal dejaría poder elegir, sin
 * querer, un fondo claro con letra oscura encima —ilegible— sin que nada lo
 * avise. Con una lista corta de colores del propio sitio, todos ellos con su
 * texto ya emparejado, el contraste está garantizado por construcción.
 *
 * Los pares son estos:
 *   - `lima`        `#c6e85c` con texto `#1c3334` → 9,60:1 (el de siempre)
 *   - `lima-oscuro` `#b5dc4a` con texto `#1c3334` → 8,86:1
 *   - `verde`       `#3f6b0e` con texto blanco    → 6,32:1
 *   - `tinta`       `#0b3336` con texto blanco    → 15,3:1
 *   - `convoca`     `#5b2d8a` con texto blanco    → 8,6:1
 *
 * Todos por encima del 4,5:1 que pide WCAG AA para texto normal. Si algún día
 * hace falta un color más, se añade aquí **y** en el mapa del frontend
 * (`COLOR_BOTON`), que es donde se traduce la clave a clases.
 */
export const COLORES_BOTON = ['lima', 'lima-oscuro', 'verde', 'tinta', 'convoca'] as const;

/**
 * Un color de botón de la portada, de la lista cerrada de arriba.
 *
 * Existe como decorador porque el color es un campo repetido en **siete** sitios
 * de `home` —el botón del hero, el «Enviar» de la caja de sugerencias, el de
 * cada tarjeta del proyecto, el de cada categoría de documentos, el «Ver todas»,
 * el de cada tarjeta de noticias y el del teléfono— y la lista tiene que ser **la
 * misma** en todos: si uno se validara contra una lista propia, ese botón acabaría
 * aceptando colores que el frontend no sabe pintar, y saldría sin fondo.
 *
 * **Con `@IsOptional()`, como el resto de campos de la portada.** Un color puede
 * no venir, y no solo porque alguien lo mande vacío:
 *
 *  - una fila guardada antes de que existiera el campo no lo tiene, así que
 *    cualquier guardado parcial de la portada la dejaría como está y llegaría sin
 *    él. Sin `@IsOptional()`, `IsIn` ve `undefined` y **todo** guardado parcial
 *    respondería `400` —que es justo lo que pasó aquí al añadir los seis
 *    colores nuevos—.
 *  - un guardado parcial a propósito (un script, un `curl`, la suite) manda solo
 *    la sección que quiere cambiar.
 *
 * Que no venga no es un estado que alguien pueda dejar a propósito —un botón sin
 * color se pierde sobre el papel—, así que quien lo deja vacío lo que quiere es
 * "ponme el color que tenía". De eso se encarga el frontend, campo a campo
 * (`colorO` en `frontend/src/data/site-context.tsx`), que es la red de seguridad.
 */
export const EsColorBoton = () =>
  applyDecorators(
    IsOptional(),
    IsIn(COLORES_BOTON, { message: `El color debe ser uno de: ${COLORES_BOTON.join(', ')}` }),
  );

/** El tipo del valor de un color, para no repetirlo en cada campo. */
export type ColorBotonDto = (typeof COLORES_BOTON)[number];

/**
 * Los colores que se pueden elegir para un botón que va **encima de una caja
 * lima**: hoy, el «Enviar» de la caja de sugerencias del hero.
 *
 * Es una lista aparte y más corta a propósito. La caja es `bg-lime`, así que un
 * botón `lima` o `lima-oscuro` se fundiría con ella: el texto `text-lime-fg`
 * sobre el mismo lima da 1:1 y el botón desaparecería. No es un mal gusto, es un
 * botón que nadie puede leer ni pulsar porque no se distingue del fondo.
 *
 * Los tres que quedan (verde, tinta, convoca) son oscuros y se leen bien tanto
 * sobre la caja lima como sobre el papel. El frontend los aplica con el mismo
 * `clasesBoton` de siempre, así que el color se ve igual en todos los botones de
 * la portada; lo único que cambia es cuántos se ofrecen.
 *
 * `@IsOptional()` por lo mismo que `EsColorBoton`: si no viene, se usa el del
 * sitio y no se rechaza el guardado entero.
 */
export const COLORES_BOTON_ENCIMA_LIMA = ['verde', 'tinta', 'convoca'] as const;

/** Valida contra la lista corta, para el botón que va sobre la caja lima. */
export const EsColorBotonSobreLima = () =>
  applyDecorators(
    IsOptional(),
    IsIn(COLORES_BOTON_ENCIMA_LIMA, {
      message: `Sobre la caja lima el color debe ser uno de: ${COLORES_BOTON_ENCIMA_LIMA.join(', ')}`,
    }),
  );

/** El tipo del valor de un botón sobre la caja lima. */
export type ColorBotonSobreLimaDto = (typeof COLORES_BOTON_ENCIMA_LIMA)[number];

/**
 * Textos de una sección de la portada: titular y párrafo.
 *
 * Todos opcionales y todos con el mismo contrato: **vacío significa "usa el
 * texto del sitio"**, nunca "sin texto". Es la misma decisión que con los textos
 * del logo, y por el mismo motivo —una sección con el titular en blanco se ve
 * rota, y es mejor el texto de siempre que un hueco—.
 */
export class SeccionDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  titulo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  texto?: string;
}

/**
 * El hero de la portada.
 *
 * La imagen acepta ruta interna (`/images/…` para las que trae el sitio,
 * `/uploads/…` para las que se suben desde el panel) o dirección completa.
 *
 * El patrón `^(\/|https?:\/\/)` de las imágenes no es un adorno: sin él,
 * `javascript:…` se guardaría como imagen y quedaría a un paso de acabar en un
 * atributo que sí lo ejecuta. Es el mismo criterio que usa el `href` de los
 * enlaces del menú.
 *
 */
export class HeroDto {
  @IsOptional()
  @VacioEnPortada()
  @IsString()
  @MaxLength(500)
  @Matches(/^(\/|https?:\/\/)/, {
    message: 'La imagen de fondo debe empezar por "/" o por "https://"',
  })
  fondo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  botonTexto?: string;

  @EsColorBoton()
  botonColor?: ColorBotonDto;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  cajaTitulo?: string;

  /**
   * El color del «Enviar» de la caja de sugerencias.
   *
   * Valida contra `COLORES_BOTON_ENCIMA_LIMA` y no contra la lista completa: la
   * caja es lima, y un botón lima encima de una caja lima es ilegible.
   */
  @EsColorBotonSobreLima()
  cajaBotonColor?: ColorBotonSobreLimaDto;
}

/** La sección oscura de «El proyecto». */
export class ProyectoPortadaDto extends SeccionDto {
  @IsOptional()
  @VacioEnPortada()
  @IsString()
  @MaxLength(500)
  @Matches(/^(\/|https?:\/\/)/, {
    message: 'La imagen de fondo debe empezar por "/" o por "https://"',
  })
  fondo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  tarjetaBoton?: string;

  /** El color del botón «Explorar más» de cada tarjeta del carrusel. */
  @EsColorBoton()
  botonColor?: ColorBotonDto;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  dimsTitulo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  dimsTexto?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  accionTitulo?: string;
}

/**
 * La página «El proyecto» (`/proyecto`): el hero, los dos párrafos, las tres
 * etapas y las entidades aliadas.
 *
 * No es un bloque de la portada: es la página que cuelga del menú. Vive en
 * `home` porque ahí viven las secciones editables del sitio, y el módulo «El
 * proyecto» del panel la edita con el mismo guardado que el resto.
 *
 * A diferencia de los rótulos de la portada, el «titulo» aquí **sí** se edita:
 * es el titular de la página, no parte del diseño fijo.
 */
export class ElProyectoPortadaDto {
  /** Como `ProyectoPortadaDto.fondo`: `null` = la imagen que trae el sitio. */
  @IsOptional()
  @VacioEnPortada()
  @IsString()
  @MaxLength(500)
  @Matches(/^(\/|https?:\/\/)/, {
    message: 'La imagen de fondo debe empezar por "/" o por "https://"',
  })
  fondo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  titulo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  intro?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  parrafoUno?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  parrafoDos?: string;

  /**
   * Las tres etapas, en orden; el «01/02/03» lo pone el diseño.
   *
   * Son exactamente tres a propósito: el panel edita tres recuadros y el sitio
   * los pinta tres. Se admite menos (o ninguna) porque un guardado parcial o
   * una base vieja no deberían caerse, y el frontend resuelve cada hueco al
   * texto del sitio.
   */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @IsString({ each: true })
  @MaxLength(160, { each: true })
  etapas?: string[];

  /** Las entidades aliadas, en el orden en que se ven. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(160, { each: true })
  entidades?: string[];
}

/**
 * El hero de la página `/dimensiones`: titular y bajada.
 *
 * No es un bloque de la portada: es la página que cuelga del menú. Vive en
 * `home` porque ahí viven las secciones editables del sitio, y el módulo
 * «Dimensiones» del panel la edita con el mismo guardado que el resto.
 */
export class ElDimensionesPortadaDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  titulo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  intro?: string;
}

/** La tira de municipios. */
export class CoberturaPortadaDto extends SeccionDto {}

/**
 * El bloque de documentos.
 *
 * No es un `SeccionDto` pelado porque el botón «Ver más» de cada categoría
 * también es un botón, y su color se edita desde el panel igual que los demás.
 */
export class DocumentosPortadaDto extends SeccionDto {
  /** El color del botón «Ver más» de las tarjetas de categorías. */
  @EsColorBoton()
  botonColor?: ColorBotonDto;
}

/** La tira de noticias. */
export class NoticiasPortadaDto extends SeccionDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  botonTexto?: string;

  /** El color del botón «Ver todas». */
  @EsColorBoton()
  botonColor?: ColorBotonDto;

  /**
   * El color del «Ver más» de cada tarjeta.
   *
   * Va aparte del de «Ver todas» porque los dos botones no se parecen: el
   * primero es un botón de la página, el segundo va **encima** de la foto de la
   * noticia, y el color que se lee bien sobre el papel no siempre es el que se
   * lee bien sobre una imagen. Con uno solo había que elegir cuál de los dos
   *estringiera el color.
   */
  @EsColorBoton()
  tarjetaBotonColor?: ColorBotonDto;
}

/**
 * La sección «Repositorio de información» de la portada.
 *
 * Como `DocumentosPortadaDto`, no es un `SeccionDto` pelado porque lleva dos
 * botones con su propio color. El párrafo admite el marcador `{total}`: el sitio
 * lo sustituye por el número real de documentos, así que el texto se puede
 * editar sin que la cifra se quede congelada en el valor de un día.
 */
export class RepositorioPortadaDto extends SeccionDto {
  /** Texto del botón que lleva al dashboard del repositorio. */
  @IsOptional()
  @IsString()
  @MaxLength(40)
  dashboardBoton?: string;

  @EsColorBoton()
  dashboardColor?: ColorBotonDto;

  /**
   * Texto del botón secundario que lleva al catálogo.
   *
   * Sin color propio: es el botón de contorno del bloque oscuro, y darle fondo
   * rompería el contraste con el botón principal (que sí es de color).
   */
  @IsOptional()
  @IsString()
  @MaxLength(40)
  catalogoBoton?: string;
}

/** La sección de contacto. */
export class ContactoPortadaDto extends SeccionDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  formTitulo?: string;

  /**
   * El color del botón del teléfono.
   *
   * Es el único botón de la sección que no es un "enviar": es un enlace al
   * teléfono, y por eso lleva su propio color en vez de compartirlo con el del
   * formulario.
   */
  @EsColorBoton()
  botonColor?: ColorBotonDto;

  /** El color del botón «Enviar» del formulario. */
  @EsColorBoton()
  enviarColor?: ColorBotonDto;
}

/**
 * El pie de página: la columna con las tarjetas de «El proyecto».
 *
 * Es la **única** columna del pie que se edita desde el panel, y es a
 * propósito. Las otras dos —«Mapa del sitio» y las dimensiones— son fijas y
 * salen del código (`FOOTER_COLS` en el frontend): son el temario del sitio
 * entero y no un contenido que cambie según quien administre. Esta, en cambio,
 * son seis enlaces de las páginas del proyecto, y elegir cuáles se ven evita
 * que el pie muestre siempre las mismas seis.
 *
 * El tope de seis es el del diseño: el pie pinta una sola columna de ese
 * tamaño, y más enlaces la desbordarían. Se reutiliza `NavLinkDto` —el mismo
 * validador de los enlaces del menú— porque es el mismo tipo de cosa: un texto
 * y una dirección que empieza por `/` o `https://`, con las mismas razones
 * (sin texto no se ve y sin dirección el clic no lleva a ninguna parte).
 *
 * Una lista vacía significa "usa las del sitio", igual que con `navLinks`: el
 * frontend vuelve a las seis por defecto en vez de dejar el pie sin nada.
 */
export class FooterPortadaDto {
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6, { message: 'El pie de página admite máximo 6 enlaces' })
  @ValidateNested({ each: true })
  @Type(() => NavLinkDto)
  enlaces?: NavLinkDto[];

  /**
   * El texto de la barra inferior del pie.
   *
   * Sin `VacioOpcional` a propósito: aquí la cadena vacía **sí** es un valor
   * que se guarda y significa "usa el texto que trae el sitio". Con
   * `VacioOpcional` el vacío llegaría como `undefined` y el guardado no
   * escribiría nada, de modo que limpiar el campo no repondría el texto por
   * defecto: dejaría el que hubiera antes.
   */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  copyright?: string;
}

/**
 * Todo lo editable de la portada, por secciones.
 *
 * Cada bloque es opcional y se valida anidado (`@ValidateNested` + `@Type`)
 * porque son objetos, no valores sueltos. Sin esas dos declaraciones
 * class-transformer no sabría qué clase instanciar y la validación se saltaría
 * el interior: se podría mandar `hero: { botonColor: "blanco-neon" }` y pasaba.
 *
 * Mandar solo una sección es válido y **no borra las demás**: cada una se
 * guarda como viene, así que un guardado parcial deja el resto intacto.
 */
export class HomeDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => HeroDto)
  hero?: HeroDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProyectoPortadaDto)
  proyecto?: ProyectoPortadaDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ElProyectoPortadaDto)
  elProyecto?: ElProyectoPortadaDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ElDimensionesPortadaDto)
  elDimensiones?: ElDimensionesPortadaDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CoberturaPortadaDto)
  cobertura?: CoberturaPortadaDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DocumentosPortadaDto)
  documentos?: DocumentosPortadaDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => RepositorioPortadaDto)
  repositorio?: RepositorioPortadaDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => NoticiasPortadaDto)
  noticias?: NoticiasPortadaDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ContactoPortadaDto)
  contacto?: ContactoPortadaDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FooterPortadaDto)
  footer?: FooterPortadaDto;
}

/**
 * Datos legales editables (módulo "Legal" de los ajustes).
 *
 * Todos los campos son opcionales: el aviso de privacidad y los términos de uso
 * se publican igual mientras la organización no los complete, mostrando un
 * marcador visible en cada hueco. Se valida anidado, como `HomeDto`, para que
 * class-transformer instancie la clase y no se salte el interior.
 */
export class LegalDto {
  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(200)
  responsable?: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(40)
  nit?: string;

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
  @IsEmail({}, { message: 'El correo para derechos ARCO no es válido' })
  @MaxLength(180)
  correoArco?: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(300)
  plazoConservacion?: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(500)
  quienesAcceden?: string;

  @IsOptional()
  @VacioOpcional()
  @IsString()
  @MaxLength(100)
  actualizado?: string;
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

  /**
   * El contenido de la portada (módulo "Home"). El titular del hero **no** entra
   * aquí: es la columna `headline` de la fila, que ya existía. Si el titular
   * viviera dentro de `home` habría dos sitios editándolo y solo se vería el que
   * se hubiera guardado.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => HomeDto)
  home?: HomeDto;

  /**
   * Datos legales editables (responsable, NIT, canal ARCO, retención…). El
   * texto de las políticas vive en el frontend; aquí solo los datos variables.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => LegalDto)
  legal?: LegalDto;
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

  /**
   * Rótulos que encabezan las listas `steps` y `layers`. **No** llevan
   * `VacioOpcional` a propósito: la cadena vacía es un valor —«usa el rótulo
   * del sitio», «Retos principales» / «Líneas de trabajo»—, y con ese decorador
   * el vacío llegaría como `undefined` y no se podría volver al de por defecto.
   */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  stepsLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  layersLabel?: string;

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
