import { useCallback, useEffect, useState } from "react"

import { messageFromError, requestJson } from "@/lib/api"
import type { ViewerDoc } from "@/lib/domain/types"

export function useDocument(activePath: string | null) {
  const [doc, setDoc] = useState<ViewerDoc | null>(null)
  const [error, setError] = useState("")
  const [reloadToken, setReloadToken] = useState(0)

  const refresh = useCallback(() => setReloadToken((token) => token + 1), [])

  useEffect(() => {
    if (!activePath) {
      setDoc(null)
      setError("")
      return
    }
    const pathToLoad = activePath
    let cancelled = false
    async function loadDoc() {
      try {
        const payload = await requestJson<ViewerDoc>(
          `/api/doc?path=${encodeURIComponent(pathToLoad)}`
        )
        if (!cancelled) {
          setDoc(payload)
          setError("")
        }
      } catch (err) {
        if (!cancelled) setError(messageFromError(err))
      }
    }
    void loadDoc()
    return () => {
      cancelled = true
    }
  }, [activePath, reloadToken])

  return { doc, error, refresh }
}
