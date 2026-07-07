import { FolderIcon, RefreshCwIcon, ShieldAlertIcon } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import type { ViewerRoute } from "@/lib/domain/navigation"
import type {
  DocMeta,
  ProjectIndex,
  ViewerDoc,
  ViewerIndex,
} from "@/lib/domain/types"
import { DocumentReaderPage } from "@/pages/DocumentReaderPage"
import {
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
  loading,
  onOpenDoc,
  onOpenProject,
  onOpenProjectTasks,
  onOpenProjectWorkstreams,
  onBackFromDocument,
  route,
}: {
  activeProject: ProjectIndex | null
  doc: ViewerDoc | null
  docsByPath: Map<string, DocMeta>
  error: string
  index: ViewerIndex | null
  loading: boolean
  onOpenDoc: (path: string) => void
  onOpenProject: (slug: string) => void
  onOpenProjectTasks: () => void
  onOpenProjectWorkstreams: () => void
  onBackFromDocument: () => void
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
    return <DocumentReaderPage doc={doc} onBack={onBackFromDocument} />
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
