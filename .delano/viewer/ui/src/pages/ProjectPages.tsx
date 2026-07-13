import { FileTextIcon, FolderIcon, ListChecksIcon } from "lucide-react"
import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { HandoverMenu } from "@/components/molecules/HandoverMenu"
import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/molecules/DataTable"
import { StatusBadge } from "@/components/atoms/StatusBadge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { formatDate } from "@/lib/domain/dates"
import { statusLabel, statusTone } from "@/lib/domain/status"
import type { DocMeta, ProjectIndex, ViewerIndex } from "@/lib/domain/types"
import { docsByPath } from "@/lib/domain/workspace-model"
import { dataTableMeta } from "@/lib/data-table"

export function ProjectOverviewPage({
  index,
  onOpenDoc,
  onOpenTasks,
  onOpenWorkstreams,
  project,
}: {
  index: ViewerIndex | null
  onOpenDoc: (path: string) => void
  onOpenTasks: () => void
  onOpenWorkstreams: () => void
  project: ProjectIndex | null
}) {
  if (!project?.outline) return <ProjectEmpty />

  const docs = docsByPath(index)
  const sourceDocs = [
    project.outline.spec,
    project.outline.plan,
    ...(project.outline.decisions ?? []),
    ...(project.outline.progress ?? []),
  ]
    .map((path) => (path ? docs.get(path) : null))
    .filter((doc): doc is DocMeta => Boolean(doc))
  const taskDocs = projectTaskDocs(project, docs)
  const openTasks = taskDocs.filter((doc) => statusTone(doc.status) !== "done")

  return (
    <section className="project-page">
      <div className="page-heading">
        <div className="eyebrow">Project</div>
        <h2>{project.title}</h2>
        <p>
          Source contracts, task state, and delivery structure for the selected
          project.
        </p>
      </div>
      <div className="summary-grid">
        <MetricCard label="Status" value={project.status ?? "planned"} />
        <MetricCard
          label="Workstreams"
          value={String(project.outline.workstreams?.length ?? 0)}
        />
        <MetricCard label="Open tasks" value={String(openTasks.length)} />
        <MetricCard label="Tasks" value={String(taskDocs.length)} />
      </div>
      <Card>
        <CardContent>
          <DocumentTable docs={sourceDocs} onOpenDoc={onOpenDoc} />
        </CardContent>
      </Card>
      <div className="project-actions">
        <Button variant="outline" onClick={onOpenWorkstreams}>
          <FolderIcon data-icon="inline-start" />
          Workstreams
        </Button>
        <Button variant="outline" onClick={onOpenTasks}>
          <ListChecksIcon data-icon="inline-start" />
          Tasks
        </Button>
      </div>
    </section>
  )
}

