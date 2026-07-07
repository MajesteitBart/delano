export const TARGET_PROJECT = "delano-viewer-annotations-agent-chat"
export const DEFAULT_WORKSPACE_VIEW = "workspace-projects"

export type WorkspaceView =
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

export const WORKSPACE_NAV: Array<{
  view: WorkspaceView
  label: string
  countKey: "context" | "projects" | "open" | "progress" | "annotations" | "validation" | "warnings" | "blockers"
}> = [
  { view: "workspace-context", label: "Context pack", countKey: "context" },
  { view: "workspace-projects", label: "Projects", countKey: "projects" },
  { view: "workspace-current", label: "Open work", countKey: "open" },
  { view: "workspace-progress", label: "Progress", countKey: "progress" },
  { view: "workspace-annotations", label: "Annotations", countKey: "annotations" },
  { view: "workspace-validation", label: "Validation", countKey: "validation" },
  { view: "workspace-warnings", label: "Warnings", countKey: "warnings" },
  { view: "workspace-blockers", label: "Blockers", countKey: "blockers" },
]

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
  return { kind: "project-overview" }
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
