export const TARGET_PROJECT = "delano-viewer-annotations-agent-chat"
export const DEFAULT_WORKSPACE_VIEW = "workspace-home"

export type WorkspaceView =
  | "workspace-home"
  | "workspace-review"
  | "workspace-plan"
  | "workspace-files"
  | "workspace-context"
  | "workspace-projects"
  | "workspace-current"
  | "workspace-progress"
  | "workspace-annotations"
  | "workspace-validation"
  | "workspace-warnings"
  | "workspace-blockers"

export type ViewerRoute =
  | { kind: "workspace"; view: WorkspaceView }
  | { kind: "project-overview" }
  | { kind: "project-workstreams" }
  | { kind: "project-tasks" }
  | { kind: "document"; path: string }

export type WorkspaceCountKey =
  | "review"
  | "plan"
  | "files"
  | "context"
  | "projects"
  | "open"
  | "progress"
  | "annotations"
  | "validation"
  | "warnings"
  | "blockers"

export const WORKSPACE_NAV: Array<{
  view: WorkspaceView
  label: string
  countKey?: WorkspaceCountKey
}> = [
  { view: "workspace-home", label: "Home" },
  { view: "workspace-review", label: "Review", countKey: "review" },
  { view: "workspace-plan", label: "Plan", countKey: "plan" },
  { view: "workspace-files", label: "Updated files", countKey: "files" },
  { view: "workspace-context", label: "Context pack", countKey: "context" },
  { view: "workspace-projects", label: "Projects", countKey: "projects" },
  { view: "workspace-current", label: "Open work", countKey: "open" },
  { view: "workspace-progress", label: "Progress", countKey: "progress" },
  { view: "workspace-annotations", label: "Annotations", countKey: "annotations" },
  { view: "workspace-validation", label: "Validation", countKey: "validation" },
  { view: "workspace-warnings", label: "Warnings", countKey: "warnings" },
  { view: "workspace-blockers", label: "Blockers", countKey: "blockers" },
]

const WORKSPACE_VIEWS = new Set<string>(WORKSPACE_NAV.map((item) => item.view))

export function isWorkspaceView(value: string): value is WorkspaceView {
  return WORKSPACE_VIEWS.has(value)
}

export function workspaceViewLabel(view: WorkspaceView) {
  return WORKSPACE_NAV.find((item) => item.view === view)?.label ?? "Workspace"
}

type ViewerIndexLike = {
  contextPack?: {
    files?: Array<{ path: string }>
  }
  docs?: Array<{ path: string }>
  projects?: Array<{
    slug: string
    outline?: {
      spec?: string | null
    }
  }>
}

export function pickInitialPath(
  index: ViewerIndexLike,
  targetProject = TARGET_PROJECT
) {
  const projects = index.projects ?? []
  const target = projects.find((project) => project.slug === targetProject) ?? projects[0]
  const contextPath = index.contextPack?.files?.[0]?.path
  return (
    target?.outline?.spec ??
    (contextPath ? stripProjectRoot(contextPath) : null) ??
    index.docs?.[0]?.path ??
    null
  )
}

export function pickInitialProjectSlug(index: ViewerIndexLike, targetProject = TARGET_PROJECT) {
  const projects = index.projects ?? []
  return (
    projects.find((project) => project.slug === targetProject)?.slug ??
    projects.find((project) => project.outline)?.slug ??
    projects[0]?.slug ??
    null
  )
}

export function defaultRoute(): ViewerRoute {
  return { kind: "workspace", view: DEFAULT_WORKSPACE_VIEW }
}

export function normalizeDocPath(path: string) {
  return stripProjectRoot(path)
}

export function openFirst(paths: string[], onOpen: (path: string) => void) {
  const first = paths.find(Boolean)
  if (first) onOpen(first)
}

export function stripProjectRoot(path: string) {
  return path.replace(/^\.project\//, "")
}
