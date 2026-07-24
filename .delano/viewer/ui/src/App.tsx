import { ViewerRoute } from "@/app/routes"
import { useActiveProject } from "@/app/useActiveProject"
import { useDocument } from "@/app/useDocument"
import { useLiveEvents } from "@/app/useLiveEvents"
import { useViewport } from "@/app/useViewport"
import { useViewerIndex } from "@/app/useViewerIndex"
import { useViewerNavigation } from "@/app/useViewerNavigation"
import { AppShell } from "@/components/organisms/AppShell"
import { Topbar } from "@/components/organisms/Topbar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useState } from "react"

import {
  WORKSPACE_NAV,
  type ViewerRoute as ViewerRouteState,
} from "@/lib/domain/navigation"
import type { ProjectIndex, ViewerDoc, ViewerIndex } from "@/lib/domain/types"

function App() {
  const indexState = useViewerIndex()
  const navigation = useViewerNavigation(indexState.index)
  const docState = useDocument(navigation.activePath)
  const live = useLiveEvents({
    generation: indexState.index?.context?.generation,
    onIndexChanged: indexState.refresh,
  })
  const [activityOpen, setActivityOpen] = useState(false)
  const activeProject = useActiveProject(
    indexState.index,
    docState.doc,
    navigation.activeProjectSlug
  )
  const isCompact = useViewport("(max-width: 900px)")
  const error = indexState.error || docState.error
  const topbar = getTopbarState(
    navigation.route,
    activeProject,
    docState.doc,
    indexState.index
  )

  return (
    <TooltipProvider>
      <AppShell
        index={indexState.index}
        contextError={indexState.contextError}
        inventory={indexState.inventory}
        switchingContext={indexState.switching}
        onSwitchContext={indexState.switchContext}
        activeProject={activeProject}
        activePath={navigation.activePath}
        isCompact={isCompact}
        onOpenDoc={navigation.setActivePath}
        onOpenProjectOverview={navigation.openProjectOverview}
        onOpenProjectProgress={navigation.openProjectProgress}
        onOpenProjectResearch={navigation.openProjectResearch}
        onOpenProjectTasks={navigation.openProjectTasks}
        onOpenProjectWorkstreams={navigation.openProjectWorkstreams}
        onOpenWorkspace={navigation.openWorkspace}
        onSelectProject={navigation.selectProject}
        route={navigation.route}
        renderTopbar={({ isCompact, openSidebar }) => (
          <Topbar
            index={indexState.index}
            doc={docState.doc}
            title={topbar.title}
            status={topbar.status}
            updated={topbar.updated}
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
            onRefreshIndex={indexState.refresh}
            liveEvent={live.lastDocEvent}
            onOpenActivity={() => setActivityOpen(true)}
            onOpenDoc={navigation.setActivePath}
            onOpenProject={navigation.openProjectOverviewFor}
            onOpenProjectTasks={navigation.openProjectTasks}
            onOpenProjectWorkstreams={navigation.openProjectWorkstreams}
            route={navigation.route}
          />
        </div>
      </AppShell>
    </TooltipProvider>
  )
}

export default App

function getTopbarState(
  route: ViewerRouteState,
  project: ProjectIndex | null,
  doc: ViewerDoc | null,
  index: ViewerIndex | null
) {
  if (route.kind === "workspace") {
    const item = WORKSPACE_NAV.find((entry) => entry.view === route.view)
    return {
      title: item?.label ?? "Workspace",
      status: null,
      updated: index?.generatedAt,
    }
  }

  if (route.kind === "project-overview") {
    return {
      title: project?.title ?? "Project",
      status: project?.status,
      updated: index?.generatedAt,
    }
  }

  if (route.kind === "project-workstreams") {
    return {
      title: `${project?.title ?? "Project"} workstreams`,
      status: project?.status,
      updated: index?.generatedAt,
    }
  }

  if (route.kind === "project-tasks") {
    return {
      title: `${project?.title ?? "Project"} tasks`,
      status: project?.status,
      updated: index?.generatedAt,
    }
  }

  if (route.kind === "project-research") {
    return {
      title: `${project?.title ?? "Project"} research`,
      status: project?.status,
      updated: index?.generatedAt,
    }
  }

  if (route.kind === "project-progress") {
    return {
      title: `${project?.title ?? "Project"} progress`,
      status: project?.status,
      updated: index?.generatedAt,
    }
  }

  return {
    title: project?.title ?? doc?.title ?? "Document",
    status: doc?.status ?? project?.status,
    updated: doc?.updated ?? index?.generatedAt,
  }
}
