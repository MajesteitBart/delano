// Pure work-overview selectors (AD-3, AD-7): Home, Review, and Plan are
// derived views over canonical task lifecycle state. Nothing here invents or
// persists a status; category membership is recomputed from `status`,
// `depends_on`, and priority on every index refresh.

import { naturalCompare } from "@/lib/domain/table-query"
import { statusTone } from "@/lib/domain/status"
import type { DocMeta, ViewerIndex } from "@/lib/domain/types"
import {
  workspaceTasks,
  type WorkspaceTaskItem,
} from "@/lib/domain/workspace-model"

export type TaskWorkItem = WorkspaceTaskItem & {
  taskId: string | null
  priority: string | null
  estimate: string | null
  dependsOn: string[]
  /** Dependencies that are not complete, as local task IDs. */
  unmetDependencies: string[]
  /** True when every dependency is complete. */
  dependencySafe: boolean
}

export type PlanCategory = "should" | "can" | "could" | "waiting"

export type PlanItem = TaskWorkItem & {
  category: PlanCategory
  /** Short human explanation of why the task is in its category. */
  reason: string
}

export const PLAN_CATEGORY_COPY: Record<
  PlanCategory,
  { label: string; definition: string }
> = {
  should: { label: "Should", definition: "Active work" },
  can: { label: "Can", definition: "Ready with dependencies complete" },
  could: { label: "Could", definition: "Planned and dependency-safe" },
  waiting: { label: "Waiting", definition: "Waiting on dependencies" },
}

export const PLAN_RECOMMENDATION_LIMIT = 3

const PRIORITY_RANK: Record<string, number> = {
  critical: 0,
  urgent: 0,
  high: 1,
  medium: 2,
  normal: 2,
  low: 3,
}

export function priorityRank(priority: string | null | undefined) {
  if (!priority) return 4
  return PRIORITY_RANK[priority.toLowerCase()] ?? 4
}

function frontmatterString(doc: DocMeta, key: string): string | null {
  const value = doc.frontmatter?.[key]
  if (value === null || value === undefined) return null
  const text = Array.isArray(value) ? value.join(", ") : String(value)
  return text.trim() || null
}

function normalizedStatus(doc: DocMeta) {
  return String(doc.status ?? "").toLowerCase().trim()
}

export function isInProgress(doc: DocMeta) {
  const status = normalizedStatus(doc)
  return status.includes("progress") || status === "active" || status === "doing"
}

export function isReady(doc: DocMeta) {
  return normalizedStatus(doc) === "ready"
}

export function isPlanned(doc: DocMeta) {
  const status = normalizedStatus(doc)
  return status === "planned" || status === "open" || status === ""
}

export function isDeferred(doc: DocMeta) {
  return normalizedStatus(doc).includes("defer")
}

export function isDone(doc: DocMeta) {
  return statusTone(doc.status) === "done"
}

export function isBlocked(doc: DocMeta) {
  return statusTone(doc.status) === "blocked"
}

/** Split `depends_on` entries like "T-002 T-003" or "T-002, T-003" into IDs. */
export function dependencyIds(dependsOn: string[] | undefined) {
  return (dependsOn ?? [])
    .flatMap((entry) => String(entry).split(/[\s,]+/))
    .map((entry) => entry.trim())
    .filter(Boolean)
}

export function taskWorkItems(index: ViewerIndex | null): TaskWorkItem[] {
  const tasks = workspaceTasks(index)
  // Dependencies use local task IDs within one project (Delano contract).
  const doneByProject = new Map<string, Set<string>>()
  for (const item of tasks) {
    const project = item.doc.project ?? ""
    if (!doneByProject.has(project)) doneByProject.set(project, new Set())
    if (item.doc.taskId && isDone(item.doc)) {
      doneByProject.get(project)!.add(item.doc.taskId)
    }
  }

  return tasks.map((item) => {
    const ids = dependencyIds(item.doc.dependsOn)
    const done = doneByProject.get(item.doc.project ?? "") ?? new Set<string>()
    const unmet = ids.filter((id) => !done.has(id))
    return {
      ...item,
      taskId: item.doc.taskId ?? null,
      priority: frontmatterString(item.doc, "priority"),
      estimate: frontmatterString(item.doc, "estimate"),
      dependsOn: ids,
      unmetDependencies: unmet,
      dependencySafe: unmet.length === 0,
    }
  })
}

/** Deterministic ranking: active first, then priority, natural IDs, stable path. */
export function compareByRank(a: TaskWorkItem, b: TaskWorkItem) {
  const active = Number(isInProgress(b.doc)) - Number(isInProgress(a.doc))
  if (active !== 0) return active
  const priority = priorityRank(a.priority) - priorityRank(b.priority)
  if (priority !== 0) return priority
  const project = naturalCompare(a.doc.project ?? "", b.doc.project ?? "")
  if (project !== 0) return project
  const task = naturalCompare(a.taskId ?? "￿", b.taskId ?? "￿")
  if (task !== 0) return task
  return naturalCompare(a.doc.path, b.doc.path)
}

/**
 * Mutually exclusive Plan categories (FR-11). `ready` alone is not trusted:
 * dependency safety is re-checked against canonical task state.
 */
