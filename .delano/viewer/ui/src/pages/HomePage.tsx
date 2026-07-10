import { CircleDotIcon, ListChecksIcon, SparklesIcon } from "lucide-react"
import { useMemo } from "react"

import type { WorkOverviewState } from "@/app/useWorkOverview"
import { StatusBadge } from "@/components/atoms/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate, relativeTime } from "@/lib/domain/dates"
import { activityCounts, flattenActivity } from "@/lib/domain/file-activity"
import type { WorkspaceView } from "@/lib/domain/navigation"
import type { ViewerIndex } from "@/lib/domain/types"
import {
  homeModel,
  PLAN_CATEGORY_COPY,
  type PlanItem,
  type TaskWorkItem,
} from "@/lib/domain/work-selectors"

/**
 * Calm default route (FR-9): one dominant Now surface, a compact recent
 * delivery queue, and a concise Up next list. Full portfolio tables stay in
 * Review, Plan, and Updated Files.
 */
export function HomePage({
  index,
  onOpenDoc,
  onOpenProject,
  onOpenWorkspace,
  overview,
}: {
  index: ViewerIndex | null
  onOpenDoc: (path: string) => void
  onOpenProject: (slug: string) => void
  onOpenWorkspace: (view: WorkspaceView) => void
  overview: WorkOverviewState
}) {
  const model = useMemo(() => homeModel(index), [index])
  const activity = useMemo(
    () => flattenActivity(overview.payload, index),
    [overview.payload, index]
  )
  const workingTreeCount = activityCounts(activity).workingTree

  return (
    <section className="workspace-page">
      <div className="page-heading">
        <div className="eyebrow">Workspace</div>
        <h2>Home</h2>
        <p>Current delivery, recent changes, and the next safe work.</p>
      </div>

      <Card>
        <CardContent>
          <div className="table-result-heading">Current work</div>
          {!model.current.length && !workingTreeCount ? (
            <HomeEmpty
              icon={<CircleDotIcon />}
              title="Nothing in progress"
              description="No task is currently marked in progress. Pick the next safe work from Plan."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {model.current.map((item) => (
                  <TableRow key={item.doc.path}>
                    <TableCell className="max-w-[440px]">
                      <TaskLink item={item} onOpenDoc={onOpenDoc} />
                      {item.workstream && (
                        <div className="text-xs text-muted-foreground">
                          {item.workstream.id ? `${item.workstream.id} · ` : ""}
                          {item.workstream.title}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <ProjectLink item={item} onOpenProject={onOpenProject} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.doc.status ?? "planned"} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {relativeTime(item.doc.updated)}
                    </TableCell>
                  </TableRow>
                ))}
                {workingTreeCount > 0 && (
                  <TableRow>
                    <TableCell>Working tree</TableCell>
                    <TableCell className="text-muted-foreground">
                      {workingTreeCount} uncommitted file
                      {workingTreeCount === 1 ? "" : "s"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">Observed now</TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        className="h-auto px-0"
                        onClick={() => onOpenWorkspace("workspace-files")}
                      >
                        Open Updated files
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter>
          <span className="table-pagination-count">
            {model.current.length} active task{model.current.length === 1 ? "" : "s"}
          </span>
        </CardFooter>
      </Card>

      <div className="home-split">
        <Card>
          <CardContent>
            <div className="table-result-heading">Recent delivery</div>
            {!model.recentlyDone.length ? (
              <HomeEmpty
                icon={<ListChecksIcon />}
                title="No completed tasks yet"
                description="Completed tasks appear here for review."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {model.recentlyDone.map((item) => (
                    <TableRow key={item.doc.path}>
                      <TableCell className="max-w-[280px]">
                        <TaskLink item={item} onOpenDoc={onOpenDoc} />
                      </TableCell>
                      <TableCell>
                        <ProjectLink item={item} onOpenProject={onOpenProject} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(item.doc.updated)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter>
            <Button
              variant="link"
              className="h-auto px-0"
              onClick={() => onOpenWorkspace("workspace-review")}
            >
              Open Review
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardContent>
            <div className="table-result-heading">Up next</div>
            {!model.upNext.length ? (
              <HomeEmpty
                icon={<SparklesIcon />}
                title="Nothing queued"
                description="No upcoming task is currently derivable from the queue."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Why</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {model.upNext.map((item) => (
                    <TableRow key={item.doc.path}>
                      <TableCell className="max-w-[280px]">
                        <TaskLink item={item} onOpenDoc={onOpenDoc} />
                        {item.project && (
                          <div className="truncate text-xs text-muted-foreground">
                            {item.project.title}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.doc.status ?? "planned"} />
                      </TableCell>
                      <TableCell className="max-w-[180px]">
                        <span
                          className="block truncate text-xs text-muted-foreground"
                          title={upNextReason(item)}
                        >
                          {upNextReason(item)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter>
            <Button
              variant="link"
              className="h-auto px-0"
              onClick={() => onOpenWorkspace("workspace-plan")}
            >
              Open Plan
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  )
}

function upNextReason(item: PlanItem) {
  if (item.category === "waiting") return item.reason
  return PLAN_CATEGORY_COPY[item.category].definition
}

function TaskLink({
  item,
  onOpenDoc,
}: {
  item: TaskWorkItem
  onOpenDoc: (path: string) => void
}) {
  return (
    <Button
      variant="link"
      className="h-auto max-w-full justify-start gap-2 px-0 text-left"
      onClick={() => onOpenDoc(item.doc.path)}
    >
      {item.taskId && <span className="font-mono text-xs text-muted-foreground">{item.taskId}</span>}
      <span className="truncate">{item.doc.title}</span>
    </Button>
  )
}

function ProjectLink({
  item,
  onOpenProject,
}: {
  item: TaskWorkItem
  onOpenProject: (slug: string) => void
}) {
  if (!item.project) return <span className="text-muted-foreground">None</span>
  return (
    <Button
      variant="link"
      className="h-auto max-w-full justify-start px-0 text-left"
      onClick={() => onOpenProject(item.project!.slug)}
    >
      <span className="truncate">{item.project.title}</span>
    </Button>
  )
}

function HomeEmpty({
  description,
  icon,
  title,
}: {
  description: string
  icon: React.ReactNode
  title: string
}) {
  return (
    <Empty className="min-h-[180px] border border-dashed bg-muted/20">
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
