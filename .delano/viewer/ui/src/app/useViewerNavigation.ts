import { useEffect, useMemo, useRef, useState } from "react"

import {
  defaultRoute,
  pickInitialProjectSlug,
  type ViewerRoute,
  type WorkspaceView,
} from "@/lib/domain/navigation"
import { decodeHash, encodeRoute } from "@/lib/domain/route-codec"
import type { DocMeta, ViewerIndex } from "@/lib/domain/types"

export function useViewerNavigation(index: ViewerIndex | null) {
  const [activeProjectSlug, setActiveProjectSlug] = useState<string | null>(
    null
  )
  const [route, setRoute] = useState<ViewerRoute>(defaultRoute)
  const [documentReturnRoute, setDocumentReturnRoute] =
    useState<ViewerRoute | null>(null)

  const initializedRef = useRef(false)
  useEffect(() => {
    if (!index || activeProjectSlug) return
    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return
      // Deep links and restored hashes win over the default route; invalid
      // hashes fall back to Home (T-008). Project slugs are validated against
      // the live index before use.
      const decoded = decodeHash(window.location.hash)
      const nextRoute = decoded.route
      const knownSlug =
        decoded.projectSlug &&
        index.projects?.some((project) => project.slug === decoded.projectSlug)
          ? decoded.projectSlug
          : null
      const validDoc =
        nextRoute.kind !== "document" ||
        Boolean(index.docs?.some((doc) => doc.path === nextRoute.path))
      setActiveProjectSlug(knownSlug ?? pickInitialProjectSlug(index))
      setDocumentReturnRoute(null)
      setRoute(validDoc ? nextRoute : defaultRoute())
      initializedRef.current = true
    })
    return () => {
      cancelled = true
    }
  }, [activeProjectSlug, index])

  // Mirror the route into the hash so views stay shareable. Table query
  // params are appended separately by useTableQuery; only a real route change
  // rewrites the path part, which also drops query state so filters never
  // leak between tables (FR-13).
  useEffect(() => {
    if (!initializedRef.current) return
    const nextHash = encodeRoute(route, activeProjectSlug)
    const currentPath = window.location.hash.split("?")[0]
    if (currentPath !== nextHash) {
      window.history.replaceState(null, "", nextHash)
    }
  }, [route, activeProjectSlug])

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
