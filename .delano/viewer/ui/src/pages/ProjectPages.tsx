import { ArrowRightIcon, FileTextIcon } from "lucide-react"
import { type ReactNode, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { HandoverMenu } from "@/components/molecules/HandoverMenu"
import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/molecules/DataTable"
import { StatusBadge } from "@/components/atoms/StatusBadge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { formatDate } from "@/lib/domain/dates"
import {
  buildProjectDashboard,
  TASK_STATE_LABELS,
  TASK_STATE_ORDER,
  taskState,
  type TaskStateCounts,
  type TaskStateKey,
} from "@/lib/domain/project-dashboard"
import { statusLabel } from "@/lib/domain/status"
import type { DocMeta, ProjectIndex, ViewerIndex } from "@/lib/domain/types"
import { docsByPath, isOpenTaskStatus } from "@/lib/domain/workspace-model"
import { dataTableMeta, dateRangeFilter } from "@/lib/data-table"

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
  const dashboard = buildProjectDashboard(project, docs)
  const summaryItems = [
    { label: "Complete", value: `${dashboard.completion}%` },
    { label: "Open tasks", value: String(dashboard.openTaskCount) },
    { label: "Blocked", value: String(dashboard.taskCounts.blocked) },
    { label: "Workstreams", value: String(dashboard.workstreams.length) },
  ]

  return (
    <section className="project-page">
      <div className="project-dashboard-heading">
        <div>
          <div className="eyebrow">Project overview</div>
          <div className="flex flex-wrap items-center gap-3">
            <h2>{project.title}</h2>
            <StatusBadge status={project.status ?? "planned"} />
          </div>
          <p>
            Current delivery state, project intent, and the evidence behind it.
          </p>
        </div>
        <div className="project-dashboard-updated">
          <span>Last updated</span>
          <strong>{formatDate(dashboard.updated)}</strong>
        </div>
      </div>
      <div className="project-dashboard-summary" aria-label="Project summary">
        {summaryItems.map((item) => (
          <div key={item.label} className="project-dashboard-summary-item">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      <DashboardSection
        title="Execution map"
        description={
          dashboard.taskTotal
            ? `${dashboard.taskTotal} current task${dashboard.taskTotal === 1 ? "" : "s"} across the project.`
            : "No task contracts are indexed for this project yet."
        }
        action={
          <Button variant="ghost" size="sm" onClick={onOpenTasks}>
            All tasks
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        }
      >
        <TaskStateMap
          counts={dashboard.taskCounts}
          total={dashboard.taskTotal}
        />
      </DashboardSection>

      <div className="project-dashboard-columns">
        <div className="project-dashboard-main">
          <DashboardSection
            title="Project brief"
            description="The project outcome from its canonical specification."
            action={
              dashboard.spec ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenDoc(dashboard.spec!.path)}
                >
                  Open spec
                  <ArrowRightIcon data-icon="inline-end" />
                </Button>
              ) : null
            }
          >
            {dashboard.spec ? (
              <p className="project-dashboard-brief">
                {dashboard.spec.snippet ||
                  "Open the specification to read the project outcome."}
              </p>
            ) : (
              <DashboardEmpty>No specification is indexed.</DashboardEmpty>
            )}
          </DashboardSection>

          <DashboardSection
            title="Recent evidence"
            description="Latest project updates, newest first."
          >
            {dashboard.recentEvidence.length ? (
              <div className="project-dashboard-evidence">
                {dashboard.recentEvidence.slice(0, 5).map((evidence) => (
                  <button
                    key={evidence.path}
                    type="button"
                    className="project-dashboard-evidence-row"
                    onClick={() => onOpenDoc(evidence.path)}
                  >
                    <span className="project-dashboard-evidence-date">
                      {formatDate(evidence.updated)}
                    </span>
                    <span className="min-w-0">
                      <strong>{evidence.title}</strong>
                      {evidence.snippet && <small>{evidence.snippet}</small>}
                    </span>
                    <ArrowRightIcon aria-hidden="true" />
                  </button>
                ))}
              </div>
            ) : (
              <DashboardEmpty>
                No progress evidence is indexed yet.
              </DashboardEmpty>
            )}
          </DashboardSection>
        </div>

        <DashboardSection
          title="Workstreams"
          description="Delivery groups and their current task state."
          className="project-dashboard-workstreams"
          action={
            <Button variant="ghost" size="sm" onClick={onOpenWorkstreams}>
              All workstreams
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          }
        >
          {dashboard.workstreams.length ? (
            <div className="project-workstream-list">
              {dashboard.workstreams.map((workstream) => {
                const activeTasks = workstream.tasks.filter((task) =>
                  ["active", "blocked", "planned"].includes(
                    taskState(task.status)
                  )
                )
                return (
                  <div key={workstream.path} className="project-workstream-row">
                    <button
                      type="button"
                      className="project-workstream-heading"
                      onClick={() => onOpenDoc(workstream.path)}
                    >
                      <span>
                        {workstream.id && <small>{workstream.id}</small>}
                        <strong>{workstream.displayTitle}</strong>
                      </span>
                      <span>{workstream.completion}%</span>
                    </button>
                    <div
                      className="project-workstream-progress"
                      role="progressbar"
                      aria-label={`${workstream.displayTitle} completion`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={workstream.completion}
                    >
                      <span style={{ width: `${workstream.completion}%` }} />
                    </div>
                    <p>
                      {workstream.total
                        ? `${workstream.done} of ${workstream.total} done${workstream.blocked ? ` · ${workstream.blocked} blocked` : ""}`
                        : "No tasks yet"}
                    </p>
                    {activeTasks.length ? (
                      <div className="project-workstream-tasks">
                        {activeTasks.slice(0, 3).map((task) => (
                          <button
                            type="button"
                            key={task.path}
                            onClick={() => onOpenDoc(task.path)}
                          >
                            <span data-state={taskState(task.status)} />
                            <small>{task.taskId ?? "Task"}</small>
                            <strong>{task.title}</strong>
                          </button>
                        ))}
                      </div>
                    ) : workstream.total ? (
                      <p className="project-workstream-complete">
                        All tasks complete
                      </p>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ) : (
            <DashboardEmpty>
              No workstream contracts are indexed.
            </DashboardEmpty>
          )}
        </DashboardSection>
      </div>
    </section>
  )
}

function DashboardSection({
  action,
  children,
  className,
  description,
  title,
}: {
  action?: ReactNode
  children: ReactNode
  className?: string
  description: string
  title: string
}) {
  return (
    <section className={`project-dashboard-section ${className ?? ""}`}>
      <div className="project-dashboard-section-heading">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function TaskStateMap({
  counts,
  total,
}: {
  counts: TaskStateCounts
  total: number
}) {
  if (!total)
    return <DashboardEmpty>Add tasks to map project execution.</DashboardEmpty>
  return (
    <div className="project-task-map">
      <div
        className="project-task-map-track"
        aria-label="Task state distribution"
      >
        {TASK_STATE_ORDER.filter((state) => counts[state] > 0).map((state) => (
          <span
            key={state}
            data-state={state}
            style={{ flexGrow: counts[state] }}
            title={`${TASK_STATE_LABELS[state]}: ${counts[state]}`}
          />
        ))}
      </div>
      <div className="project-task-map-legend">
        {TASK_STATE_ORDER.map((state) => (
          <TaskStateLegend key={state} state={state} count={counts[state]} />
        ))}
      </div>
    </div>
  )
}

function TaskStateLegend({
  count,
  state,
}: {
  count: number
  state: TaskStateKey
}) {
  return (
    <div>
      <span data-state={state} />
      <small>{TASK_STATE_LABELS[state]}</small>
      <strong>{count}</strong>
    </div>
  )
}

function DashboardEmpty({ children }: { children: ReactNode }) {
  return <p className="project-dashboard-empty">{children}</p>
}

export function ProjectWorkstreamsPage({
  docs,
  onOpenDoc,
  project,
  dispatchEnabled = true,
  reviewEnabled = true,
}: {
  docs: Map<string, DocMeta>
  onOpenDoc: (path: string) => void
  project: ProjectIndex | null
  dispatchEnabled?: boolean
  reviewEnabled?: boolean
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
      openTasks: taskDocs.filter((doc) => isOpenTaskStatus(doc.status)).length,
      taskCount: taskDocs.length,
      workstream,
      baselineHash: docs.get(workstream.path)?.baselineHash,
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
          dispatchEnabled={dispatchEnabled}
          reviewEnabled={reviewEnabled}
          expectedSourceHash={row.original.baselineHash}
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
        <DataTable
          columns={columns}
          data={rows}
          getRowId={(row) => row.workstream.path}
        />
      )}
    </section>
  )
}

export function ProjectTasksPage({
  docs,
  onOpenDoc,
  project,
  dispatchEnabled = true,
  reviewEnabled = true,
}: {
  docs: Map<string, DocMeta>
  onOpenDoc: (path: string) => void
  project: ProjectIndex | null
  dispatchEnabled?: boolean
  reviewEnabled?: boolean
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
        <DocumentTable
          docs={tasks}
          onOpenDoc={onOpenDoc}
          onHandoverStatus={(message, tone) => setNotice({ message, tone })}
          dispatchEnabled={dispatchEnabled}
          reviewEnabled={reviewEnabled}
        />
      )}
    </section>
  )
}

export function ProjectDocumentsPage({
  description,
  docs,
  emptyDescription,
  emptyTitle,
  onOpenDoc,
  paths,
  project,
  title,
}: {
  description: string
  docs: Map<string, DocMeta>
  emptyDescription: string
  emptyTitle: string
  onOpenDoc: (path: string) => void
  paths: string[]
  project: ProjectIndex | null
  title: string
}) {
  const documents = paths
    .map((path) => docs.get(path))
    .filter((doc): doc is DocMeta => Boolean(doc))

  return (
    <section className="project-page">
      <div className="page-heading">
        <div className="eyebrow">Project</div>
        <h2>{title}</h2>
        <p>{project ? `${project.title}. ${description}` : description}</p>
      </div>
      {!documents.length ? (
        <ProjectEmpty title={emptyTitle} description={emptyDescription} />
      ) : (
        <DocumentTable docs={documents} onOpenDoc={onOpenDoc} />
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
  dispatchEnabled = true,
  reviewEnabled = true,
}: {
  docs: DocMeta[]
  onOpenDoc: (path: string) => void
  onHandoverStatus?: (message: string, tone: "info" | "error") => void
  dispatchEnabled?: boolean
  reviewEnabled?: boolean
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
      accessorFn: (doc) => doc.updated ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated" />
      ),
      cell: ({ row }) => formatDate(row.original.updated),
      filterFn: dateRangeFilter,
      sortingFn: (a, b) =>
        String(a.original.updated ?? "").localeCompare(
          String(b.original.updated ?? "")
        ),
      meta: dataTableMeta({
        cellClassName: "min-w-40",
        filter: { kind: "date-range" },
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
            dispatchEnabled={dispatchEnabled}
            reviewEnabled={reviewEnabled}
            expectedSourceHash={row.original.baselineHash}
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
    <DataTable
      columns={columns}
      data={docs}
      getRowId={(doc) => doc.path}
      initialSorting={[{ id: "updated", desc: true }]}
    />
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
