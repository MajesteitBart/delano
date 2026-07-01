import { useEffect, useMemo, useState } from "react"

import {
  defaultRoute,
  pickInitialProjectSlug,
  type ViewerRoute,
  type WorkspaceView,
} from "@/lib/domain/navigation"
import type { DocMeta, ViewerIndex } from "@/lib/domain/types"

export function useViewerNavigation(index: ViewerIndex | null) {
  const [activeProjectSlug, setActiveProjectSlug] = useState<string | null>(null)
  const [route, setRoute] = useState<ViewerRoute>(defaultRoute)

  useEffect(() => {
    if (!index || activeProjectSlug) return
    setActiveProjectSlug(pickInitialProjectSlug(index))
    setRoute(defaultRoute())
  }, [activeProjectSlug, index])

  const docsByPath = useMemo(() => {
    const map = new Map<string, DocMeta>()
    index?.docs?.forEach((item) => map.set(item.path, item))
    return map
  }, [index])

  const setActivePath = (path: string) => setRoute({ kind: "document", path })

  const openWorkspace = (view: WorkspaceView) => {
    setRoute({ kind: "workspace", view })
  }

  const openProjectOverview = () => {
    setRoute({ kind: "project-overview" })
  }

  const openProjectWorkstreams = () => {
    setRoute({ kind: "project-workstreams" })
  }

  const openProjectTasks = () => {
    setRoute({ kind: "project-tasks" })
  }

  const selectProject = (slug: string) => {
    setActiveProjectSlug(slug)
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
    route,
    selectProject,
    setActivePath,
  }
}
