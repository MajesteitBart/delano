export async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  })
  const text = await response.text()
  const payload = text ? JSON.parse(text) : null
  if (!response.ok) {
    throw new Error(payload?.error ?? payload?.message ?? `Request failed with ${response.status}`)
  }
  return payload as T
}

export function messageFromError(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}