export function ProjectWorkstreamsPage({
  docs,
  onOpenDoc,
  project,
  writable = true,
}: {
  docs: Map<string, DocMeta>
  onOpenDoc: (path: string) => void
  project: ProjectIndex | null
  writable?: boolean
}) {
  const workstreams = project?.outline?.workstreams ?? []
  const [notice, setNotice] = useState<{
    message: string
    tone: "info" | "error"
  } | null>(null)
  const rows = workstreams.map((workstream) => {
    const taskDocs = (workstream.tasks ?? [])
      .map((path) => docs.get(path))
      .filter((doc): doc is DocMeta => Boolean(doc))
    return {
      openTasks: taskDocs.filter((doc) => statusTone(doc.status) !== "done")
        .length,
      taskCount: taskDocs.length,
      workstream,
    }
  })
  const columns: ColumnDef<(typeof rows)[number]>[] = [
    {
      id: "workstream",
      accessorFn: (row) => row.workstream.title,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Workstream" />
      ),
      cell: ({ row }) => row.original.workstream.title,
      filterFn: "includesString",
      meta: dataTableMeta({
        cellClassName: "min-w-72 whitespace-normal",
        headerClassName: "min-w-72",
      }),
    },
    {
      id: "tasks",
      accessorFn: (row) => String(row.taskCount),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tasks" />
      ),
      cell: ({ row }) => row.original.taskCount,
      filterFn: "includesString",
      meta: dataTableMeta({
        cellClassName: "min-w-24",
        headerClassName: "min-w-24",
      }),
    },
    {
      id: "openTasks",
      accessorFn: (row) => String(row.openTasks),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Open tasks" />
      ),
      cell: ({ row }) => row.original.openTasks,
      filterFn: "includesString",
      meta: dataTableMeta({
        cellClassName: "min-w-32",
        headerClassName: "min-w-32",
      }),
    },
    {
      id: "contract",
      accessorFn: (row) => row.workstream.path,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Contract" />
      ),
      cell: ({ row }) => (
        <Button
          className="h-auto justify-start px-0 text-left"
          variant="link"
          onClick={() => onOpenDoc(row.original.workstream.path)}
        >
          Open
        </Button>
      ),
      filterFn: "includesString",
      meta: dataTableMeta({
        cellClassName: "min-w-28",
        headerClassName: "min-w-28",
      }),
    },
    {
      id: "agent",
      header: () => <span className="sr-only">Agent</span>,
      cell: ({ row }) => (
        <HandoverMenu
          disabled={!writable}
          sourcePath={row.original.workstream.path}
          variant="icon"
          onStatus={(message, tone) => setNotice({ message, tone })}
        />
      ),
      enableColumnFilter: false,
      enableSorting: false,
      meta: dataTableMeta({
        cellClassName: "w-14 text-right",
        headerClassName: "w-14",
      }),
    },
  ]

  return (
    <section className="project-page">
      <div className="page-heading">
        <div className="eyebrow">Project</div>
        <h2>Workstreams</h2>
        <p>{project?.title ?? "Selected project"}</p>
      </div>
      <HandoverNotice notice={notice} onDismiss={() => setNotice(null)} />
      {!workstreams.length ? (
        <ProjectEmpty
          title="No workstreams"
          description="This project has no workstream contracts."
        />
      ) : (
        <Card>
          <CardContent>
            <DataTable
              columns={columns}
              data={rows}
              getRowId={(row) => row.workstream.path}
            />
          </CardContent>
        </Card>
      )}
    </section>
  )
}

export function ProjectTasksPage({
  docs,
  onOpenDoc,
  project,
  writable = true,
}: {
  docs: Map<string, DocMeta>
  onOpenDoc: (path: string) => void
  project: ProjectIndex | null
  writable?: boolean
}) {
  const tasks = project ? projectTaskDocs(project, docs) : []
  const [notice, setNotice] = useState<{
    message: string
    tone: "info" | "error"
  } | null>(null)

  return (
    <section className="project-page">
      <div className="page-heading">
        <div className="eyebrow">Project</div>
        <h2>Tasks</h2>
        <p>{project?.title ?? "Selected project"}</p>
      </div>
      <HandoverNotice notice={notice} onDismiss={() => setNotice(null)} />
      {!tasks.length ? (
        <ProjectEmpty
          title="No tasks"
          description="This project has no indexed task contracts."
        />
      ) : (
        <Card>
          <CardContent>
            <DocumentTable
              docs={tasks}
              onOpenDoc={onOpenDoc}
              onHandoverStatus={(message, tone) => setNotice({ message, tone })}
              writable={writable}
            />
          </CardContent>
        </Card>
      )}
    </section>
  )
}

function projectTaskDocs(project: ProjectIndex, docs: Map<string, DocMeta>) {
  const workstreamTasks =
    project.outline?.workstreams?.flatMap(
      (workstream) => workstream.tasks ?? []
    ) ?? []
  const paths = [
    ...workstreamTasks,
    ...(project.outline?.unassignedTasks ?? []),
  ]
  return paths
    .map((path) => docs.get(path))
    .filter((doc): doc is DocMeta => Boolean(doc))
}

