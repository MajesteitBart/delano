import { useEffect, useMemo, useRef, useState } from "react"

import {
  defaultRoute,
  NAVIGATION_STORAGE_KEY,
  NAVIGATION_STORAGE_VERSION,
  pickInitialProjectSlug,
  restoreStoredNavigation,
  translateNavigation,
  type ViewerRoute,
  type WorkspaceView,
} from "@/lib/domain/navigation"
import type { DocMeta, ViewerIndex } from "@/lib/domain/types"

export function useViewerNavigation(index: ViewerIndex | null) {
  const [activeProjectSlug, setActiveProjectSlug] = useState<string | null>(
    null
  )
  const [route, setRoute] = useState<ViewerRoute>(defaultRoute)
  const [documentReturnRoute, setDocumentReturnRoute] =
    useState<ViewerRoute | null>(null)
  const initializedGeneration = useRef<number | null | undefined>(undefined)
  const navigationRef = useRef<{
    projectSlug: string | null
    route: ViewerRoute
  }>({ projectSlug: null, route: defaultRoute() })
  const previousIndexRef = useRef<ViewerIndex | null>(null)
  const [storageReady, setStorageReady] = useState(false)

  const contextGeneration = index?.context?.generation

  useEffect(() => {
    if (!index) return
    const generation = index.context?.generation ?? null
    if (initializedGeneration.current === generation) return
    const firstInitialization = initializedGeneration.current === undefined
    initializedGeneration.current = generation
    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return
      let restored: ReturnType<typeof restoreStoredNavigation> = null
      if (firstInitialization) {
        try {
          restored = restoreStoredNavigation(
            JSON.parse(localStorage.getItem(NAVIGATION_STORAGE_KEY) ?? "null"),
            index
          )
        } catch {
          // Invalid storage falls back to the current context's defaults.
        }
      }
      const translated = firstInitialization
        ? {
            projectSlug: restored?.projectSlug ?? pickInitialProjectSlug(index),
            route: restored?.route ?? defaultRoute(),
          }
        : translateNavigation(navigationRef.current, index, {
            previousIndex: previousIndexRef.current,
          })
      setActiveProjectSlug(translated.projectSlug)
      setDocumentReturnRoute(null)
      setRoute(translated.route)
      setStorageReady(true)
      previousIndexRef.current = index
    })
    return () => {
      cancelled = true
    }
  }, [contextGeneration, index])

  useEffect(() => {
    navigationRef.current = { projectSlug: activeProjectSlug, route }
  }, [activeProjectSlug, route])

  useEffect(() => {
    if (index) previousIndexRef.current = index
  }, [index])

  useEffect(() => {
    if (!storageReady || !index?.context) return
    try {
      localStorage.setItem(
        NAVIGATION_STORAGE_KEY,
        JSON.stringify({
          version: NAVIGATION_STORAGE_VERSION,
          repositoryId: index.context.repository.id,
          worktreeId: index.context.worktree.id,
          projectSlug: activeProjectSlug,
          route,
        })
      )
    } catch {
      // Navigation remains usable when browser storage is unavailable.
    }
  }, [activeProjectSlug, index?.context, route, storageReady])

  const docsByPath = useMemo(() => {
    const map = new Map<string, DocMeta>()
    index?.docs?.forEach((item) => map.set(item.path, item))
    return map
  }, [index])

  const setActivePath = (path: string) => {
    if (route.kind !== "document") {
      setDocumentReturnRoute(route)
    }
    setRoute({ kind: "document", path })
  }

  const backFromDocument = () => {
    setRoute((current) =>
      current.kind === "document"
        ? (documentReturnRoute ?? defaultRoute())
        : current
    )
    setDocumentReturnRoute(null)
  }

  const openWorkspace = (view: WorkspaceView) => {
    setDocumentReturnRoute(null)
    setRoute({ kind: "workspace", view })
  }

  const openProjectOverview = () => {
    setDocumentReturnRoute(null)
    setRoute({ kind: "project-overview" })
  }

  const openProjectOverviewFor = (slug: string) => {
    setActiveProjectSlug(slug)
    setDocumentReturnRoute(null)
    setRoute({ kind: "project-overview" })
  }

  const openProjectWorkstreams = () => {
    setDocumentReturnRoute(null)
    setRoute({ kind: "project-workstreams" })
  }

  const openProjectTasks = () => {
    setDocumentReturnRoute(null)
    setRoute({ kind: "project-tasks" })
  }

  const openProjectResearch = () => {
    setDocumentReturnRoute(null)
    setRoute({ kind: "project-research" })
  }

  const openProjectProgress = () => {
    setDocumentReturnRoute(null)
    setRoute({ kind: "project-progress" })
  }

  const selectProject = (slug: string) => {
    const translated = index
      ? translateNavigation(navigationRef.current, index, {
          previousIndex: index,
          targetProjectSlug: slug,
        })
      : { projectSlug: slug, route: defaultRoute() }
    setActiveProjectSlug(translated.projectSlug)
    setDocumentReturnRoute(null)
    setRoute(translated.route)
  }

  return {
    activePath: route.kind === "document" ? route.path : null,
    activeProjectSlug,
    docsByPath,
    openProjectOverview,
    openProjectOverviewFor,
    openProjectProgress,
    openProjectResearch,
    openProjectTasks,
    openProjectWorkstreams,
    openWorkspace,
    backFromDocument,
    route,
    selectProject,
    setActivePath,
  }
}
