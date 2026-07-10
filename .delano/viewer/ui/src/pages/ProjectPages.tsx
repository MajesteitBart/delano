import { FileTextIcon, FolderIcon, ListChecksIcon } from "lucide-react"
import { useMemo, useState } from "react"

import { useTableQuery, type TableQueryHandle } from "@/app/useTableQuery"
import { HandoverMenu } from "@/components/molecules/HandoverMenu"
import { SortableHead } from "@/components/molecules/SortableHead"
import { TablePaginationFooter } from "@/components/molecules/TablePaginationFooter"
import { TableToolbar } from "@/components/molecules/TableToolbar"
import { StatusBadge } from "@/components/atoms/StatusBadge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
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
import { formatDate } from "@/lib/domain/dates"
import { DEFAULT_PAGE_SIZE } from "@/lib/domain/pagination"
import { statusLabel, statusTone } from "@/lib/domain/status"
import {
  resultSummaryLabel,
  type TableQueryConfig,
} from "@/lib/domain/table-query"
import type { DocMeta, ProjectIndex, ViewerIndex } from "@/lib/domain/types"
import { docsByPath, type WorkstreamMeta } from "@/lib/domain/workspace-model"

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
  const docs = docsByPath(index)
  const sourceDocs = useMemo(() => {
    if (!project?.outline) return []
    return [
      project.outline.spec,
      project.outline.plan,
      ...(project.outline.decisions ?? []),
      ...(project.outline.progress ?? []),
    ]
      .map((path) => (path ? docs.get(path) : null))
      .filter((doc): doc is DocMeta => Boolean(doc))
  }, [project, docs])
  const config = useMemo(() => docQueryConfig(), [])
  const query = useTableQuery(sourceDocs, config, { syncToHash: true })

  if (!project?.outline) return <ProjectEmpty />

  const taskDocs = projectTaskDocs(project, docs)
  const openTasks = taskDocs.filter((doc) => statusTone(doc.status) !== "done")

  return (
    <section className="project-page">
      <div className="page-heading">
        <div className="eyebrow">Project</div>
        <div className="page-heading-row">
          <h2>{project.title}</h2>
          <StatusBadge status={project.status ?? "planned"} />
        </div>
        <p>Source contracts, task state, and delivery structure for the selected project.</p>
      </div>
      <div className="summary-grid">
        <MetricCard label="Status" value={statusLabel(project.status)} />
        <MetricCard label="Workstreams" value={String(project.outline.workstreams?.length ?? 0)} />
        <MetricCard label="Open tasks" value={String(openTasks.length)} />
        <MetricCard label="Tasks" value={String(taskDocs.length)} />
      </div>
      <TableToolbar
        config={config}
        items={sourceDocs}
        noun="documents"
        query={query}
        searchPlaceholder="Search source contracts..."
      />
      <Card>
        <CardContent>
          {query.result.filteredTotal === 0 ? (
            <QueryEmpty onReset={query.reset} />
          ) : (
            <DocumentTable docs={query.paginated.items} onOpenDoc={onOpenDoc} query={query} />
          )}
        </CardContent>
        <CardFooter>
          <TablePaginationFooter
            page={query.paginated.page}
            pageCount={query.paginated.pageCount}
            total={query.paginated.total}
            summary={resultSummaryLabel({
              filteredTotal: query.result.filteredTotal,
              noun: "documents",
              page: query.paginated.page,
              pageSize: DEFAULT_PAGE_SIZE,
              shownCount: query.paginated.items.length,
              total: query.result.total,
            })}
            onPageChange={query.setPage}
          />
        </CardFooter>
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

type WorkstreamRow = {
  workstream: WorkstreamMeta
  taskCount: number
  openTaskCount: number
}

export function ProjectWorkstreamsPage({
  docs,
  onOpenDoc,
  project,
}: {
  docs: Map<string, DocMeta>
  onOpenDoc: (path: string) => void
  project: ProjectIndex | null
}) {
  const [notice, setNotice] = useState<{ message: string; tone: "info" | "error" } | null>(null)
  const rows = useMemo<WorkstreamRow[]>(() => {
    return (project?.outline?.workstreams ?? []).map((workstream) => {
      const taskDocs = (workstream.tasks ?? [])
        .map((path) => docs.get(path))
        .filter((doc): doc is DocMeta => Boolean(doc))
      return {
        workstream,
        taskCount: taskDocs.length,
        openTaskCount: taskDocs.filter((doc) => statusTone(doc.status) !== "done").length,
      }
    })
  }, [project, docs])
  const config = useMemo<TableQueryConfig<WorkstreamRow>>(
    () => ({
      searchText: (row) => [row.workstream.id, row.workstream.title, row.workstream.path],
      filters: [],
      sorts: [
        {
          id: "workstream",
          label: "Workstream",
          kind: "natural",
          value: (row) => row.workstream.id ?? row.workstream.title,
        },
        {
          id: "open",
          label: "Open tasks",
          kind: "number",
          value: (row) => row.openTaskCount,
          initialDirection: "desc",
        },
      ],
      defaultSort: "workstream",
      tieBreaker: (a, b) => a.workstream.path.localeCompare(b.workstream.path),
    }),
    []
  )
  const query = useTableQuery(rows, config, { syncToHash: true })

  return (
    <section className="project-page">
      <div className="page-heading">
        <div className="eyebrow">Project</div>
        <div className="page-heading-row">
          <h2>Workstreams</h2>
          {project?.status && <StatusBadge status={project.status} />}
        </div>
        <p>{project?.title ?? "Selected project"}</p>
      </div>
      <HandoverNotice notice={notice} onDismiss={() => setNotice(null)} />
      {!rows.length ? (
        <ProjectEmpty title="No workstreams" description="This project has no workstream contracts." />
      ) : (
        <>
          <TableToolbar
            config={config}
            items={rows}
            noun="workstreams"
            query={query}
            searchPlaceholder="Search workstreams..."
          />
          <Card>
            <CardContent>
              {query.result.filteredTotal === 0 ? (
                <QueryEmpty onReset={query.reset} />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableHead label="Workstream" sortId="workstream" query={query} />
                      <TableHead>Tasks</TableHead>
                      <SortableHead label="Open tasks" sortId="open" query={query} />
                      <TableHead>Contract</TableHead>
                      <TableHead className="w-10 text-right">Agent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {query.paginated.items.map((row) => (
                      <TableRow key={row.workstream.path}>
                        <TableCell>{row.workstream.title}</TableCell>
                        <TableCell>{row.taskCount}</TableCell>
                        <TableCell>{row.openTaskCount}</TableCell>
                        <TableCell>
                          <Button
                            className="h-auto justify-start px-0 text-left"
                            variant="link"
                            onClick={() => onOpenDoc(row.workstream.path)}
                          >
                            Open
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <HandoverMenu
                            sourcePath={row.workstream.path}
                            variant="icon"
                            onStatus={(message, tone) => setNotice({ message, tone })}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter>
              <TablePaginationFooter
                page={query.paginated.page}
                pageCount={query.paginated.pageCount}
                total={query.paginated.total}
                summary={resultSummaryLabel({
                  filteredTotal: query.result.filteredTotal,
                  noun: "workstreams",
                  page: query.paginated.page,
                  pageSize: DEFAULT_PAGE_SIZE,
                  shownCount: query.paginated.items.length,
                  total: query.result.total,
                })}
                onPageChange={query.setPage}
              />
            </CardFooter>
          </Card>
        </>
      )}
    </section>
  )
}

export function ProjectTasksPage({
  docs,
  onOpenDoc,
  project,
}: {
  docs: Map<string, DocMeta>
  onOpenDoc: (path: string) => void
  project: ProjectIndex | null
}) {
  const tasks = useMemo(
    () => (project ? projectTaskDocs(project, docs) : []),
    [project, docs]
  )
  const [notice, setNotice] = useState<{ message: string; tone: "info" | "error" } | null>(null)
  const config = useMemo(() => docQueryConfig(), [])
  const query = useTableQuery(tasks, config, { syncToHash: true })

  return (
    <section className="project-page">
      <div className="page-heading">
        <div className="eyebrow">Project</div>
        <div className="page-heading-row">
          <h2>Tasks</h2>
          {project?.status && <StatusBadge status={project.status} />}
        </div>
        <p>{project?.title ?? "Selected project"}</p>
      </div>
      <HandoverNotice notice={notice} onDismiss={() => setNotice(null)} />
      {!tasks.length ? (
        <ProjectEmpty title="No tasks" description="This project has no indexed task contracts." />
      ) : (
        <>
          <TableToolbar
            config={config}
            items={tasks}
            noun="tasks"
            query={query}
            searchPlaceholder="Search tasks..."
          />
          <Card>
            <CardContent>
              {query.result.filteredTotal === 0 ? (
                <QueryEmpty onReset={query.reset} />
              ) : (
                <DocumentTable
                  docs={query.paginated.items}
                  onOpenDoc={onOpenDoc}
                  onHandoverStatus={(message, tone) => setNotice({ message, tone })}
                  query={query}
                />
              )}
            </CardContent>
            <CardFooter>
              <TablePaginationFooter
                page={query.paginated.page}
                pageCount={query.paginated.pageCount}
                total={query.paginated.total}
                summary={resultSummaryLabel({
                  filteredTotal: query.result.filteredTotal,
                  noun: "tasks",
                  page: query.paginated.page,
                  pageSize: DEFAULT_PAGE_SIZE,
                  shownCount: query.paginated.items.length,
                  total: query.result.total,
                })}
                onPageChange={query.setPage}
              />
            </CardFooter>
          </Card>
        </>
      )}
    </section>
  )
}

function docQueryConfig(): TableQueryConfig<DocMeta> {
  return {
    searchText: (doc) => [doc.taskId, doc.title, doc.path, doc.role],
    filters: [
      {
        id: "role",
        label: "Role",
        value: (doc) => doc.role ?? "document",
      },
      {
        id: "status",
        label: "Status",
        value: (doc) => doc.status ?? null,
        valueLabel: statusLabel,
      },
    ],
    sorts: [
      {
        id: "document",
        label: "Document",
        kind: "natural",
        value: (doc) => doc.taskId ?? doc.path,
      },
      {
        id: "updated",
        label: "Updated newest",
        kind: "date",
        value: (doc) => doc.updated ?? null,
        initialDirection: "desc",
      },
    ],
    defaultSort: "document",
    tieBreaker: (a, b) => a.path.localeCompare(b.path),
  }
}

function projectTaskDocs(project: ProjectIndex, docs: Map<string, DocMeta>) {
  const workstreamTasks =
    project.outline?.workstreams?.flatMap((workstream) => workstream.tasks ?? []) ?? []
  const paths = [...workstreamTasks, ...(project.outline?.unassignedTasks ?? [])]
  return paths.map((path) => docs.get(path)).filter((doc): doc is DocMeta => Boolean(doc))
}

function DocumentTable({
  docs,
  onOpenDoc,
  onHandoverStatus,
  query,
}: {
  docs: DocMeta[]
  onOpenDoc: (path: string) => void
  onHandoverStatus?: (message: string, tone: "info" | "error") => void
  query?: TableQueryHandle<DocMeta>
}) {
  const showAgentColumn = Boolean(onHandoverStatus) && docs.some((doc) => doc.role === "task" || doc.role === "workstream")
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {query ? (
            <SortableHead label="Document" sortId="document" query={query} />
          ) : (
            <TableHead>Document</TableHead>
          )}
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          {query ? (
            <SortableHead label="Updated" sortId="updated" query={query} />
          ) : (
            <TableHead>Updated</TableHead>
          )}
          {showAgentColumn && <TableHead className="w-10 text-right">Agent</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {docs.map((doc) => (
          <TableRow key={doc.path}>
            <TableCell>
              <Button
                className="h-auto justify-start px-0 text-left"
                variant="link"
                onClick={() => onOpenDoc(doc.path)}
              >
                {doc.title}
              </Button>
              <div className="mono-path">{doc.path}</div>
            </TableCell>
            <TableCell>{doc.role ?? "document"}</TableCell>
            <TableCell>
              {doc.status ? <StatusBadge status={doc.status} /> : <span className="text-muted-foreground">None</span>}
            </TableCell>
            <TableCell>{formatDate(doc.updated)}</TableCell>
            {showAgentColumn && (
              <TableCell className="text-right">
                {(doc.role === "task" || doc.role === "workstream") && (
                  <HandoverMenu sourcePath={doc.path} variant="icon" onStatus={onHandoverStatus} />
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function QueryEmpty({ onReset }: { onReset: () => void }) {
  return (
    <Empty className="min-h-[220px] border border-dashed bg-muted/20">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileTextIcon />
        </EmptyMedia>
        <EmptyTitle>No matching rows</EmptyTitle>
        <EmptyDescription>
          Nothing matches the current search and filters.
        </EmptyDescription>
        <EmptyContent>
          <Button variant="outline" size="sm" onClick={onReset}>
            Reset filters
          </Button>
        </EmptyContent>
      </EmptyHeader>
    </Empty>
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
        notice.tone === "error" ? "text-sm text-destructive" : "text-sm text-muted-foreground"
      }
      role="status"
    >
      {notice.message}{" "}
      <Button variant="ghost" size="xs" onClick={onDismiss} aria-label="Dismiss handover status">
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
