import { ROADMAP_TERMINAL_STATUSES } from "@/lib/domain/roadmap"
import { statusTone } from "@/lib/domain/status"
import type { DocMeta, ProjectIndex, ViewerIndex } from "@/lib/domain/types"

export type WorkstreamMeta = NonNullable<
  NonNullable<ProjectIndex["outline"]>["workstreams"]
>[number]

export type WorkspaceTaskItem = {
  doc: DocMeta
  project: ProjectIndex | null
  workstream: WorkstreamMeta | null
}

export type ProjectStat = {
  project: ProjectIndex
  created?: string | null
  updated?: string
  workstreamCount: number
  taskCount: number
  openTaskCount: number
  primaryPath?: string | null
}

export function selectableProjects(index: ViewerIndex | null) {
  return (index?.projects ?? []).filter(
    (project) =>
      project.outline &&
      !["context", "project", "templates"].includes(project.slug)
  )
}

export function docsByPath(index: ViewerIndex | null) {
  const map = new Map<string, DocMeta>()
  ;(index?.docs ?? []).forEach((doc) => map.set(doc.path, doc))
  return map
}

export function contextDocs(index: ViewerIndex | null) {
  const map = docsByPath(index)
  return (index?.contextPack?.files ?? [])
    .map((file) => map.get(file.path.replace(/^\.project\//, "")))
    .filter((doc): doc is DocMeta => Boolean(doc))
}

export function projectPrimaryPath(project?: ProjectIndex | null) {
  if (!project) return null
  return (
    project.outline?.spec ??
    project.outline?.plan ??
    project.outline?.decisions?.[0] ??
    project.outline?.workstreams?.[0]?.path ??
    project.outline?.unassignedTasks?.[0] ??
    project.outline?.progress?.[0] ??
    project.docs?.[0] ??
    null
  )
}

export function projectStats(index: ViewerIndex | null): ProjectStat[] {
  const map = docsByPath(index)
  return selectableProjects(index).map((project) => {
    const projectDocs = (project.docs ?? [])
      .map((path) => map.get(path))
      .filter(Boolean) as DocMeta[]
    const tasks = projectDocs.filter((doc) => doc.role === "task")
    const latest = projectDocs
      .map((doc) => doc.updated)
      .filter((value): value is string => Boolean(value))
      .sort()
      .at(-1)

    return {
      project,
      created: project.created,
      updated: latest,
      workstreamCount: project.outline?.workstreams?.length ?? 0,
      taskCount: tasks.length,
      openTaskCount: tasks.filter((doc) => isOpenTaskStatus(doc.status)).length,
      primaryPath: projectPrimaryPath(project),
    }
  })
}

export function workspaceTasks(index: ViewerIndex | null) {
  const projects = selectableProjects(index)
  const projectMap = new Map(projects.map((project) => [project.slug, project]))
  const workstreamByTask = new Map<string, WorkstreamMeta>()

  projects.forEach((project) => {
    project.outline?.workstreams?.forEach((workstream) => {
      ;(workstream.tasks ?? []).forEach((path) =>
        workstreamByTask.set(path, workstream)
      )
    })
  })

  return (index?.docs ?? [])
    .filter((doc) => doc.role === "task")
    .map((doc) => ({
      doc,
      project: doc.project ? (projectMap.get(doc.project) ?? null) : null,
      workstream: workstreamByTask.get(doc.path) ?? null,
    }))
}

export function isOpenTaskStatus(status?: string | null) {
  const normalized = String(status ?? "planned").toLowerCase()
  return statusTone(normalized) !== "done" && normalized !== "deferred"
}

export function getWorkspaceModel(index: ViewerIndex | null) {
  const allDocs = index?.docs ?? []
  const tasks = workspaceTasks(index)
  const projects = projectStats(index)
  const context = contextDocs(index)
  const blockers = tasks.filter(
    (item) => statusTone(item.doc.status) === "blocked"
  )
  const openTasks = tasks.filter((item) => isOpenTaskStatus(item.doc.status))
  const warnings = allDocs.filter((doc) => statusTone(doc.status) === "warning")
  const progress = allDocs.filter((doc) => doc.role === "progress")
  const validation = allDocs.filter((doc) => doc.role !== "context")
  const annotations = index?.annotationSummary?.open ?? 0
  const reviews = allDocs.filter((doc) => doc.role === "review")
  const openRoadmapItems = (index?.roadmap?.items ?? []).filter(
    (item) => !ROADMAP_TERMINAL_STATUSES.has(item.status)
  )

  return {
    context,
    projects,
    tasks,
    progress,
    annotations,
    reviews,
    validation,
    warnings,
    blockers,
    counts: {
      context: context.length,
      projects: projects.length,
      roadmap: openRoadmapItems.length,
      tasks: openTasks.length,
      progress: progress.length,
      annotations,
      reviews: index?.reviewSummary?.open ?? 0,
      validation: validation.length,
      warnings: warnings.length,
      blockers: blockers.length,
    },
  }
}

export function sidebarCounts(index: ViewerIndex | null) {
  return getWorkspaceModel(index).counts
}
