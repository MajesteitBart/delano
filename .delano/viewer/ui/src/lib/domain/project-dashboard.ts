import { statusTone } from "@/lib/domain/status"
import type { DocMeta, ProjectIndex } from "@/lib/domain/types"

export type TaskStateKey =
  "done" | "active" | "blocked" | "planned" | "deferred"

export const TASK_STATE_ORDER: TaskStateKey[] = [
  "done",
  "active",
  "blocked",
  "planned",
  "deferred",
]

export const TASK_STATE_LABELS: Record<TaskStateKey, string> = {
  done: "Done",
  active: "Active",
  blocked: "Blocked",
  planned: "Planned",
  deferred: "Deferred",
}

export type TaskStateCounts = Record<TaskStateKey, number>

export type WorkstreamDashboard = {
  path: string
  id?: string
  title: string
  displayTitle: string
  status?: string | null
  tasks: DocMeta[]
  counts: TaskStateCounts
  total: number
  done: number
  open: number
  blocked: number
  completion: number
}

export type ProjectDashboard = {
  spec: DocMeta | null
  recentEvidence: DocMeta[]
  taskDocs: DocMeta[]
  taskCounts: TaskStateCounts
  taskTotal: number
  openTaskCount: number
  completion: number
  workstreams: WorkstreamDashboard[]
  updated: string | null
}

export function taskState(status?: string | null): TaskStateKey {
  const normalized = String(status ?? "planned")
    .trim()
    .toLowerCase()
  if (statusTone(normalized) === "done") return "done"
  if (statusTone(normalized) === "blocked") return "blocked"
  if (normalized === "deferred") return "deferred"
  if (
    normalized === "active" ||
    normalized === "in-progress" ||
    normalized === "in_progress" ||
    normalized === "review" ||
    normalized === "in-review" ||
    normalized === "in_review" ||
    normalized === "verifying"
  ) {
    return "active"
  }
  return "planned"
}

export function countTaskStates(tasks: DocMeta[]): TaskStateCounts {
  const counts: TaskStateCounts = {
    done: 0,
    active: 0,
    blocked: 0,
    planned: 0,
    deferred: 0,
  }
  for (const task of tasks) counts[taskState(task.status)] += 1
  return counts
}

function taskDocsForPaths(paths: string[], docs: Map<string, DocMeta>) {
  return [...new Set(paths)]
    .map((path) => docs.get(path))
    .filter((doc): doc is DocMeta => Boolean(doc && doc.role === "task"))
}

function completionFor(counts: TaskStateCounts, total: number) {
  return total ? Math.round((counts.done / total) * 100) : 0
}

export function buildProjectDashboard(
  project: ProjectIndex,
  docs: Map<string, DocMeta>
): ProjectDashboard {
  const workstreams = (project.outline?.workstreams ?? []).map((workstream) => {
    const tasks = taskDocsForPaths(workstream.tasks ?? [], docs)
    const counts = countTaskStates(tasks)
    return {
      path: workstream.path,
      id: workstream.id,
      title: workstream.title,
      displayTitle:
        workstream.id &&
        workstream.title
          .toLowerCase()
          .startsWith(`${workstream.id.toLowerCase()} `)
          ? workstream.title.slice(workstream.id.length).trim()
          : workstream.title,
      status: workstream.status,
      tasks,
      counts,
      total: tasks.length,
      done: counts.done,
      open: counts.active + counts.blocked + counts.planned,
      blocked: counts.blocked,
      completion: completionFor(counts, tasks.length),
    }
  })
  const taskPaths = [
    ...workstreams.flatMap((workstream) =>
      workstream.tasks.map((task) => task.path)
    ),
    ...(project.outline?.unassignedTasks ?? []),
  ]
  const taskDocs = taskDocsForPaths(taskPaths, docs)
  const taskCounts = countTaskStates(taskDocs)
  const projectDocs = (project.docs ?? [])
    .map((path) => docs.get(path))
    .filter((doc): doc is DocMeta => Boolean(doc))
  const recentEvidence = (project.outline?.progress ?? [])
    .map((path) => docs.get(path))
    .filter((doc): doc is DocMeta => Boolean(doc))
    .sort((a, b) => String(b.updated ?? "").localeCompare(a.updated ?? ""))
  const updated = projectDocs
    .map((doc) => doc.updated)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1)

  return {
    spec: project.outline?.spec
      ? (docs.get(project.outline.spec) ?? null)
      : null,
    recentEvidence,
    taskDocs,
    taskCounts,
    taskTotal: taskDocs.length,
    openTaskCount: taskCounts.active + taskCounts.blocked + taskCounts.planned,
    completion: completionFor(taskCounts, taskDocs.length),
    workstreams,
    updated: updated ?? null,
  }
}
