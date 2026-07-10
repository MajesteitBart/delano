import { useCallback, useEffect, useState } from "react"

import { messageFromError, requestJson } from "@/lib/api"
import type { WorkOverviewPayload } from "@/lib/domain/file-activity"

export type WorkOverviewState = {
  payload: WorkOverviewPayload | null
  loading: boolean
  /** The endpoint is missing (pre-T-002 server) — not an error. */
  unsupported: boolean
  error: string
  refresh: () => void
}

/**
 * Bounded Git activity + server-owned viewer identity. A 404 marks the
 * contract as not yet available and every consumer degrades gracefully
 * (AC-007); other failures surface as errors with retry.
 */
export function useWorkOverview(): WorkOverviewState {
  const [payload, setPayload] = useState<WorkOverviewPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [unsupported, setUnsupported] = useState(false)
  const [error, setError] = useState("")
  const [reloadToken, setReloadToken] = useState(0)

  const refresh = useCallback(() => setReloadToken((token) => token + 1), [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError("")
      try {
        const response = await fetch("/api/work-overview", {
          headers: { "content-type": "application/json" },
        })
        if (response.status === 404) {
          if (!cancelled) setUnsupported(true)
          return
        }
        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`)
        }
        const next = (await response.json()) as WorkOverviewPayload
        if (!cancelled) {
          setUnsupported(false)
          setPayload(next)
        }
      } catch (err) {
        if (!cancelled) setError(messageFromError(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [reloadToken])

  return { payload, loading, unsupported, error, refresh }
}

/** Fetch one document's markdown for bounded client-side review parsing. */
export async function fetchDocMarkdown(path: string): Promise<string> {
  const payload = await requestJson<{ markdown?: string }>(
    `/api/doc?path=${encodeURIComponent(path)}`
  )
  return payload.markdown ?? ""
}
