import {
  ChevronDownIcon,
  ChevronRightIcon,
  GitBranchIcon,
  ListChecksIcon,
} from "lucide-react"

import { StatusBadge } from "@/components/atoms/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { statusLabel } from "@/lib/domain/status"
import type { ProjectIndex, ViewerDoc } from "@/lib/domain/types"
import { cn } from "@/lib/utils"

export function TaskContextPanel({
  doc,
  onOpenDoc,
  onOpenAcceptanceCriteria,
  project,
}: {
  doc: ViewerDoc
  onOpenDoc: (path: string) => void
  onOpenAcceptanceCriteria?: () => void
  project: ProjectIndex | null
}) {
  const workstreamId =
    scalar(doc.workstreamId) || scalar(doc.frontmatter?.workstream)
  const workstream = project?.outline?.workstreams?.find(
    (item) =>
      item.tasks?.includes(doc.path) ||
      (workstreamId && item.id === workstreamId)
  )
  const priority = scalar(doc.frontmatter?.priority)
  const estimate = scalar(doc.frontmatter?.estimate)
  const progress = acceptanceProgress(doc.body || doc.markdown)
  const criteriaIds = stringArray(doc.frontmatter?.acceptance_criteria_ids)
  const details = taskDetails(doc)

  return (
    <Card size="sm" className="mb-5 gap-0 py-0" aria-label="Task context">
      <Collapsible key={doc.path} defaultOpen={false}>
        <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b py-3">
          <div className="min-w-0">
            <div className="text-sm font-medium">Task context</div>
            <div className="truncate text-xs text-muted-foreground">
              Parent workstream and task metadata
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {scalar(doc.taskId) || scalar(doc.frontmatter?.id) || "Task"}
            </Badge>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle task context"
              >
                <ChevronDownIcon className="transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b py-3">
            <div className="min-w-0">
              <div className="mb-0.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Parent workstream
              </div>
              {workstream ? (
                <button
                  type="button"
                  className="group flex max-w-full items-center gap-1 text-left text-sm font-medium hover:underline"
                  onClick={() => onOpenDoc(workstream.path)}
                >
                  <GitBranchIcon className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">
                    {workstream.id ? `${workstream.id} · ` : ""}
                    {workstream.title}
                  </span>
                  <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </button>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {workstreamId
                    ? `${workstreamId} · Contract not indexed`
                    : "Unassigned"}
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="grid grid-cols-2 gap-x-5 gap-y-3 py-3 sm:grid-cols-4">
            <ContextValue label="Status">
              <StatusBadge status={doc.status ?? "planned"} />
            </ContextValue>
            <ContextValue label="Priority">
              {priority ? statusLabel(priority) : "Not set"}
            </ContextValue>
            <ContextValue label="Estimate">
              {estimate || "Not set"}
            </ContextValue>
            <button
              type="button"
              className={cn(
                "min-w-0 text-left",
                onOpenAcceptanceCriteria &&
                  "group cursor-pointer rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              )}
              onClick={onOpenAcceptanceCriteria}
              disabled={!onOpenAcceptanceCriteria}
            >
              <span className="mb-1 flex items-center gap-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                <ListChecksIcon className="size-3.5" />
                Acceptance criteria
              </span>
              <span
                className={cn(
                  "block text-sm font-medium",
                  onOpenAcceptanceCriteria && "group-hover:underline"
                )}
              >
                {progress.total
                  ? `${progress.done}/${progress.total} complete`
                  : criteriaIds.length
                    ? `${criteriaIds.length} linked`
                    : "None listed"}
              </span>
              {criteriaIds.length > 0 && (
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {criteriaIds.join(", ")}
                </span>
              )}
            </button>
          </CardContent>

          {details.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t bg-muted/20 px-3 py-2.5">
              {details.map((detail) => (
                <Badge key={detail} variant="outline" className="font-normal">
                  {detail}
                </Badge>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

function ContextValue({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <div className="min-w-0">
      <div className="mb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </div>
      <div className="truncate text-sm font-medium">{children}</div>
    </div>
  )
}

function taskDetails(doc: ViewerDoc) {
  const frontmatter = doc.frontmatter ?? {}
  const details: string[] = []
  const owner = scalar(frontmatter.owner)
  const story = scalar(frontmatter.story_id)
  const mode = scalar(frontmatter.operating_mode)
  const dependsOn = stringArray(frontmatter.depends_on)
  const conflictsWith = stringArray(frontmatter.conflicts_with)
  const linearIssue = scalar(frontmatter.linear_issue_id)
  const githubIssue = scalar(frontmatter.github_issue)
  const githubPr = scalar(frontmatter.github_pr)

  if (owner) details.push(`Owner ${owner}`)
  if (story) details.push(`Story ${story}`)
  if (mode) details.push(`Mode ${statusLabel(mode)}`)
  if (frontmatter.parallel === true) details.push("Parallel-safe")
  if (dependsOn.length) details.push(`Depends on ${dependsOn.join(", ")}`)
  if (conflictsWith.length) {
    details.push(`Conflicts with ${conflictsWith.join(", ")}`)
  }
  if (linearIssue) details.push(`Linear ${linearIssue}`)
  if (githubIssue) details.push(`Issue ${githubIssue}`)
  if (githubPr) details.push(`PR ${githubPr}`)

  return details
}

function acceptanceProgress(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n")
  const start = lines.findIndex((line) => /^##\s+Acceptance Criteria\s*$/i.test(line))
  if (start < 0) return { done: 0, total: 0 }

  let done = 0
  let total = 0
  for (const line of lines.slice(start + 1)) {
    if (/^##\s+/.test(line)) break
    const item = line.match(/^\s*[-*]\s+\[([ xX])\]\s+/)
    if (!item) continue
    total += 1
    if (item[1].toLowerCase() === "x") done += 1
  }
  return { done, total }
}

function scalar(value: unknown) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim()
  }
  return ""
}

function stringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => scalar(item)).filter(Boolean)
  }
  const single = scalar(value)
  return single ? [single] : []
}
