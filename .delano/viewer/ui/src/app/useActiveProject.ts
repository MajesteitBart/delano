import { useMemo } from "react"

import { TARGET_PROJECT } from "@/lib/domain/navigation"
import type { ViewerDoc, ViewerIndex } from "@/lib/domain/types"

export function useActiveProject(
  index: ViewerIndex | null,
  doc: ViewerDoc | null,
  selectedProjectSlug?: string | null
) {
  return useMemo(() => {
    if (!index?.projects?.length) return null
    return (
      index.projects.find((project) => project.slug === selectedProjectSlug) ??
      index.projects.find((project) => project.slug === doc?.project) ??
      index.projects.find((project) => project.slug === TARGET_PROJECT) ??
      index.projects[0]
    )
  }, [doc?.project, index, selectedProjectSlug])
}
