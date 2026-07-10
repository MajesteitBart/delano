import {
  AlertTriangleIcon,
  FileTextIcon,
  FolderIcon,
  ListChecksIcon,
  MessageSquareTextIcon,
  RefreshCwIcon,
  type LucideIcon,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { useTableQuery } from "@/app/useTableQuery"
import { SortableHead } from "@/components/molecules/SortableHead"
import { TablePaginationFooter } from "@/components/molecules/TablePaginationFooter"
import { TableToolbar } from "@/components/molecules/TableToolbar"
import { StatusBadge } from "@/components/atoms/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
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
import { messageFromError, requestJson } from "@/lib/api"
import { annotationLine } from "@/lib/domain/annotations"
import { formatDate } from "@/lib/domain/dates"
import { DEFAULT_PAGE_SIZE } from "@/lib/domain/pagination"
import { statusLabel } from "@/lib/domain/status"
import {
  resultSummaryLabel,
  TIME_RANGE_OPTIONS,
  withinTimeRange,
  type TableQueryConfig,
} from "@/lib/domain/table-query"
import type { Annotation, DocMeta, ViewerIndex } from "@/lib/domain/types"
import { type WorkspaceView } from "@/lib/domain/navigation"
import { getWorkspaceModel, type ProjectStat, type WorkspaceTaskItem } from "@/lib/domain/workspace-model"

const WORKSPACE_COPY: Partial<Record<WorkspaceView, { title: string; description: string }>> = {
  "workspace-context": {
    title: "Context pack",
    description: "Repository context files agents should read before implementation work.",
  },
  "workspace-projects": {
    title: "Projects",
    description: "Delivery contracts currently present in this workspace.",
  },
  "workspace-current": {
    title: "Open work",
    description: "Tasks that are not marked complete.",
  },
  "workspace-progress": {
    title: "Progress",
    description: "Progress logs and update evidence across projects.",
  },
  "workspace-annotations": {
    title: "Annotations",
    description: "Review comments captured across every indexed project document.",
  },
  "workspace-validation": {
    title: "Validation",
    description: "Contract documents included in the viewer index.",
  },
  "workspace-warnings": {
    title: "Warnings",
    description: "Documents currently carrying warning status.",
  },
  "workspace-blockers": {
    title: "Blockers",
    description: "Blocked task contracts that need attention.",
  },
}

export function WorkspacePage({
  index,
  onOpenDoc,
  onOpenProject,
  view,
}: {
  index: ViewerIndex | null
  onOpenDoc: (path: string) => void
  onOpenProject: (slug: string) => void
  view: WorkspaceView
}) {
  const workspace = getWorkspaceModel(index)
  const copy = WORKSPACE_COPY[view] ?? { title: "Workspace", description: "" }
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [annotationsLoading, setAnnotationsLoading] = useState(false)
  const [annotationsError, setAnnotationsError] = useState("")

  useEffect(() => {
    if (view !== "workspace-annotations") return
    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return
      setAnnotationsLoading(true)
      setAnnotationsError("")
      requestJson<{ annotations: Annotation[] }>("/api/annotations")
        .then((payload) => {
          if (!cancelled) setAnnotations(payload.annotations ?? [])
        })
        .catch((error) => {
          if (!cancelled) setAnnotationsError(messageFromError(error))
        })
        .finally(() => {
          if (!cancelled) setAnnotationsLoading(false)
        })
    })
    return () => {
      cancelled = true
    }
  }, [view])

  return (
    <section className="workspace-page">
      <PageHeader title={copy.title} description={copy.description} />
      {view === "workspace-context" && (
        <DocTable docs={workspace.context} emptyTitle="No context files" onOpenDoc={onOpenDoc} />
      )}
      {view === "workspace-projects" && (
        <ProjectTable items={workspace.projects} onOpenProject={onOpenProject} />
      )}
      {view === "workspace-current" && (
        <TaskTable
          items={workspace.current}
          emptyTitle="No open work"
          emptyDescription="Every indexed task is currently complete."
          onOpenDoc={onOpenDoc}
          onOpenProject={onOpenProject}
        />
      )}
      {view === "workspace-progress" && (
        <DocTable docs={workspace.progress} emptyTitle="No progress logs" onOpenDoc={onOpenDoc} />
      )}
      {view === "workspace-annotations" && (
        <AnnotationTable
          annotations={annotations}
          error={annotationsError}
          index={index}
          loading={annotationsLoading}
          onOpenDoc={onOpenDoc}
        />
      )}
      {view === "workspace-validation" && (
        <DocTable docs={workspace.validation} emptyTitle="No validation documents" onOpenDoc={onOpenDoc} />
      )}
      {view === "workspace-warnings" && (
        <DocTable docs={workspace.warnings} emptyTitle="No warnings" onOpenDoc={onOpenDoc} />
      )}
      {view === "workspace-blockers" && (
        <TaskTable
          items={workspace.blockers}
          emptyTitle="No blockers"
          emptyDescription="No indexed task is currently blocked."
          onOpenDoc={onOpenDoc}
          onOpenProject={onOpenProject}
        />
      )}
    </section>
  )
}