export function planItems(index: ViewerIndex | null): PlanItem[] {
  const items = taskWorkItems(index).filter(
    (item) => !isDone(item.doc) && !isDeferred(item.doc)
  )

  const inProgress = items.filter((item) => isInProgress(item.doc))
  const safeReady = items
    .filter((item) => isReady(item.doc) && item.dependencySafe)
    .sort(compareByRank)
  const recommended = safeReady.slice(0, PLAN_RECOMMENDATION_LIMIT)
  const remainingReady = safeReady.slice(PLAN_RECOMMENDATION_LIMIT)
  const couldItems = items.filter(
    (item) => isPlanned(item.doc) && !isReady(item.doc) && !isInProgress(item.doc) && !isBlocked(item.doc) && item.dependencySafe
  )
  const waitingItems = items.filter(
    (item) =>
      isBlocked(item.doc) ||
      (!item.dependencySafe && !isInProgress(item.doc))
  )

  const waitingReason = (item: TaskWorkItem) =>
    item.unmetDependencies.length
      ? `Waiting on ${item.unmetDependencies.join(", ")}`
      : "Blocked"

  const assigned: PlanItem[] = [
    ...inProgress.map((item) => ({
      ...item,
      category: "should" as const,
      reason: "Active work",
    })),
    ...recommended.map((item) => ({
      ...item,
      category: "should" as const,
      reason: "Ready, dependencies complete",
    })),
    ...remainingReady.map((item) => ({
      ...item,
      category: "can" as const,
      reason: "Ready, dependencies complete",
    })),
    ...couldItems.map((item) => ({
      ...item,
      category: "could" as const,
      reason: "Planned, dependencies complete",
    })),
    ...waitingItems.map((item) => ({
      ...item,
      category: "waiting" as const,
      reason: waitingReason(item),
    })),
  ]

  // A task appears in exactly one category; in-progress wins over any overlap.
  const seen = new Set<string>()
  return assigned.filter((item) => {
    if (seen.has(item.doc.path)) return false
    seen.add(item.doc.path)
    return true
  })
}

export function planCategoryCounts(items: PlanItem[]) {
  const counts: Record<PlanCategory, number> = {
    should: 0,
    can: 0,
    could: 0,
    waiting: 0,
  }
  for (const item of items) counts[item.category] += 1
  return counts
}

/** Recently completed tasks, newest completion first (Review queue). */
export function reviewQueue(index: ViewerIndex | null): TaskWorkItem[] {
  return taskWorkItems(index)
    .filter((item) => isDone(item.doc))
    .sort(
      (a, b) =>
        String(b.doc.updated ?? "").localeCompare(String(a.doc.updated ?? "")) ||
        naturalCompare(a.doc.path, b.doc.path)
    )
}

export type HomeModel = {
  current: TaskWorkItem[]
  recentlyDone: TaskWorkItem[]
  upNext: PlanItem[]
}

export const HOME_ROW_LIMIT = 5

/** Calm Home composition (FR-9): one Now surface, small recent + next lists. */
export function homeModel(index: ViewerIndex | null): HomeModel {
  const items = taskWorkItems(index)
  const plan = planItems(index)
  const upNext = plan
    .filter((item) => !isInProgress(item.doc))
    .sort((a, b) => {
      const order: Record<PlanCategory, number> = {
        should: 0,
        can: 1,
        could: 2,
        waiting: 3,
      }
      return order[a.category] - order[b.category] || compareByRank(a, b)
    })

  return {
    current: items.filter((item) => isInProgress(item.doc)).sort(compareByRank),
    recentlyDone: reviewQueue(index).slice(0, HOME_ROW_LIMIT),
    upNext: upNext.slice(0, HOME_ROW_LIMIT),
  }
}

// Fixture graph exercising every category boundary; used by domain checks.
export const PLAN_FIXTURE_INDEX: ViewerIndex = {
  repo: "demo",
  generatedAt: "2026-07-10T10:00:00Z",
  projects: [
    {
      slug: "demo",
      title: "Demo",
      outline: { spec: "projects/demo/spec.md", workstreams: [] },
      docs: [],
    },
  ],
  docs: [
    task("T-001", "in-progress", [], "high"),
    task("T-002", "ready", ["T-001"], "high"),
    task("T-003", "ready", ["T-099"], "medium"),
    task("T-004", "planned", ["T-000"], "low"),
    task("T-005", "blocked", [], "high"),
    task("T-006", "complete", [], "high"),
    task("T-007", "deferred", [], "low"),
    task("T-000", "complete", [], "high"),
    task("T-008", "ready", [], "low"),
    task("T-009", "ready", [], "medium"),
    task("T-010", "ready", [], "critical"),
    task("T-011", "ready", [], "high"),
  ],
}

function task(
  id: string,
  status: string,
  dependsOn: string[],
  priority: string
): DocMeta {
  return {
    path: `projects/demo/tasks/${id}.md`,
    title: `Task ${id}`,
    status,
    role: "task",
    project: "demo",
    taskId: id,
    dependsOn,
    updated: "2026-07-10T09:00:00Z",
    frontmatter: { id, status, priority },
  }
}
