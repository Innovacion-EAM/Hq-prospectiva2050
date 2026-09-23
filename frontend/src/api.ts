export interface BackendStatus {
  status: string
  api: string
  database: string
}

export interface ConnectionResult {
  ok: boolean
  data?: BackendStatus
}

export async function getBackendStatus(): Promise<ConnectionResult> {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/`)
    const data = (await res.json()) as BackendStatus
    return { ok: true, data }
  } catch {
    return { ok: false }
  }
}