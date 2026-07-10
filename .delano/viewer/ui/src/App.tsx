import { ViewerRoute } from "@/app/routes"
import { useActiveProject } from "@/app/useActiveProject"
import { useDocument } from "@/app/useDocument"
import { useLiveEvents } from "@/app/useLiveEvents"
import { useViewport } from "@/app/useViewport"
import { useViewerIndex } from "@/app/useViewerIndex"
import { useViewerNavigation } from "@/app/useViewerNavigation"
import { useWorkOverview } from "@/app/useWorkOverview"
import { AppShell } from "@/components/organisms/AppShell"
import { Topbar } from "@/components/organisms/Topbar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useEffect, useMemo, useState } from "react"

import { activityCounts, flattenActivity } from "@/lib/domain/file-activity"
import {
  composeTabTitle,
  fallbackIdentity,
  resolveIdentity,
} from "@/lib/domain/identity"
import {
  workspaceViewLabel,
  type ViewerRoute as ViewerRouteState,
} from "@/lib/domain/navigation"
import type { ProjectIndex, ViewerDoc } from "@/lib/domain/types"

function App() {
  const indexState = useViewerIndex()
  const navigation = useViewerNavigation(indexState.index)
  const docState = useDocument(navigation.activePath)
  const live = useLiveEvents({ onIndexChanged: indexState.refresh })
  const overview = useWorkOverview()
  const [activityOpen, setActivityOpen] = useState(false)
  const activeProject = useActiveProject(
    indexState.index,
    docState.doc,
    navigation.activeProjectSlug
  )
  const isCompact = useViewport("(max-width: 900px)")
  const error = indexState.error || docState.error

  // Server-owned identity (AD-8B): prefer the index contract, then the
  // work-overview payload, then the server-supplied repo basename. The shell
  // never derives identity from routes or URLs.
  const identity = resolveIdentity(
    indexState.index?.viewerIdentity,
    overview.payload?.viewerIdentity,
    fallbackIdentity(indexState.index?.repo)
  )

  const pageTitle = getPageTitle(navigation.route, activeProject, docState.doc)
  useEffect(() => {
    document.title = composeTabTitle(identity, pageTitle)
  }, [identity, pageTitle])

  const filesCount = useMemo(() => {
    if (!overview.payload?.gitAvailable) return undefined
    return activityCounts(flattenActivity(overview.payload, indexState.index)).total
  }, [overview.payload, indexState.index])

  return (
    <TooltipProvider>
      <AppShell
        index={indexState.index}
        activeProject={activeProject}
        activePath={navigation.activePath}
        filesCount={filesCount}
        isCompact={isCompact}
        onOpenDoc={navigation.setActivePath}
        onOpenProjectOverview={navigation.openProjectOverview}
        onOpenProjectTasks={navigation.openProjectTasks}
        onOpenProjectWorkstreams={navigation.openProjectWorkstreams}
        onOpenWorkspace={navigation.openWorkspace}
        onSelectProject={navigation.selectProject}
        route={navigation.route}
        renderTopbar={({ isCompact, openSidebar }) => (
          <Topbar
            index={indexState.index}
            doc={docState.doc}
            identity={identity}
            updated={docState.doc?.updated ?? indexState.index?.generatedAt}
            showSidebarButton={isCompact}
            onOpenSidebar={openSidebar}
            activity={live.activity}
            agentWorking={live.agentWorking}
            activityOpen={activityOpen}
            onActivityOpenChange={setActivityOpen}
            onOpenDoc={navigation.setActivePath}
          />
        )}
      >
        <div className="viewer-stage">
          <ViewerRoute
            activeProject={activeProject}
            doc={docState.doc}
            docsByPath={navigation.docsByPath}
            error={error}
            index={indexState.index}
            loading={indexState.loading}
            onBackFromDocument={navigation.backFromDocument}
            onRefreshDocument={docState.refresh}
            liveEvent={live.lastDocEvent}
            onOpenActivity={() => setActivityOpen(true)}
            onOpenDoc={navigation.setActivePath}
            onOpenProject={navigation.selectProject}
            onOpenProjectTasks={navigation.openProjectTasks}
            onOpenProjectWorkstreams={navigation.openProjectWorkstreams}
            onOpenWorkspace={navigation.openWorkspace}
            overview={overview}
            route={navigation.route}
          />
        </div>
      </AppShell>
    </TooltipProvider>
  )
}

export default App

/** Browser-tab page context; the identity prefix is added by composeTabTitle. */
function getPageTitle(
  route: ViewerRouteState,
  project: ProjectIndex | null,
  doc: ViewerDoc | null
) {
  if (route.kind === "workspace") return workspaceViewLabel(route.view)
  if (route.kind === "project-overview") return project?.title ?? "Project"
  if (route.kind === "project-workstreams") {
    return `${project?.title ?? "Project"} workstreams`
  }
  if (route.kind === "project-tasks") return `${project?.title ?? "Project"} tasks`
  return doc?.title ?? "Document"
}
