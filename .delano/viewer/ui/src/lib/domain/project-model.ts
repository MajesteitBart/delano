import type { ProjectIndex } from "@/lib/domain/types"

export function projectPrimaryPath(project?: ProjectIndex | null) {
  if (!project) return null
  return (
    project.outline?.spec ??
    project.outline?.plan ??
    project.outline?.workstreams?.[0]?.path ??
    project.outline?.unassignedTasks?.[0] ??
    project.outline?.progress?.[0] ??
    project.docs?.[0] ??
    null
  )
}
