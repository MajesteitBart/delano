import { useEffect, useMemo, useState } from "react"

import {
  defaultRoute,
  pickInitialProjectSlug,
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

  useEffect(() => {
    if (!index || activeProjectSlug) return
    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return
      setActiveProjectSlug(pickInitialProjectSlug(index))
      setDocumentReturnRoute(null)
      setRoute(defaultRoute())
    })
    return () => {
      cancelled = true
    }
  }, [activeProjectSlug, index])

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

  const openProjectWorkstreams = () => {
    setDocumentReturnRoute(null)
    setRoute({ kind: "project-workstreams" })
  }

  const openProjectTasks = () => {
    setDocumentReturnRoute(null)
    setRoute({ kind: "project-tasks" })
  }

  const selectProject = (slug: string) => {
    setActiveProjectSlug(slug)
    setDocumentReturnRoute(null)
    setRoute({ kind: "project-overview" })
  }

  return {
    activePath: route.kind === "document" ? route.path : null,
    activeProjectSlug,
    docsByPath,
    openProjectOverview,
    openProjectTasks,
    openProjectWorkstreams,
    openWorkspace,
    backFromDocument,
    route,
    selectProject,
    setActivePath,
  }
}
