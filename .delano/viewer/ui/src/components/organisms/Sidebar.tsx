import {
  CheckCircle2Icon,
  CodeIcon,
  Clock3Icon,
  CompassIcon,
  FileTextIcon,
  FolderIcon,
  FolderOpenIcon,
  HomeIcon,
  ListChecksIcon,
  MessageSquareTextIcon,
  ScaleIcon,
  SearchIcon,
  ShieldAlertIcon,
  TrendingUpIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react"
import { type ReactNode, useMemo } from "react"

import { CountBadge } from "@/components/atoms/CountBadge"
import { ContextSwitcher } from "@/components/molecules/ContextSwitcher"
import { ProjectSelect } from "@/components/molecules/ProjectSelect"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  availableWorkspaceNav,
  normalizeDocPath,
  type ViewerRoute,
  type WorkspaceView,
} from "@/lib/domain/navigation"
import type {
  DocMeta,
  ProjectIndex,
  ViewerContextInventory,
  ViewerIndex,
} from "@/lib/domain/types"
import { sidebarCounts, selectableProjects } from "@/lib/domain/workspace-model"
import { cn } from "@/lib/utils"

const WORKSPACE_ICONS: Record<WorkspaceView, LucideIcon> = {
  "workspace-context": FolderOpenIcon,
  "workspace-projects": CodeIcon,
  "workspace-roadmap": CompassIcon,
  "workspace-tasks": ListChecksIcon,
  "workspace-progress": TrendingUpIcon,
  "workspace-annotations": MessageSquareTextIcon,
  "workspace-reviews": MessageSquareTextIcon,
  "workspace-validation": CheckCircle2Icon,
  "workspace-warnings": ShieldAlertIcon,
  "workspace-blockers": XIcon,
}

