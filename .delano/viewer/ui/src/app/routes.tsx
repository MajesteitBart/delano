import { FolderIcon, RefreshCwIcon, ShieldAlertIcon } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import type { LiveDocEvent } from "@/app/useLiveEvents"
import type { ViewerRoute } from "@/lib/domain/navigation"
import type {
  DocMeta,
  ProjectIndex,
  ViewerDoc,
  ViewerIndex,
} from "@/lib/domain/types"
import { DocumentReaderPage } from "@/pages/DocumentReaderPage"
import {
  ProjectDocumentsPage,
  ProjectOverviewPage,
  ProjectTasksPage,
  ProjectWorkstreamsPage,
} from "@/pages/ProjectPages"
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
  onBackFromDocument,
  onRefreshDocument,
  onRefreshIndex,
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
  onBackFromDocument: () => void
  onRefreshDocument?: () => void
  onRefreshIndex?: () => void
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
    return (
      <WorkspacePage
        index={index}
        liveEvent={liveEvent}
        view={route.view}
        onOpenDoc={onOpenDoc}
        onOpenProject={onOpenProject}
        onRefreshIndex={onRefreshIndex}
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
        dispatchEnabled={index?.context?.capabilities.dispatch ?? true}
        reviewEnabled={index?.context?.capabilities.review ?? true}
      />
    )
  }

  if (route.kind === "project-tasks") {
    return (
      <ProjectTasksPage
        docs={docsByPath}
        project={activeProject}
        onOpenDoc={onOpenDoc}
        dispatchEnabled={index?.context?.capabilities.dispatch ?? true}
        reviewEnabled={index?.context?.capabilities.review ?? true}
      />
    )
  }

  if (route.kind === "project-research") {
    return (
      <ProjectDocumentsPage
        description="Research findings, plans, and progress captured before or during delivery."
        docs={docsByPath}
        emptyDescription="This project has no indexed research documents."
        emptyTitle="No research"
        onOpenDoc={onOpenDoc}
        paths={activeProject?.outline?.research ?? []}
        project={activeProject}
        title="Research"
      />
    )
  }

  if (route.kind === "project-progress") {
    return (
      <ProjectDocumentsPage
        description="Progress updates and completion evidence for the selected project."
        docs={docsByPath}
        emptyDescription="This project has no indexed progress updates."
        emptyTitle="No progress"
        onOpenDoc={onOpenDoc}
        paths={activeProject?.outline?.progress ?? []}
        project={activeProject}
        title="Progress"
      />
    )
  }

  if (route.kind === "document" && doc) {
    return (
      <DocumentReaderPage
        doc={doc}
        docs={docsByPath}
        liveEvent={liveEvent}
        onBack={onBackFromDocument}
        onOpenActivity={onOpenActivity}
        onOpenDoc={onOpenDoc}
        onRefresh={onRefreshDocument}
        project={activeProject}
        draftScope={{
          repositoryId: index?.context?.repository.id ?? "local",
          worktreeId: index?.context?.worktree.id ?? "local",
        }}
        capabilities={index?.context?.capabilities}
        capabilityDenials={index?.context?.capabilityDenials}
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
