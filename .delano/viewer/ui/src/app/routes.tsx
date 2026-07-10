import { FolderIcon, RefreshCwIcon, ShieldAlertIcon } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import type { LiveDocEvent } from "@/app/useLiveEvents"
import type { WorkOverviewState } from "@/app/useWorkOverview"
import type { ViewerRoute, WorkspaceView } from "@/lib/domain/navigation"
import type {
  DocMeta,
  ProjectIndex,
  ViewerDoc,
  ViewerIndex,
} from "@/lib/domain/types"
import { DocumentReaderPage } from "@/pages/DocumentReaderPage"
import { HomePage } from "@/pages/HomePage"
import { PlanPage } from "@/pages/PlanPage"
import {
  ProjectOverviewPage,
  ProjectTasksPage,
  ProjectWorkstreamsPage,
} from "@/pages/ProjectPages"
import { ReviewPage } from "@/pages/ReviewPage"
import { UpdatedFilesPage } from "@/pages/UpdatedFilesPage"
import { WorkspacePage } from "@/pages/WorkspacePage"

export function ViewerRoute({
  activeProject,
  doc,
  docsByPath,
  error,
  index,
  liveEvent,
  loading,
  onOpenActivity,
  onOpenDoc,
  onOpenProject,
  onOpenProjectTasks,
  onOpenProjectWorkstreams,
  onOpenWorkspace,
  onBackFromDocument,
  onRefreshDocument,
  overview,
  route,
}: {
  activeProject: ProjectIndex | null
  doc: ViewerDoc | null
  docsByPath: Map<string, DocMeta>
  error: string
  index: ViewerIndex | null
  liveEvent?: LiveDocEvent | null
  loading: boolean
  onOpenActivity?: () => void
  onOpenDoc: (path: string) => void
  onOpenProject: (slug: string) => void
  onOpenProjectTasks: () => void
  onOpenProjectWorkstreams: () => void
  onOpenWorkspace: (view: WorkspaceView) => void
  onBackFromDocument: () => void
  onRefreshDocument?: () => void
  overview: WorkOverviewState
  route: ViewerRoute
}) {
  if (loading) {
    return (
      <Empty className="min-h-[420px]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <RefreshCwIcon />
          </EmptyMedia>
          <EmptyTitle>Loading viewer</EmptyTitle>
          <EmptyDescription>Reading Delano project contracts.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (error) {
    return (
      <Empty className="min-h-[420px]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ShieldAlertIcon />
          </EmptyMedia>
          <EmptyTitle>Viewer unavailable</EmptyTitle>
          <EmptyDescription>{error}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (route.kind === "workspace") {
    if (route.view === "workspace-home") {
      return (
        <HomePage
          index={index}
          overview={overview}
          onOpenDoc={onOpenDoc}
          onOpenProject={onOpenProject}
          onOpenWorkspace={onOpenWorkspace}
        />
      )
    }
    if (route.view === "workspace-review") {
      return (
        <ReviewPage
          index={index}
          overview={overview}
          onOpenDoc={onOpenDoc}
          onOpenProject={onOpenProject}
        />
      )
    }
    if (route.view === "workspace-plan") {
      return (
        <PlanPage index={index} onOpenDoc={onOpenDoc} onOpenProject={onOpenProject} />
      )
    }
    if (route.view === "workspace-files") {
      return (
        <UpdatedFilesPage index={index} overview={overview} onOpenDoc={onOpenDoc} />
      )
    }
    return (
      <WorkspacePage
        index={index}
        view={route.view}
        onOpenDoc={onOpenDoc}
        onOpenProject={onOpenProject}
      />
    )
  }

  if (route.kind === "project-overview") {
    return (
      <ProjectOverviewPage
        index={index}
        project={activeProject}
        onOpenDoc={onOpenDoc}
        onOpenTasks={onOpenProjectTasks}
        onOpenWorkstreams={onOpenProjectWorkstreams}
      />
    )
  }

  if (route.kind === "project-workstreams") {
    return (
      <ProjectWorkstreamsPage
        docs={docsByPath}
        project={activeProject}
        onOpenDoc={onOpenDoc}
      />
    )
  }

  if (route.kind === "project-tasks") {
    return (
      <ProjectTasksPage
        docs={docsByPath}
        project={activeProject}
        onOpenDoc={onOpenDoc}
      />
    )
  }

  if (route.kind === "document" && doc) {
    return (
      <DocumentReaderPage
        doc={doc}
        liveEvent={liveEvent}
        onBack={onBackFromDocument}
        onOpenActivity={onOpenActivity}
        onRefresh={onRefreshDocument}
      />
    )
  }

  return (
    <Empty className="min-h-[420px]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderIcon />
        </EmptyMedia>
        <EmptyTitle>No document selected</EmptyTitle>
        <EmptyDescription>
          Select a contract from the workspace sidebar.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