export function Sidebar({
  activePath,
  activeProject,
  contextError,
  index,
  inventory,
  onOpenDoc,
  onOpenProjectOverview,
  onOpenProjectProgress,
  onOpenProjectResearch,
  onOpenProjectTasks,
  onOpenProjectWorkstreams,
  onOpenWorkspace,
  onSelectProject,
  onSwitchContext,
  route,
  switchingContext,
}: {
  activePath: string | null
  activeProject: ProjectIndex | null
  contextError?: string
  index: ViewerIndex | null
  inventory: ViewerContextInventory | null
  onOpenDoc: (path: string) => void
  onOpenProjectOverview: () => void
  onOpenProjectProgress: () => void
  onOpenProjectResearch: () => void
  onOpenProjectTasks: () => void
  onOpenProjectWorkstreams: () => void
  onOpenWorkspace: (view: WorkspaceView) => void
  onSelectProject: (slug: string) => void
  onSwitchContext: (repositoryId: string, worktreeId: string) => Promise<void>
  route: ViewerRoute
  switchingContext: boolean
}) {
  const counts = useMemo(() => sidebarCounts(index), [index])
  const projects = useMemo(() => selectableProjects(index), [index])
  const projectDocs = activeProject?.outline
  const contractItems = useMemo(() => {
    if (!projectDocs) return []
    return [
      { id: "spec", label: "Spec", icon: FileTextIcon, path: projectDocs.spec },
      {
        id: "plan",
        label: "Plan",
        icon: ListChecksIcon,
        path: projectDocs.plan,
      },
      ...(projectDocs.decisions ?? []).map((path, index) => ({
        id: `decision-${index}`,
        label: index === 0 ? "Decisions" : `Decisions ${index + 1}`,
        icon: ScaleIcon,
        path,
      })),
    ].filter((item) => item.path)
  }, [projectDocs])

  const progressCount = projectDocs?.progress?.length ?? 0
  const researchCount = projectDocs?.research?.length ?? 0

  const workstreamDocs = useMemo(() => {
    if (!activeProject || !index?.docs) return []
    return index.docs
      .filter(
        (doc) => doc.project === activeProject.slug && doc.role === "workstream"
      )
      .sort((a, b) => a.path.localeCompare(b.path))
  }, [activeProject, index])

  const taskDocs = useMemo(() => {
    if (!activeProject || !index?.docs) return []
    return index.docs
      .filter(
        (doc) => doc.project === activeProject.slug && doc.role === "task"
      )
      .sort((a, b) => a.path.localeCompare(b.path))
  }, [activeProject, index])

  return (
    <aside className="sidebar">
      <div className="brand-lockup">
        <img src="/delano-logo.svg" alt="Delano" />
      </div>
      <ScrollArea className="min-h-0 min-w-0 flex-1">
        <div className="sidebar-scroll-content">
          <ContextSwitcher
            error={contextError}
            inventory={inventory}
            onSwitch={onSwitchContext}
            switching={switchingContext}
          />
          <Separator />
          <NavSection title="Workspace">
            {availableWorkspaceNav(Boolean(index?.roadmap)).map((item) => {
              const Icon = WORKSPACE_ICONS[item.view]
              return (
                <NavButton
                  key={item.view}
                  icon={Icon}
                  label={item.label}
                  count={counts[item.countKey]}
                  active={
                    route.kind === "workspace" && route.view === item.view
                  }
                  onClick={() => onOpenWorkspace(item.view)}
                />
              )
            })}
          </NavSection>
          {activeProject && (
            <NavSection title="Selected project">
              <ProjectSelect
                activeProject={activeProject}
                projects={projects}
                onSelectProject={onSelectProject}
              />
              <Separator className="project-select-divider" />
              <NavButton
                icon={HomeIcon}
                label="Project overview"
                active={route.kind === "project-overview"}
                onClick={onOpenProjectOverview}
              />
            </NavSection>
          )}
          {projectDocs && (
            <NavSection title="Source contracts">
              {contractItems.map((item) => (
                <DocNav
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  path={item.path}
                  activePath={activePath}
                  onOpen={onOpenDoc}
                />
              ))}
              <NavButton
                icon={SearchIcon}
                label="Research"
                count={researchCount}
                active={route.kind === "project-research"}
                onClick={onOpenProjectResearch}
              />
              <NavButton
                icon={FolderIcon}
                label="Workstreams"
                count={workstreamDocs.length || undefined}
                active={route.kind === "project-workstreams"}
                onClick={onOpenProjectWorkstreams}
              />
              {workstreamDocs.map((doc) => (
                <SubDocNav
                  key={doc.path}
                  doc={doc}
                  activePath={activePath}
                  onOpen={onOpenDoc}
                />
              ))}
              <NavButton
                icon={CheckCircle2Icon}
                label="Tasks"
                count={taskDocs.length || undefined}
                active={route.kind === "project-tasks"}
                onClick={onOpenProjectTasks}
              />
              {taskDocs.map((doc) => (
                <SubDocNav
                  key={doc.path}
                  doc={doc}
                  activePath={activePath}
                  onOpen={onOpenDoc}
                />
              ))}
              <Separator />
              <NavButton
                icon={Clock3Icon}
                label="Progress"
                count={progressCount}
                active={route.kind === "project-progress"}
                onClick={onOpenProjectProgress}
              />
            </NavSection>
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}

function NavSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="nav-section">
      <div className="nav-section-title">{title}</div>
      <div className="flex flex-col gap-1">{children}</div>
    </section>
  )
}

function NavButton({
  active,
  count,
  icon: Icon,
  label,
  onClick,
}: {
  active?: boolean
  count?: number
  icon: LucideIcon
  label: string
  onClick?: () => void
}) {
  return (
    <Button
      className={cn("nav-button justify-start", active && "is-active")}
      disabled={!onClick}
      onClick={onClick}
      size="default"
      type="button"
      variant={active ? "default" : "ghost"}
    >
      <Icon data-icon="inline-start" />
      <span className="min-w-0 flex-1 truncate text-left">{label}</span>
      {typeof count === "number" && <CountBadge>{count}</CountBadge>}
    </Button>
  )
}

function SubDocNav({
  activePath,
  doc,
  onOpen,
}: {
  activePath: string | null
  doc: DocMeta
  onOpen: (path: string) => void
}) {
  const docPath = normalizeDocPath(doc.path)
  const id = doc.taskId ?? doc.workstreamId ?? null
  return (
    <button
      type="button"
      className={cn("nav-subitem", activePath === docPath && "is-active")}
      onClick={() => onOpen(docPath)}
      title={doc.title}
    >
      {id && <span className="nav-subitem-id">{id}</span>}
      <span className="min-w-0 flex-1 truncate text-left">{doc.title}</span>
    </button>
  )
}

function DocNav({
  activePath,
  icon,
  label,
  onOpen,
  path,
}: {
  activePath: string | null
  icon: LucideIcon
  label: string
  onOpen: (path: string) => void
  path?: string | null
}) {
  if (!path) return null
  const docPath = normalizeDocPath(path)
  return (
    <NavButton
      icon={icon}
      label={label}
      active={activePath === docPath}
      onClick={() => onOpen(docPath)}
    />
  )
}
