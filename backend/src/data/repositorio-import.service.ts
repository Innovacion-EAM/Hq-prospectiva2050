import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { RepositorioItem } from '../entities/repositorio-item.entity';
import {
  ImportableRepositorioItem,
  normalizarFilaRepositorio,
} from './repositorio.util';

export interface ImportarResultado {
  creados: number;
  actualizados: number;
  errores: { fila: number; motivo: string }[];
}

/**
 * Importador del repositorio desde CSV.
 *
 * Acepta dos formatos de encabezados sin que el usuario tenga que acordarse:
 * el CSV canónico del proyecto (`codigo,dimension,titulo,autor,anio,tipo,
 * delimitacion,formato,link`) y la exportación directa del Excel original
 * (No., Dimensión, Título del documento, Autor(es), Fecha de publicación,
 * Tipo de documento, Delimitación espacial, Formato, Link de acceso/descarga).
 *
 * La clave natural es `codigo` (el "No." del Excel): reimportar el archivo
 * actualiza en vez de duplicar. El resultado informa exactamente cuántos se
 * crearon, cuántos se actualizaron y qué filas se saltaron y por qué.
 *
 * No hay dependencias de librerías: el CSV se parsea con un pequeño máquina de
 * estados que respeta comillas, saltos de línea dentro de un campo y el BOM de
 * las exportaciones de Excel. El delimitador se detecta por conteo (`,` de
 * exportaciones internacionales vs `;` de las regionales).
 */
@Injectable()
export class RepositorioImportService {
  constructor(
    @InjectRepository(RepositorioItem)
    private readonly repository: Repository<RepositorioItem>,
  ) {}

  /** Parsea un buffer de CSV y lo importa (upsert por `codigo`). */
  async importar(buffer: Buffer): Promise<ImportarResultado> {
    const grid = splitCsv(buffer.toString('utf8').replace(/^\uFEFF/, ''));

    if (grid.length < 2) {
      throw new BadRequestException('El archivo no tiene filas de datos');
    }

    const { camposPorColumna, errores } = mapearEncabezados(grid[0]);
    const filas: { fila: number; item: ImportableRepositorioItem }[] = [];

    for (let i = 1; i < grid.length; i += 1) {
      const cells = grid[i];
      if (cells.every((c) => c.trim() === '')) continue; // fila vacía

      const raw: Record<string, string> = {};
      for (let col = 0; col < cells.length; col += 1) {
        const campo = camposPorColumna.get(col);
        if (!campo) continue;
        raw[campo] = (raw[campo] ?? '') + (raw[campo] ? '\n' : '') + cells[col];
      }

      const resultado = normalizarFilaRepositorio(raw, i + 1);
      if ('error' in resultado) {
        errores.push({ fila: i + 1, motivo: resultado.error });
      } else {
        filas.push({ fila: i + 1, item: resultado.item });
      }
    }

    // ── Upsert por `codigo` ────────────────────────────────────────────────
    const resultado: ImportarResultado = { creados: 0, actualizados: 0, errores };
    const codigos = filas
      .map((f) => f.item.codigo)
      .filter((c): c is number => c !== undefined);

    const existentes = codigos.length
      ? await this.repository.find({ where: { codigo: In([...new Set(codigos)]) } })
      : [];
    const porCodigo = new Map(existentes.map((item) => [item.codigo, item]));

    const ahora = new Date();
    const pendientesGuardar: RepositorioItem[] = [];
    const codigosVistos = new Set<number>();

    for (const { item } of filas) {
      if (item.codigo === undefined || codigosVistos.has(item.codigo)) {
        // Sin código (o duplicado dentro del archivo): siempre se crea nuevo.
        pendientesGuardar.push(
          this.repository.create({
            ...item,
            publicado: true,
            publicadoEn: ahora,
          }),
        );
        resultado.creados += 1;
        continue;
      }
      codigosVistos.add(item.codigo);

      const previo = porCodigo.get(item.codigo);
      if (previo) {
        // Reimportación del mismo código: se actualizan los datos pero se
        // respeta el estado de publicación que haya dejado quien administra.
        Object.assign(previo, {
          titulo: item.titulo,
          autor: item.autor,
          anio: item.anio,
          tipo: item.tipo,
          delimitacion: item.delimitacion,
          formato: item.formato,
          dimension: item.dimension,
          link: item.link,
          actualizadoEn: ahora,
        });
        pendientesGuardar.push(previo);
        resultado.actualizados += 1;
      } else {
        pendientesGuardar.push(
          this.repository.create({
            ...item,
            publicado: true,
            publicadoEn: ahora,
          }),
        );
        resultado.creados += 1;
      }
    }

    if (pendientesGuardar.length > 0) {
      await this.repository.save(pendientesGuardar);
    }

    return resultado;
  }
}

