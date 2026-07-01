import { Grid2X2Icon } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ProjectIndex } from "@/lib/domain/types"

const HIDDEN_PROJECT_SLUGS = new Set(["context", "project", "templates"])

export function ProjectSelect({
  activeProject,
  onSelectProject,
  projects,
}: {
  activeProject: ProjectIndex | null
  onSelectProject: (slug: string) => void
  projects: ProjectIndex[]
}) {
  const selectableProjects = projects.filter((project) => !HIDDEN_PROJECT_SLUGS.has(project.slug))
  if (!selectableProjects.length) return null

  return (
    <Select value={activeProject?.slug} onValueChange={onSelectProject}>
      <SelectTrigger className="selected-project !h-9 w-full" size="sm" aria-label="Selected project">
        <span className="project-select-icon" aria-hidden="true">
          <Grid2X2Icon />
        </span>
        <SelectValue placeholder="Select project" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {selectableProjects.map((project) => (
            <SelectItem key={project.slug} value={project.slug}>
              {project.title}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
