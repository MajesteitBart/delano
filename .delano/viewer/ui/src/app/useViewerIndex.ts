import { useEffect, useState } from "react"

import { messageFromError, requestJson } from "@/lib/api"
import type { ViewerIndex } from "@/lib/domain/types"

export function useViewerIndex() {
  const [index, setIndex] = useState<ViewerIndex | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const nextIndex = await requestJson<ViewerIndex>("/api/index")
        if (!cancelled) setIndex(nextIndex)
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
  }, [])

  return { error, index, loading }
}
