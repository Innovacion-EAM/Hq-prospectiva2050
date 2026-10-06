import { useCallback, useEffect, useRef, useState } from "react";
import type {
  Convocatoria,
  Dimension,
  DocCategoria,
  Documento,
  Media,
  Mensaje,
  Municipio,
  Noticia,
  PaginaProyecto,
  Role,
  SiteSettings,
  Stat,
  Taller,
  User,
} from "./types";

const API_BASE: string =
  (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:3000";

const TOKEN_KEY = "hq_admin_token";
const USER_KEY = "hq_admin_user";

const BASENAME: string =
  import.meta.env.MODE === "dev" ? "" : "/admin";

/**
 * Convierte la ruta que guarda la base de datos en una URL que el navegador pueda
 * pedir. Es el mismo criterio que `resolveUrl` en el frontend.
 *
 * Hace falta desde la migración 0006: la galería guarda `/uploads/<archivo>` en
 * vez de `http://host/api/uploads/<archivo>`, para que cambiar de dominio no
 * obligue a reescribir las filas. Las URL absolutas que quedaran de antes se
 * detectan y se dejan tal cual, asi que conviven las dos formas sin romper nada.
 */
export function resolveUrl(path: string | null | undefined): string {
  const p = (path ?? "").trim();
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  if (p.startsWith("/uploads/") || p.startsWith("/api/uploads/")) {
    const relativa = p.startsWith("/api/") ? p.slice(4) : p;
    return `${API_BASE}/api${relativa}`;
  }
  return p;
}

function gotoLogin(): void {
  if (typeof window === "undefined") return;
  window.location.href = `${BASENAME}/login`;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setSession(token: string, user: unknown): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser<T>(): T | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export type Crud<T> = {
  list(): Promise<T[]>;
  create(item: Omit<T, "id">): Promise<T>;
  update(id: number, patch: Partial<T>): Promise<T>;
  remove(id: number): Promise<void>;
  /** Contenido dado de baja. Solo lo define quien tiene `@DeleteDateColumn`. */
  trashed?(): Promise<T[]>;
  /** Devuelve un registro de la papelera a su estado normal. */
  restore?(id: number): Promise<T>;
};

type HttpList<T> = T[] | { data: T[] };

/** Error de API con el mensaje real del backend, no solo el código HTTP. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** El backend responde { statusCode, message, error }; `message` puede ser array. */
async function mensajeDeError(res: Response, fallback: string): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) return body.message.join(" · ");
    if (typeof body.message === "string" && body.message) return body.message;
  } catch {
    // respuesta sin JSON
  }
  return fallback;
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    accept: "application/json",
  };
  const token = getToken();
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (res.status === 401) {
    clearSession();
    gotoLogin();
  }
  if (!res.ok) {
    throw new ApiError(res.status, await mensajeDeError(res, `La petición a ${path} falló`));
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function loginRequest(email: string, password: string) {
  return http<{ accessToken: string; user: User }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Tipos que acepta la galería. Debe coincidir con la lista blanca del backend
 * (backend/src/upload/upload.service.ts): el `accept` del <input> es solo una
 * ayuda visual, la decisión real la toma el servidor.
 *
 * SVG queda fuera a propósito: es XML que puede llevar <script> y al servirse
 * desde el mismo origen del API sería XSS almacenado.
 */
export const TIPOS_ARCHIVO_ACEPTADOS =
  "image/png,image/jpeg,image/webp,image/gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx";

export const EXTENSION_ARCHIVO_ACEPTADA = /\.(png|jpe?g|webp|gif)$/i;

export async function uploadFileRequest(file: File): Promise<Media> {
  const form = new FormData();
  form.append("file", file);
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/media/uploads`, { method: "POST", body: form, headers });
  if (res.status === 401) {
    clearSession();
    gotoLogin();
  }
  if (!res.ok) {
    throw new ApiError(res.status, await mensajeDeError(res, "No se pudo subir el archivo"));
  }
  return res.json() as Promise<Media>;
}

function normalizeList<T>(raw: HttpList<T>): T[] {
  return Array.isArray(raw) ? raw : raw.data ?? [];
}

/**
 * Campos que pertenecen al servidor y que el cliente nunca debe mandar de vuelta.
 *
 * El backend valida con `forbidNonWhitelisted`, así que cualquier campo extra en
 * el cuerpo es un 400 con el detalle de class-validator. El caso real: el listado
 * devuelve `eliminadoAt` en cada item (borrado lógico), los formularios hacen
 * spread del item para editar (`setEditing({ ...item })`), y ese `eliminadoAt`
 * viajaba al PATCH. Como solo se quitaba `id`, *toda* la edición del panel
 * devolvía `400 property eliminadoAt should not exist`.
 *
 * Los `*At` de auditoria y el `id` se descartan aqui, en un solo sitio, en vez de
 * en cada formulario. Se dejan fuera de la lista los que existen hoy pero el
 * backend podria exponer en el futuro: `forbidNonWhitelisted` manda, y el
 * servidor es quien decide que se puede escribir.
 */
const CAMPOS_DEL_SERVIDOR = ["id", "eliminadoAt", "createdAt", "updatedAt", "deletedAt"];

function sanear<T extends { id: number }>(
  item: T | Omit<T, "id">,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(item as Record<string, unknown>).filter(
      ([clave]) => !CAMPOS_DEL_SERVIDOR.includes(clave),
    ),
  );
}

/**
 * Rutas de papelera. El contenido usa `/api/<recurso>/papelera` mientras que las
 * colecciones de configuracion cuelgan de `/api/config/papelera/<coleccion>`, y
 * `mensajes` va aparte. Se pasan como `papeleraPath` en lugar de construirlas,
 * porque adivinar el prefijo desde `path` seria fragil.
 *
 * `restaurar` tambien se pasa aparte, y no se adivina. Las dos familias de rutas
 * no siguen la misma forma: el contenido restaura en `POST /api/noticias/:id/restaurar`
 * (fuera de la papelera), mientras que la configuracion restaura en
 * `POST /api/config/papelera/:coleccion/:id/restaurar` (dentro). Construir la URL
 * como `${papeleraPath}/${id}/restaurar` —que es lo que hacia— devolvia 404 en las
 * tres primeras y funcionaba por casualidad en las otras seis.
 */
function httpCrud<T extends { id: number }>(
  path: string,
  papeleraPath?: string,
  restaurar?: (id: number) => string,
): Crud<T> {
  const normalizedPath = path.startsWith("/api/") ? path.slice(4) : path;
  const normalizedPapelera = papeleraPath?.startsWith("/api/") ? papeleraPath.slice(4) : papeleraPath;
  const normalizedRestaurar = restaurar
    ? (id: number) => {
        const url = restaurar(id);
        return url.startsWith("/api/") ? url.slice(4) : url;
      }
    : undefined;
  const conPapelera = papeleraPath !== undefined && restaurar !== undefined;
  return {
    async list() {
      return normalizeList<T>(await http<HttpList<T>>(normalizedPath));
    },
    async create(item) {
      return http<T>(normalizedPath, { method: "POST", body: JSON.stringify(sanear(item)) });
    },
    async update(id, patch) {
      return http<T>(`${normalizedPath}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(sanear(patch as T)),
      });
    },
    async remove(id) {
      await http<void>(`${normalizedPath}/${id}`, { method: "DELETE" });
    },
    ...(conPapelera && normalizedRestaurar
      ? {
          async trashed() {
            return normalizeList<T>(await http<HttpList<T>>(normalizedPapelera!));
          },
          async restore(id: number) {
            return http<T>(normalizedRestaurar(id), { method: "POST" });
          },
        }
      : {}),
  };
}