function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="page-heading">
      <div className="eyebrow">Workspace</div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  )
}

function annotationTypeVariant(type: string): "default" | "secondary" | "outline" {
  if (type === "verify") return "default"
  if (type === "question") return "outline"
  return "secondary"
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

function AnnotationTable({
  annotations,
  error,
  index,
  loading,
  onOpenDoc,
}: {
  annotations: Annotation[]
  error: string
  index: ViewerIndex | null
  loading: boolean
  onOpenDoc: (path: string) => void
}) {
  const docs = useMemo(() => {
    const map = new Map<string, DocMeta>()
    ;(index?.docs ?? []).forEach((doc) => map.set(doc.path, doc))
    return map
  }, [index])
  const visible = useMemo(
    () => annotations.filter((annotation) => annotation.status !== "deleted"),
    [annotations]
  )
  const config = useMemo<TableQueryConfig<Annotation>>(
    () => ({
      searchText: (annotation) => [
        annotation.comment,
        annotation.quote,
        annotation.repoPath,
        annotation.sourcePath,
        annotation.type,
      ],
      filters: [
        {
          id: "type",
          label: "Type",
          value: (annotation) => annotation.type,
        },
        {
          id: "status",
          label: "Status",
          value: (annotation) => annotation.status || "open",
          valueLabel: statusLabel,
        },
      ],
      sorts: [
        {
          id: "updated",
          label: "Updated newest",
          kind: "date",
          value: (annotation) => annotation.updatedAt ?? annotation.createdAt ?? null,
          initialDirection: "desc",
        },
        {
          id: "source",
          label: "Source",
          kind: "natural",
          value: (annotation) => annotation.sourcePath,
        },
      ],
      defaultSort: "updated",
      defaultDirection: "desc",
      tieBreaker: (a, b) =>
        String(a.sourcePath).localeCompare(String(b.sourcePath)) ||
        Number(a.anchor?.lineStart ?? 0) - Number(b.anchor?.lineStart ?? 0),
    }),
    []
  )
  const query = useTableQuery(visible, config, { syncToHash: true })

  if (loading) {
    return <EmptyPanel icon={RefreshCwIcon} title="Loading annotations" description="Reading viewer review comments." />
  }

  if (error) {
    return <EmptyPanel icon={AlertTriangleIcon} title="Annotations unavailable" description={error} />
  }

  if (!visible.length) {
    return <EmptyPanel icon={MessageSquareTextIcon} title="No annotations" description="No viewer comments have been captured yet." />
  }

  return (
    <>
      <TableToolbar
        config={config}
        items={visible}
        noun="annotations"
        query={query}
        searchPlaceholder="Search annotations..."
      />
      <Card>
        <CardContent>
          {query.result.filteredTotal === 0 ? (
            <QueryEmpty onReset={query.reset} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Annotation</TableHead>
                  <SortableHead label="Source" sortId="source" query={query} />
                  <TableHead>Status</TableHead>
                  <SortableHead label="Updated" sortId="updated" query={query} />
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.paginated.items.map((annotation) => {
                  const sourceDoc = docs.get(annotation.sourcePath)
                  const sourceTitle = sourceDoc?.title ?? annotation.repoPath
                  return (
                    <TableRow key={annotation.id}>
                      <TableCell className="max-w-[420px]">
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={annotationTypeVariant(annotation.type)}>{annotation.type}</Badge>
                            <span className="font-mono text-xs text-muted-foreground">{annotation.id.slice(0, 8)}</span>
                          </div>
                          <p className="line-clamp-2 text-sm leading-5">{annotation.comment}</p>
                          <blockquote className="line-clamp-2 border-l-2 border-border pl-2 font-mono text-xs text-muted-foreground">
                            "{annotation.quote || "Global comment"}"
                          </blockquote>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          className="h-auto max-w-[320px] justify-start px-0 text-left"
                          variant="link"
                          onClick={() => onOpenDoc(annotation.sourcePath)}
                        >
                          <span className="truncate">{sourceTitle}</span>
                        </Button>
                        <div className="mono-path">{annotation.repoPath}</div>
                        <div className="mt-1 font-mono text-xs text-muted-foreground">{annotationLine(annotation)}</div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={annotation.status || "open"} />
                      </TableCell>
                      <TableCell>{formatDate(annotation.updatedAt ?? annotation.createdAt)}</TableCell>
                    </TableRow>
                  )
                })}
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
              noun: "annotations",
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
  )
}

function ProjectTable({
  items,
  onOpenProject,
}: {
  items: ProjectStat[]
  onOpenProject: (slug: string) => void
}) {
  const config = useMemo<TableQueryConfig<ProjectStat>>(
    () => ({
      searchText: (item) => [item.project.title, item.project.slug],
      filters: [
        {
          id: "status",
          label: "Status",
          value: (item) => item.project.status ?? "planned",
          valueLabel: statusLabel,
        },
        {
          id: "range",
          label: "Updated",
          multi: false,
          options: TIME_RANGE_OPTIONS,
          value: (item) => item.updated ?? null,
          match: (item, selected) => withinTimeRange(item.updated, selected),
        },
      ],
      sorts: [
        {
          id: "updated",
          label: "Updated newest",
          kind: "date",
          value: (item) => item.updated ?? null,
          initialDirection: "desc",
        },
        {
          id: "project",
          label: "Project",
          kind: "natural",
          value: (item) => item.project.title,
        },
        {
          id: "open",
          label: "Open tasks",
          kind: "number",
          value: (item) => item.openTaskCount,
          initialDirection: "desc",
        },
      ],
      defaultSort: "updated",
      defaultDirection: "desc",
      tieBreaker: (a, b) => a.project.slug.localeCompare(b.project.slug),
    }),
    []
  )
  const query = useTableQuery(items, config, { syncToHash: true })

  if (!items.length) {
    return (
      <EmptyPanel icon={FolderIcon} title="No projects" description="No project contracts were indexed." />
    )
  }

  return (
    <>
      <TableToolbar
        config={config}
        items={items}
        noun="projects"
        query={query}
        searchPlaceholder="Search projects..."
      />
      <Card>
        <CardContent>
          {query.result.filteredTotal === 0 ? (
            <QueryEmpty onReset={query.reset} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead label="Project" sortId="project" query={query} />
                  <TableHead>Status</TableHead>
                  <TableHead>Workstreams</TableHead>
                  <SortableHead label="Open tasks" sortId="open" query={query} />
                  <SortableHead label="Updated" sortId="updated" query={query} />
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.paginated.items.map((item) => (
                  <TableRow key={item.project.slug}>
                    <TableCell>
                      <Button
                        className="h-auto justify-start px-0 text-left"
                        variant="link"
                        onClick={() => onOpenProject(item.project.slug)}
                      >
                        {item.project.title}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {item.project.status ? <StatusBadge status={item.project.status} /> : "Planned"}
                    </TableCell>
                    <TableCell>{item.workstreamCount}</TableCell>
                    <TableCell>{item.openTaskCount}</TableCell>
                    <TableCell>{formatDate(item.updated)}</TableCell>
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
              noun: "projects",
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
  )
}

function TaskTable({
  emptyDescription,
  emptyTitle,
  items,
  onOpenDoc,
  onOpenProject,
}: {
  emptyDescription: string
  emptyTitle: string
  items: WorkspaceTaskItem[]
  onOpenDoc: (path: string) => void
  onOpenProject: (slug: string) => void
}) {
  const config = useMemo<TableQueryConfig<WorkspaceTaskItem>>(
    () => ({
      searchText: (item) => [
        item.doc.taskId,
        item.doc.title,
        item.doc.path,
        item.project?.title,
        item.workstream?.title,
        item.workstream?.id,
      ],
      filters: [
        {
          id: "project",
          label: "Project",
          value: (item) => item.project?.slug ?? null,
        },
        {
          id: "status",
          label: "Status",
          value: (item) => item.doc.status ?? "planned",
          valueLabel: statusLabel,
        },
      ],
      sorts: [
        {
          id: "updated",
          label: "Updated newest",
          kind: "date",
          value: (item) => item.doc.updated ?? null,
          initialDirection: "desc",
        },
        {
          id: "task",
          label: "Task",
          kind: "natural",
          value: (item) => item.doc.taskId ?? item.doc.title,
        },
      ],
      defaultSort: "updated",
      defaultDirection: "desc",
      tieBreaker: (a, b) => a.doc.path.localeCompare(b.doc.path),
    }),
    []
  )
  const query = useTableQuery(items, config, { syncToHash: true })

  if (!items.length) {
    return <EmptyPanel icon={ListChecksIcon} title={emptyTitle} description={emptyDescription} />
  }

  return (
    <>
      <TableToolbar
        config={config}
        items={items}
        noun="tasks"
        query={query}
        searchPlaceholder="Search tasks..."
      />
      <Card>
        <CardContent>
          {query.result.filteredTotal === 0 ? (
            <QueryEmpty onReset={query.reset} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead label="Task" sortId="task" query={query} />
                  <TableHead>Project</TableHead>
                  <TableHead>Workstream</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.paginated.items.map((item) => (
                  <TableRow key={item.doc.path}>
                    <TableCell>
                      <Button
                        className="h-auto justify-start px-0 text-left"
                        variant="link"
                        onClick={() => onOpenDoc(item.doc.path)}
                      >
                        {item.doc.title}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {item.project ? (
                        <Button
                          className="h-auto justify-start px-0 text-left"
                          variant="link"
                          onClick={() => onOpenProject(item.project?.slug ?? "")}
                        >
                          {item.project.title}
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>{item.workstream?.title ?? <span className="text-muted-foreground">None</span>}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.doc.status ?? "planned"} />
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
  )
}

function DocTable({
  docs,
  emptyTitle,
  onOpenDoc,
}: {
  docs: DocMeta[]
  emptyTitle: string
  onOpenDoc: (path: string) => void
}) {
  const config = useMemo<TableQueryConfig<DocMeta>>(
    () => ({
      searchText: (doc) => [doc.title, doc.path, doc.role, doc.project],
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
          id: "updated",
          label: "Updated newest",
          kind: "date",
          value: (doc) => doc.updated ?? null,
          initialDirection: "desc",
        },
        {
          id: "document",
          label: "Document",
          kind: "natural",
          value: (doc) => doc.title,
        },
      ],
      defaultSort: "updated",
      defaultDirection: "desc",
      tieBreaker: (a, b) => a.path.localeCompare(b.path),
    }),
    []
  )
  const query = useTableQuery(docs, config, { syncToHash: true })

  if (!docs.length) {
    return <EmptyPanel icon={FileTextIcon} title={emptyTitle} description="No matching documents were indexed." />
  }

  return (
    <>
      <TableToolbar
        config={config}
        items={docs}
        noun="documents"
        query={query}
        searchPlaceholder="Search documents..."
      />
      <Card>
        <CardContent>
          {query.result.filteredTotal === 0 ? (
            <QueryEmpty onReset={query.reset} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead label="Document" sortId="document" query={query} />
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <SortableHead label="Updated" sortId="updated" query={query} />
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.paginated.items.map((doc) => (
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
    </>
  )
}

function EmptyPanel({
  description,
  icon: Icon,
  title,
}: {
  description: string
  icon: LucideIcon
  title: string
}) {
  return (
    <Empty className="min-h-[320px] rounded-lg border bg-card">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
