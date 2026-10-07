/**
 * CLI de inicialización de la base de datos (pensado para PRODUCCIÓN).
 *
 * En dev/docker el esquema y la semilla se crean solos porque el backend arranca
 * con `DB_SYNCHRONIZE=true`. En producción `DB_SYNCHRONIZE=false` (requisito
 * obligatorio: nunca dejar que la app altere tablas en un entorno real), así que
 * el esquema hay que crearlo explícitamente ANTES de levantar el backend.
 *
 * Este script cubre ese hueco en dos fases, sin duplicar la lógica del seeder:
 *
 *   1. Esquema — abre un DataSource propio con `synchronize: true` y cierra.
 *      Crea las tablas que falten y añade las columnas que falten. Es
 *      idempotente: se puede ejecutar tantas veces como haga falta.
 *   2. Semilla — arranca el AppModule real (con `DB_SYNCHRONIZE=false`) para que
 *      corra `SeederService.onApplicationBootstrap`, que solo siembra las tablas
 *      que estén vacías. Reutiliza exactamente la misma semilla que la app.
 *
 * Uso (dentro del contenedor del backend):
 *     node dist/cli/db-init.js                 # esquema + semilla
 *     node dist/cli/db-init.js --schema-only   # solo esquema
 *     node dist/cli/db-init.js --seed-only     # solo semilla
 *
 * También se puede lanzar desde el repo con `make prod-db-init`.
 */
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import { ALL_ENTITIES } from '../entities';

const logger = new Logger('DbInit');

/**
 * Carga el archivo `.env.<APP_ENV>` con la misma resolución que `ConfigModule`
 * (`main.ts` / `app.module.ts`). Se hace a mano para que este script no dependa
 * del ciclo de vida de Nest solo para leer variables.
 *
 * `process.env` tiene prioridad: Docker Compose (`env_file`) gana sobre el archivo.
 */
function loadEnvFile(): void {
  const envName = process.env.APP_ENV ?? 'dev';
  const file = path.resolve(process.cwd(), `.env.${envName}`);
  if (!fs.existsSync(file)) {
    logger.warn(`No se encontró ${path.basename(file)}; se usan solo variables de entorno.`);
    return;
  }
  for (const rawLine of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    // No sobrescribir lo que ya viene del entorno (env_file de Docker, CI, etc.).
    if (process.env[key] === undefined) process.env[key] = value;
  }
  logger.log(`Variables cargadas desde ${path.basename(file)}`);
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Falta la variable ${key}. Revisa el archivo .env.<APP_ENV> o el env_file del contenedor.`,
    );
  }
  return value;
}

function dataSourceOptions(synchronize: boolean) {
  return {
    type: 'postgres' as const,
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: requireEnv('DB_USER'),
    password: requireEnv('DB_PASSWORD'),
    database: requireEnv('DB_NAME'),
    entities: ALL_ENTITIES,
    synchronize,
    logging: ['error', 'warn'] as ('error' | 'warn')[],
  };
}

async function runSchema(): Promise<void> {
  logger.log('Fase 1/2 — creando el esquema…');
  const dataSource = new DataSource(dataSourceOptions(true));
  await dataSource.initialize();
  try {
    await dataSource.synchronize(false);
    const tables = await dataSource.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`,
    );
    logger.log(`Esquema listo. Tablas en el esquema "public": ${tables.length}`);
  } finally {
    await dataSource.destroy();
  }
}

async function runSeed(): Promise<void> {
  // La app debe arrancar sin permiso para tocar el esquema en esta fase.
  process.env.DB_SYNCHRONIZE = 'false';
  logger.log('Fase 2/2 — sembrando datos iniciales (solo en tablas vacías)…');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });
  await app.close();
  logger.log('Semilla aplicada.');
}

async function main(): Promise<void> {
  loadEnvFile();

  const args = process.argv.slice(2);
  const schemaOnly = args.includes('--schema-only');
  const seedOnly = args.includes('--seed-only');

  logger.log(
    `Entorno=${process.env.APP_ENV ?? 'dev'} db=${process.env.DB_NAME} usuario=${process.env.DB_USER}`,
  );

  if (!seedOnly) await runSchema();
  if (!schemaOnly) await runSeed();

  logger.log('db-init completado.');
}

main().catch((error: unknown) => {
  logger.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
