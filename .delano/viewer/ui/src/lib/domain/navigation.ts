export const TARGET_PROJECT = "delano-viewer-annotations-agent-chat"
export const DEFAULT_WORKSPACE_VIEW = "workspace-projects"

export type WorkspaceView =
  | "workspace-context"
  | "workspace-projects"
  | "workspace-tasks"
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
  countKey:
    | "context"
    | "projects"
    | "tasks"
    | "progress"
    | "annotations"
    | "validation"
    | "warnings"
    | "blockers"
}> = [
  { view: "workspace-context", label: "Context pack", countKey: "context" },
  { view: "workspace-projects", label: "Projects", countKey: "projects" },
  { view: "workspace-tasks", label: "Tasks", countKey: "tasks" },
  { view: "workspace-progress", label: "Progress", countKey: "progress" },
  {
    view: "workspace-annotations",
    label: "Annotations",
    countKey: "annotations",
  },
  { view: "workspace-validation", label: "Validation", countKey: "validation" },
  { view: "workspace-warnings", label: "Warnings", countKey: "warnings" },
  { view: "workspace-blockers", label: "Blockers", countKey: "blockers" },
]

type ViewerIndexLike = {
  context?: {
    repository: { id: string }
    worktree: { id: string }
  }
  contextPack?: {
    files?: Array<{ path: string }>
  }
  docs?: Array<{ path: string; role?: string }>
  projects?: Array<{
    slug: string
    outline?: {
      spec?: string | null
    }
  }>
}

export const NAVIGATION_STORAGE_KEY = "delano-viewer-navigation"
export const NAVIGATION_STORAGE_VERSION = 2

export type StoredNavigation = {
  version: 2
  repositoryId?: string
  worktreeId?: string
  projectSlug: string | null
  route: ViewerRoute
}

export function restoreStoredNavigation(
  raw: unknown,
  index: ViewerIndexLike
): Pick<StoredNavigation, "projectSlug" | "route"> | null {
  if (!raw || typeof raw !== "object") return null
  const stored = raw as Record<string, unknown>
  if (stored.version !== 1 && stored.version !== NAVIGATION_STORAGE_VERSION)
    return null
  if (
    typeof stored.repositoryId === "string" &&
    stored.repositoryId !== index.context?.repository.id
  )
    return null
  if (
    typeof stored.worktreeId === "string" &&
    stored.worktreeId !== index.context?.worktree.id
  )
    return null

  const projectSlug =
    typeof stored.projectSlug === "string" &&
    index.projects?.some((project) => project.slug === stored.projectSlug)
      ? stored.projectSlug
      : pickInitialProjectSlug(index)
  const candidate = stored.route
  if (candidate === "workspace-current") {
    return {
      projectSlug,
      route: { kind: "workspace", view: "workspace-tasks" },
    }
  }
  if (!candidate || typeof candidate !== "object") return null
  const route = candidate as Record<string, unknown>
  if (route.kind === "workspace") {
    const view =
      route.view === "workspace-current" ? "workspace-tasks" : route.view
    if (WORKSPACE_NAV.some((item) => item.view === view)) {
      return {
        projectSlug,
        route: { kind: "workspace", view: view as WorkspaceView },
      }
    }
    return {
      projectSlug,
      route: { kind: "workspace", view: "workspace-tasks" },
    }
  }
  if (route.kind === "document" && typeof route.path === "string") {
    const doc = index.docs?.find((item) => item.path === route.path)
    if (doc?.role === "progress") {
      return {
        projectSlug,
        route: { kind: "workspace", view: "workspace-progress" },
      }
    }
    if (doc)
      return { projectSlug, route: { kind: "document", path: route.path } }
    return { projectSlug, route: defaultRoute() }
  }
  if (
    ["project-overview", "project-workstreams", "project-tasks"].includes(
      String(route.kind)
    )
  ) {
    return { projectSlug, route: { kind: route.kind } as ViewerRoute }
  }
  return null
}

export function pickInitialPath(
  index: ViewerIndexLike,
  targetProject = TARGET_PROJECT
) {
  const projects = index.projects ?? []
  const target =
    projects.find((project) => project.slug === targetProject) ?? projects[0]
  const contextPath = index.contextPack?.files?.[0]?.path
  return (
    target?.outline?.spec ??
    (contextPath ? stripProjectRoot(contextPath) : null) ??
    index.docs?.[0]?.path ??
    null
  )
}

export function pickInitialProjectSlug(
  index: ViewerIndexLike,
  targetProject = TARGET_PROJECT
) {
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
