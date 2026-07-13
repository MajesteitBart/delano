import { useCallback, useEffect, useRef, useState } from "react"

import { messageFromError, requestJson } from "@/lib/api"
import type {
  ViewerContext,
  ViewerContextInventory,
  ViewerIndex,
} from "@/lib/domain/types"

const STORAGE_KEY = "delano-viewer-context-v1"
const STORAGE_VERSION = 1

type StoredContext = {
  version: 1
  repositoryId: string
  worktreeId: string
}

type SwitchResponse = { context: ViewerContext; index: ViewerIndex }

function readStoredContext(): StoredContext | null {
  try {
    const value = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "null"
    ) as Partial<StoredContext> | null
    if (
      value?.version === STORAGE_VERSION &&
      typeof value.repositoryId === "string" &&
      typeof value.worktreeId === "string"
    )
      return value as StoredContext
  } catch {
    // Invalid or inaccessible storage is treated as an empty preference.
  }
  return null
}

function storeContext(context: ViewerContext) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        repositoryId: context.repository.id,
        worktreeId: context.worktree.id,
      })
    )
  } catch {
    // The server context remains authoritative when storage is unavailable.
  }
}

function storedSelectionIsAvailable(
  inventory: ViewerContextInventory,
  stored: StoredContext
) {
  const repository = inventory.repositories.find(
    (item) => item.id === stored.repositoryId && item.available
  )
  return repository?.worktrees.some(
    (worktree) =>
      worktree.id === stored.worktreeId &&
      worktree.available !== false &&
      worktree.projectAvailable !== false &&
      worktree.projectState.available
  )
}

export function useViewerIndex() {
  const [index, setIndex] = useState<ViewerIndex | null>(null)
  const [inventory, setInventory] = useState<ViewerContextInventory | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState(false)
  const [error, setError] = useState("")
  const [contextError, setContextError] = useState("")
  const [reloadToken, setReloadToken] = useState(0)
  const initialized = useRef(false)

  const refresh = useCallback(() => setReloadToken((token) => token + 1), [])

  const switchContext = useCallback(
    async (repositoryId: string, worktreeId: string) => {
      setSwitching(true)
      setContextError("")
      setIndex(null)
      try {
        const payload = await requestJson<SwitchResponse>("/api/context", {
          method: "POST",
          body: JSON.stringify({ repositoryId, worktreeId }),
        })
        const nextInventory =
          await requestJson<ViewerContextInventory>("/api/context")
        setIndex(payload.index)
        setInventory(nextInventory)
        storeContext(payload.context)
      } catch (err) {
        setContextError(messageFromError(err))
        try {
          const [nextIndex, nextInventory] = await Promise.all([
            requestJson<ViewerIndex>("/api/index"),
            requestJson<ViewerContextInventory>("/api/context"),
          ])
          setIndex(nextIndex)
          setInventory(nextInventory)
        } catch {
          // Preserve the original, actionable switch failure.
        }
      } finally {
        setSwitching(false)
      }
    },
    []
  )

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [nextIndex, nextInventory] = await Promise.all([
          requestJson<ViewerIndex>("/api/index"),
          requestJson<ViewerContextInventory>("/api/context"),
        ])
        if (cancelled) return

        if (!initialized.current) {
          initialized.current = true
          const stored = readStoredContext()
          const differs =
            stored &&
            (stored.repositoryId !== nextInventory.active.repository.id ||
              stored.worktreeId !== nextInventory.active.worktree.id)
          if (
            stored &&
            differs &&
            storedSelectionIsAvailable(nextInventory, stored)
          ) {
            await switchContext(stored.repositoryId, stored.worktreeId)
            return
          }
        }

        setIndex(nextIndex)
        setInventory(nextInventory)
        storeContext(nextInventory.active)
        setError("")
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
  }, [reloadToken, switchContext])

  return {
    contextError,
    error,
    index,
    inventory,
    loading: loading || switching,
    refresh,
    switchContext,
    switching,
  }
}