function DocumentTable({
  docs,
  onOpenDoc,
  onHandoverStatus,
  writable = true,
}: {
  docs: DocMeta[]
  onOpenDoc: (path: string) => void
  onHandoverStatus?: (message: string, tone: "info" | "error") => void
  writable?: boolean
}) {
  const showAgentColumn =
    Boolean(onHandoverStatus) &&
    docs.some((doc) => doc.role === "task" || doc.role === "workstream")
  const columns: ColumnDef<DocMeta>[] = [
    {
      id: "document",
      accessorFn: (doc) => `${doc.title} ${doc.path}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Document" />
      ),
      cell: ({ row }) => (
        <>
          <Button
            className="h-auto justify-start px-0 text-left whitespace-normal"
            variant="link"
            onClick={() => onOpenDoc(row.original.path)}
          >
            {row.original.title}
          </Button>
          <div className="mono-path">{row.original.path}</div>
        </>
      ),
      filterFn: "includesString",
      meta: dataTableMeta({
        cellClassName: "min-w-80 whitespace-normal",
        headerClassName: "min-w-80",
      }),
    },
    {
      id: "role",
      accessorFn: (doc) => doc.role ?? "document",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => row.original.role ?? "document",
      filterFn: "includesString",
      meta: dataTableMeta({
        cellClassName: "min-w-28",
        headerClassName: "min-w-28",
      }),
    },
    {
      id: "status",
      accessorFn: (doc) => (doc.status ? statusLabel(doc.status) : "None"),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) =>
        row.original.status ? (
          <StatusBadge status={row.original.status} />
        ) : (
          <span className="text-muted-foreground">None</span>
        ),
      filterFn: "includesString",
      meta: dataTableMeta({
        cellClassName: "min-w-28",
        headerClassName: "min-w-28",
      }),
    },
    {
      id: "updated",
      accessorFn: (doc) => formatDate(doc.updated),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated" />
      ),
      cell: ({ row }) => formatDate(row.original.updated),
      filterFn: "includesString",
      sortingFn: (a, b) =>
        String(a.original.updated ?? "").localeCompare(
          String(b.original.updated ?? "")
        ),
      meta: dataTableMeta({
        cellClassName: "min-w-40",
        headerClassName: "min-w-40",
      }),
    },
  ]
  if (showAgentColumn) {
    columns.push({
      id: "agent",
      header: () => <span className="sr-only">Agent</span>,
      cell: ({ row }) =>
        row.original.role === "task" || row.original.role === "workstream" ? (
          <HandoverMenu
            disabled={!writable}
            sourcePath={row.original.path}
            variant="icon"
            onStatus={onHandoverStatus}
          />
        ) : null,
      enableColumnFilter: false,
      enableSorting: false,
      meta: dataTableMeta({
        cellClassName: "w-14 text-right",
        headerClassName: "w-14",
      }),
    })
  }
  return (
    <DataTable columns={columns} data={docs} getRowId={(doc) => doc.path} />
  )
}

function HandoverNotice({
  notice,
  onDismiss,
}: {
  notice: { message: string; tone: "info" | "error" } | null
  onDismiss: () => void
}) {
  if (!notice) return null
  return (
    <p
      className={
        notice.tone === "error"
          ? "text-sm text-destructive"
          : "text-sm text-muted-foreground"
      }
      role="status"
    >
      {notice.message}{" "}
      <Button
        variant="ghost"
        size="xs"
        onClick={onDismiss}
        aria-label="Dismiss handover status"
      >
        Dismiss
      </Button>
    </p>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle>{value}</CardTitle>
      </CardHeader>
    </Card>
  )
}

function ProjectEmpty({
  description = "Select another project from the sidebar.",
  title = "No project selected",
}: {
  description?: string
  title?: string
}) {
  return (
    <Empty className="min-h-[320px] rounded-lg border bg-card">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileTextIcon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