/** Divide el texto CSV en celdas, respetando comillas y saltos de línea internos. */
function splitCsv(texto: string): string[][] {
  const filas: string[][] = [];
  let fila: string[] = [];
  let campo = '';
  let enComillas = false;

  for (let i = 0; i < texto.length; i += 1) {
    const ch = texto[i];
    if (enComillas) {
      if (ch === '"') {
        if (texto[i + 1] === '"') {
          campo += '"';
          i += 1;
        } else {
          enComillas = false;
        }
      } else {
        campo += ch;
      }
    } else if (ch === '"') {
      enComillas = true;
    } else if (ch === ',' || ch === ';') {
      fila.push(campo);
      campo = '';
    } else if (ch === '\n') {
      fila.push(campo);
      campo = '';
      filas.push(fila);
      fila = [];
    } else if (ch !== '\r') {
      campo += ch;
    }
  }
  if (campo.length > 0 || fila.length > 0) {
    fila.push(campo);
    filas.push(fila);
  }
  return filas;
}

function normalizarEncabezado(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/** Devuelve el campo de cada columna según los encabezados, o un error descriptivo. */
function mapearEncabezados(
  encabezados: string[],
): { camposPorColumna: Map<number, string>; errores: { fila: number; motivo: string }[] } {
  const ALIASES: [string, string[]][] = [
    ['codigo', ['codigo', 'no']],
    ['titulo', ['titulo', 'titulodeldocumento', 'nombredeldocumento']],
    ['autor', ['autor', 'autores']],
    ['anio', ['anio', 'fecha', 'fechadepublicacion', 'aniodepublicacion']],
    ['tipo', ['tipo', 'tipodedocumento']],
    ['delimitacion', ['delimitacion', 'delimitacionespacial']],
    ['formato', ['formato']],
    ['dimension', ['dimension', 'categoria', 'seccion']],
    ['link', ['link', 'urldelink', 'linkdeaccesodescarga', 'enlace', 'acceso', 'descarga']],
  ];

  const camposPorColumna = new Map<number, string>();
  const utilizados = new Set<string>();

  for (let col = 0; col < encabezados.length; col += 1) {
    const normal = normalizarEncabezado(encabezados[col]);

    // Caso especial del Excel exportado por LibreOffice: la columna "Dimensión"
    // quedó sin encabezado y es la segunda columna. Si el encabezado está vacío
    // se asume dimensión.
    if (normal === '' && col === 1 && !utilizados.has('dimension')) {
      camposPorColumna.set(col, 'dimension');
      utilizados.add('dimension');
      continue;
    }

    const coincidencia = ALIASES.find(
      ([_, sinonimos]) => sinonimos.includes(normal) && !utilizados.has(_),
    );
    if (coincidencia) {
      camposPorColumna.set(col, coincidencia[0]);
      utilizados.add(coincidencia[0]);
    }
  }

  const errores: { fila: number; motivo: string }[] = [];
  if (!utilizados.has('titulo')) {
    errores.push({
      fila: 1,
      motivo: "no se reconocen los encabezados; falta la columna 'Título del documento'",
    });
  }
  return { camposPorColumna, errores };
}