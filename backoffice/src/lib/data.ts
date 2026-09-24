import { useEffect, useState } from "react";
import type {
  Convocatoria,
  Dimension,
  DocCategoria,
  Documento,
  Entidad,
  Media,
  Mensaje,
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
};

type HttpList<T> = T[] | { data: T[] };

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
  if (!res.ok) throw new Error(`API ${path} respondió ${res.status}`);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function loginRequest(email: string, password: string) {
  return http<{ accessToken: string; user: User }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function uploadFileRequest(file: File): Promise<Media> {
  const form = new FormData();
  form.append("file", file);
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/api/media/uploads`, { method: "POST", body: form, headers });
  if (res.status === 401) {
    clearSession();
    gotoLogin();
  }
  if (!res.ok) throw new Error(`Upload respondió ${res.status}`);
  return res.json() as Promise<Media>;
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