import {
  BanIcon,
  ChevronRightIcon,
  CircleCheckIcon,
  CircleDotIcon,
  CirclePlayIcon,
  Clock3Icon,
  ListTodoIcon,
  TriangleAlertIcon,
} from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import { StatusBadge } from "@/components/atoms/StatusBadge"
import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/molecules/DataTable"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { statusLabel, statusTone } from "@/lib/domain/status"
import type { DocMeta, ProjectIndex, ViewerDoc } from "@/lib/domain/types"
import { dataTableMeta } from "@/lib/data-table"
import { cn } from "@/lib/utils"

type Availability = {
  kind: "active" | "blocked" | "done" | "ready" | "waiting" | "warning"
  label: string
  icon: typeof CirclePlayIcon
}

type WorkstreamTaskRow = {
  availability: Availability
  meta: string
  task: DocMeta
}

export function WorkstreamTaskList({
  doc,
  docs,
  onOpenDoc,
  project,
}: {
  doc: ViewerDoc
  docs: Map<string, DocMeta>
  onOpenDoc: (path: string) => void
  project: ProjectIndex | null
}) {
  const projectSlug = project?.slug ?? doc.project
  const projectTasks = Array.from(docs.values()).filter(
    (item) =>
      item.role === "task" &&
      Boolean(projectSlug) &&
      (item.project === projectSlug ||
        item.path.startsWith(`projects/${projectSlug}/tasks/`))
  )
  const taskById = new Map(
    projectTasks
      .map((task) => [taskIdentifier(task), task] as const)
      .filter(([id]) => Boolean(id))
  )
  const workstream = project?.outline?.workstreams?.find(
    (item) =>
      item.path === doc.path ||
      (doc.workstreamId && item.id === doc.workstreamId)
  )
  const taskPaths =
    workstream?.tasks ??
    projectTasks
      .filter((task) => task.workstreamId === doc.workstreamId)
      .map((task) => task.path)
  const tasks = taskPaths
    .map((path) => docs.get(path))
    .filter((task): task is DocMeta => Boolean(task))
  const availability = new Map(
    tasks.map((task) => [task.path, taskAvailability(task, taskById)])
  )
  const remaining = tasks.filter((task) => statusTone(task.status) !== "done")
  const availableNow = tasks.filter((task) => {
    const kind = availability.get(task.path)?.kind
    return kind === "active" || kind === "ready"
  })
  const rows: WorkstreamTaskRow[] = tasks.map((task) => ({
    availability: availability.get(task.path) ?? {
      kind: "ready",
      label: "Ready",
      icon: CirclePlayIcon,
    },
    meta: taskMeta(task),
    task,
  }))
  const columns: ColumnDef<WorkstreamTaskRow>[] = [
    {
      id: "task",
      accessorFn: (row) =>
        `${taskIdentifier(row.task)} ${row.task.title} ${row.meta}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Task" />
      ),
      cell: ({ row }) => (
        <>
          <Button
            variant="link"
            className="h-auto max-w-full justify-start p-0 text-left whitespace-normal"
            onClick={() => onOpenDoc(row.original.task.path)}
          >
            <span className="mr-2 shrink-0 font-mono text-xs text-muted-foreground">
              {taskIdentifier(row.original.task)}
            </span>
            <span>{row.original.task.title}</span>
          </Button>
          {row.original.meta && (
            <div className="mt-1 text-xs text-muted-foreground">
              {row.original.meta}
            </div>
          )}
        </>
      ),
      filterFn: "includesString",
      meta: dataTableMeta({
        cellClassName: "min-w-[22rem] py-3 whitespace-normal",
        headerClassName: "min-w-[22rem]",
      }),
    },
    {
      id: "status",
      accessorFn: (row) => statusLabel(row.task.status),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <StatusBadge status={row.original.task.status ?? "planned"} />
      ),
      filterFn: "includesString",
      meta: dataTableMeta({
        cellClassName: "min-w-28 py-3",
        headerClassName: "min-w-28",
      }),
    },
    {
      id: "availability",
      accessorFn: (row) => row.availability.label,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Availability" />
      ),
      cell: ({ row }) => {
        const state = row.original.availability
        const StateIcon = state.icon
        return (
          <span
            className={cn(
              "flex items-center gap-1.5 text-xs",
              state.kind === "blocked" && "text-destructive",
              state.kind !== "blocked" && "text-muted-foreground"
            )}
          >
            <StateIcon className="size-3.5" aria-hidden="true" />
            <span>{state.label}</span>
          </span>
        )
      },
      filterFn: "includesString",
      meta: dataTableMeta({
        cellClassName: "min-w-40 py-3",
        headerClassName: "min-w-40",
      }),
    },
    {
      id: "open",
      header: () => <span className="sr-only">Open task</span>,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onOpenDoc(row.original.task.path)}
          aria-label={`Open ${taskIdentifier(row.original.task)} ${row.original.task.title}`}
        >
          <ChevronRightIcon />
        </Button>
      ),
      enableColumnFilter: false,
      enableSorting: false,
      meta: dataTableMeta({
        cellClassName: "w-10 py-3 text-right",
        headerClassName: "w-10",
      }),
    },
  ]

  return (
    <section className="mb-9" aria-labelledby="workstream-tasks-heading">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2
              id="workstream-tasks-heading"
              className="font-heading text-lg font-semibold tracking-tight"
            >
              Tasks in this workstream
            </h2>
            <Badge variant="outline">{tasks.length}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {taskSummary(tasks.length, availableNow.length, remaining.length)}
          </p>
        </div>
      </div>

      {!tasks.length ? (
        <div className="overflow-hidden rounded-lg border">
          <Empty className="min-h-32 rounded-none border-0 py-7">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ListTodoIcon />
              </EmptyMedia>
              <EmptyTitle>No tasks assigned</EmptyTitle>
              <EmptyDescription>
                This workstream has no indexed task contracts.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          emptyMessage="No tasks match the current filters."
          getRowId={(row) => row.task.path}
          pageSize={20}
          showPagination={false}
        />
      )}
    </section>
  )
}

function taskIdentifier(task: DocMeta) {
  const id = task.taskId ?? task.frontmatter?.id
  return typeof id === "string" && id.trim() ? id : "Task"
}

function taskMeta(task: DocMeta) {
  const priority = scalar(task.frontmatter?.priority)
  const estimate = scalar(task.frontmatter?.estimate)
  return [priority ? statusLabel(priority) : null, estimate]
    .filter(Boolean)
    .join(" · ")
}

function taskAvailability(
  task: DocMeta,
  taskById: Map<string, DocMeta>
): Availability {
  const tone = statusTone(task.status)
  if (tone === "done") {
    return { kind: "done", label: "Complete", icon: CircleCheckIcon }
  }
  if (tone === "blocked") {
    return { kind: "blocked", label: "Blocked", icon: BanIcon }
  }
  if (tone === "warning") {
    return {
      kind: "warning",
      label: "Needs attention",
      icon: TriangleAlertIcon,
    }
  }

  const normalizedStatus = String(task.status ?? "")
    .toLowerCase()
    .replace(/[-_]+/g, " ")
  if (["active", "doing", "in progress"].includes(normalizedStatus)) {
    return { kind: "active", label: "In progress", icon: CircleDotIcon }
  }

  const waitingOn = stringArray(task.frontmatter?.depends_on).filter((id) => {
    const dependency = taskById.get(id)
    return !dependency || statusTone(dependency.status) !== "done"
  })
  if (waitingOn.length) {
    return {
      kind: "waiting",
      label: `After ${waitingOn.join(", ")}`,
      icon: Clock3Icon,
    }
  }

  return { kind: "ready", label: "Ready", icon: CirclePlayIcon }
}

function scalar(value: unknown) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value)
  }
  return ""
}

function stringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => scalar(item).trim())
      .filter(Boolean)
  }
  const single = scalar(value).trim()
  return single ? [single] : []
}

function taskSummary(total: number, available: number, remaining: number) {
  if (!total) return "Add tasks to the workstream contract to see them here."
  if (!remaining) return "All tasks are complete."
  const availableLabel = `${available} available now`
  const remainingLabel = `${remaining} remaining`
  return `${availableLabel} · ${remainingLabel}`
}
