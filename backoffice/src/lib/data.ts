import { useEffect, useState } from "react";
import type {
  Convocatoria,
  Dimension,
  DocCategoria,
  Documento,
  Entidad,
  Mensaje,
  Noticia,
  PaginaProyecto,
  SiteSettings,
  Stat,
  Taller,
} from "./types";

const API_BASE: string =
  (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:3000";

export type Crud<T> = {
  list(): Promise<T[]>;
  create(item: Omit<T, "id">): Promise<T>;
  update(id: number, patch: Partial<T>): Promise<T>;
  remove(id: number): Promise<void>;
};

type HttpList<T> = T[] | { data: T[] };

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "content-type": "application/json", accept: "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${path} respondió ${res.status}`);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function normalizeList<T>(raw: HttpList<T>): T[] {
  return Array.isArray(raw) ? raw : raw.data ?? [];
}

function httpCrud<T extends { id: number }>(path: string): Crud<T> {
  return {
    async list() {
      return normalizeList<T>(await http<HttpList<T>>(path));
    },
    async create(item) {
      return http<T>(path, { method: "POST", body: JSON.stringify(item) });
    },
    async update(id, patch) {
      return http<T>(`${path}/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
    },
    async remove(id) {
      await http<void>(`${path}/${id}`, { method: "DELETE" });
    },
  };
}

export const collections = {
  noticias: () => httpCrud<Noticia>("/api/noticias"),
  documentos: () => httpCrud<Documento>("/api/documentos"),
  convocatorias: () => httpCrud<Convocatoria>("/api/convocatorias"),
  stats: () => httpCrud<Stat>("/api/config/stats"),
  entidades: () => httpCrud<Entidad>("/api/config/entidades"),
  talleres: () => httpCrud<Taller>("/api/config/talleres"),
  categorias: () => httpCrud<DocCategoria>("/api/config/doc-categorias"),
  paginas: () => httpCrud<PaginaProyecto>("/api/config/proyecto-paginas"),
  dimensiones: () => httpCrud<Dimension>("/api/config/dimensiones"),
  mensajes: () => httpCrud<Mensaje>("/api/mensajes"),
};

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
      return http<C>(path, { method: "PUT", body: JSON.stringify(next) });
    },
  };
}

export const configs = {
  site: () => configBackend<SiteSettings>("/api/config/site"),
};

export function useCollection<T extends { id: number }>(crud: Crud<T>, deps: unknown[] = []) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    crud
      .list()
      .then((list) => {
        if (alive) setItems(list);
      })
      .catch(() => {
        if (alive) setItems([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

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

  return { items, loading, create, update, remove };
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