type HttpPaginado<T> = { data: T[]; meta?: { total: number } };

/**
 * `/api/noticias` está paginado en el servidor. Pedirlo tal cual devolvía solo
 * las primeras 30, y como el listado del panel filtra en el cliente, las
 * noticias que quedaban fuera quedaban invisibles sin ningún aviso.
 * Esta versión recorre todas las páginas antes de devolver la lista.
 */
function httpCrudPaginado<T extends { id: number }>(
  path: string,
  porPagina = 100,
): Crud<T> {
  return {
    async list() {
      const todos: T[] = [];
      let pagina = 1;
      for (;;) {
        const res = await http<HttpPaginado<T>>(
          `${path}?page=${pagina}&perPage=${porPagina}`,
        );
        const lote = res.data ?? [];
        todos.push(...lote);
        const total = res.meta?.total;
        if (lote.length === 0 || (total !== undefined && todos.length >= total)) break;
        pagina += 1;
      }
      return todos;
    },
    create: httpCrud<T>(path).create,
    update: httpCrud<T>(path).update,
    remove: httpCrud<T>(path).remove,
  };
}

/**
 * Colecciones del panel. Solo las que tienen `@DeleteDateColumn` en el backend
 * exponen papelera; `mensajes`, `media` y `users` siguen sin ella a proposito.
 */
