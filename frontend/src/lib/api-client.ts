const API_BASE: string =
  (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:3000";

export const API_BASE_URL = API_BASE;

export async function postForm<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}/api/forms/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Error ${res.status}: ${txt.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}