const papeleraDe = (recurso: string) => `/config/papelera/${recurso}`;

/** Ruta de restauracion de las colecciones de configuracion. */
const restaurarDe = (recurso: string) => (id: number) => `/config/papelera/${recurso}/${id}/restaurar`;

/** Ruta de restauracion del contenido: cuelga del recurso, no de la papelera. */
const restaurarDeContenido = (recurso: string) => (id: number) => `/${recurso}/${id}/restaurar`;

/**
 * Une un CRUD ya construido —noticias necesita la versión paginada— con sus
 * rutas de papelera, que son idénticas a las de un CRUD normal.
 */
function httpCrudPapelera<T extends { id: number }>(
  path: string,
  base: Crud<T>,
  papeleraPath = `${path}/papelera`,
): Crud<T> {
  const recurso = path.replace(/^\/api\//, "");
  const conPapelera = httpCrud<T>(path, papeleraPath, restaurarDeContenido(recurso));
  return {
    ...base,
    trashed: conPapelera.trashed,
    restore: conPapelera.restore,
  };
}

export const collections = {
  noticias: () =>
    httpCrudPapelera<Noticia>("/api/noticias", httpCrudPaginado<Noticia>("/api/noticias")),
  documentos: () =>
    httpCrud<Documento>(
      "/api/documentos",
      "/api/documentos/papelera",
      restaurarDeContenido("documentos"),
    ),
  convocatorias: () =>
    httpCrud<Convocatoria>(
      "/api/convocatorias",
      "/api/convocatorias/papelera",
      restaurarDeContenido("convocatorias"),
    ),
  stats: () =>
    httpCrud<Stat>("/api/config/stats", papeleraDe("stats"), restaurarDe("stats")),
  municipios: () =>
    httpCrud<Municipio>(
      "/api/config/municipios",
      papeleraDe("municipios"),
      restaurarDe("municipios"),
    ),
  talleres: () =>
    httpCrud<Taller>("/api/config/talleres", papeleraDe("talleres"), restaurarDe("talleres")),
  categorias: () =>
    httpCrud<DocCategoria>(
      "/api/config/doc-categorias",
      papeleraDe("doc-categorias"),
      restaurarDe("doc-categorias"),
    ),
  paginas: () =>
    httpCrud<PaginaProyecto>(
      "/api/config/proyecto-paginas",
      papeleraDe("proyecto-paginas"),
      restaurarDe("proyecto-paginas"),
    ),
  dimensiones: () =>
    httpCrud<Dimension>(
      "/api/config/dimensiones",
      papeleraDe("dimensiones"),
      restaurarDe("dimensiones"),
    ),
  mensajes: () => httpCrud<Mensaje>("/api/mensajes"),
  media: () => httpCrud<Media>("/api/media"),
  users: () => ({
    ...httpCrud<User>("/api/users"),
    create: (item: { email: string; password: string; role: Role }) =>
      http<User>("/api/users", { method: "POST", body: JSON.stringify(item) }),
    update: (id: number, patch: { email?: string; password?: string; role?: Role }) =>
      http<User>(`/api/users/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  }),
};

export { API_BASE, http };

export type ConfigBackend<C> = {
  get(): Promise<C>;
  set(next: C): Promise<C>;
};

function configBackend<C>(path: string): ConfigBackend<C> {
  return {
    get() {
      return http<C>(path);
    },
    set(next) {
      /*
       * Pasa por `sanear` igual que las colecciones.
       *
       * El formulario de ajustes se arma con `setForm({ ...value })`, y `value`
       * es la fila que devuelve el servidor, que trae `id`. Mandarlo en el PUT
       * hacía que **todos** los guardados de los ajustes respondieran
       * `400 property id should not exist`: el botón anunciaba que no se pudo
       * guardar y el cambio se perdía, sin explicación. Las colecciones ya
       * filtraban ese campo; aquí se olvidaron.
       */
      return http<C>(path, {
        method: "PUT",
        body: JSON.stringify(sanear(next as unknown as { id: number })),
      });
    },
  };
}

export const configs = {
  site: () => configBackend<SiteSettings>("/config/site"),
};

export function useCollection<T extends { id: number }>(
  crud: Crud<T>,
  deps: unknown[] = [],
  /**
   * Si es mayor que cero, vuelve a pedir la lista cada tantos milisegundos.
   *
   * Sin esto la lista se pide **una sola vez, al montar**: un mensaje enviado
   * desde el sitio con el backoffice ya abierto no aparecía hasta recargar el
   * navegador, y la bandeja parecía no recibir nada. El sondeo es silencioso (no
   * enciende el `loading`, que vaciaría la lista y mostraría un girador cada
   * medio minuto) y se salta los ticks con la pestaña en segundo plano, donde no
   * hay nadie mirando y el navegador lo estrangula igual.
   */
  pollMs = 0,
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(false);

  // `crud` es un objeto nuevo en cada render (`collections.x()` lo construye),
  // así que se lee por referencia: si entrara en las dependencias del sondeo,
  // el intervalo se recrearía en cada pintado y no llegaría a dispararse.
  const crudRef = useRef(crud);
  crudRef.current = crud;

  // Cada carga lleva un número y solo la última puede escribir el estado, para
  // que una respuesta que llega tarde —porque los `deps` cambiaron mientras
  // estaba en vuelo— no pise a la que vino después. Al desmontar, `vivo` corta
  // cualquier escritura pendiente.
  const generacion = useRef(0);
  const vivo = useRef(true);
  useEffect(() => {
    vivo.current = true;
    return () => {
      vivo.current = false;
    };
  }, []);

  const cargar = useCallback(async (silencioso: boolean) => {
    const mia = ++generacion.current;
    const vigente = () => vivo.current && mia === generacion.current;
    if (silencioso) setActualizando(true);
    else setLoading(true);
    try {
      const list = await crudRef.current.list();
      if (vigente()) setItems(list);
    } catch {
      // En el sondeo se conserva lo que ya había: un fallo de red pasajero no
      // debe vaciar la bandeja. En la carga inicial sí se limpia, para que el
      // `EmptyState` diga la verdad en vez de mostrar filas viejas.
      if (vigente() && !silencioso) setItems([]);
    } finally {
      if (vigente()) {
        setLoading(false);
        setActualizando(false);
      }
    }
  }, []);

  useEffect(() => {
    void cargar(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, cargar]);

  useEffect(() => {
    if (pollMs <= 0) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void cargar(true);
    }, pollMs);
    return () => window.clearInterval(id);
  }, [pollMs, cargar]);

  /**
   * Vuelve a pedir la lista al servidor. Necesario cuando la mutación la hace
   * una función distinta de las de este hook (p. ej. `collections.users()`),
   * porque entonces el estado local no se actualiza solo. Es silencioso: quien
   * llama ya sabe que hay un cambio en camino, y un girador de pantalla completa
   * por encima de la tabla que acaba de moverse se ve peor, no mejor.
   */
  function reload() {
    return cargar(true);
  }

  /** Refresco pedido a mano desde la interfaz. */
  function refrescar() {
    return cargar(true);
  }

  async function create(item: Omit<T, "id">) {
    const created = await crud.create(item);
    setItems((prev) => [created, ...prev]);
    return created;
  }

  async function update(id: number, patch: Partial<T>) {
    const next = await crud.update(id, patch);
    setItems((prev) => prev.map((it) => (it.id === id ? next : it)));
    return next;
  }

  async function remove(id: number) {
    await crud.remove(id);
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  return { items, loading, actualizando, create, update, remove, reload, refrescar };
}

export function useConfig<C>(backend: ConfigBackend<C>) {
  const [value, setValue] = useState<C | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    backend
      .get()
      .then((v) => {
        if (alive) setValue(v);
      })
      .catch(() => {
        if (alive) setValue(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(next: C) {
    const saved = await backend.set(next);
    setValue(saved);
    return saved;
  }

  return { value, set: setValue, save, loading };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}