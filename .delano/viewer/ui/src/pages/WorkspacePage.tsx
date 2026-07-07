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

import { TablePaginationFooter } from "@/components/molecules/TablePaginationFooter"
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
import { paginateItems } from "@/lib/domain/pagination"
import type { Annotation, DocMeta, ViewerIndex } from "@/lib/domain/types"
import { type WorkspaceView } from "@/lib/domain/navigation"
import { getWorkspaceModel, type ProjectStat, type WorkspaceTaskItem } from "@/lib/domain/workspace-model"

const WORKSPACE_COPY: Record<WorkspaceView, { title: string; description: string }> = {
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
  const copy = WORKSPACE_COPY[view]
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [annotationsLoading, setAnnotationsLoading] = useState(false)
  const [annotationsError, setAnnotationsError] = useState("")

  useEffect(() => {
    if (view !== "workspace-annotations") return
    let cancelled = false
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
  const [page, setPage] = useState(1)
  const docs = useMemo(() => {
    const map = new Map<string, DocMeta>()
    ;(index?.docs ?? []).forEach((doc) => map.set(doc.path, doc))
    return map
  }, [index])
  const sorted = useMemo(
    () =>
      annotations
        .filter((annotation) => annotation.status !== "deleted")
        .slice()
        .sort((a, b) => (
          String(b.updatedAt ?? b.createdAt ?? "").localeCompare(String(a.updatedAt ?? a.createdAt ?? "")) ||
          String(a.sourcePath).localeCompare(String(b.sourcePath)) ||
          Number(a.anchor?.lineStart ?? 0) - Number(b.anchor?.lineStart ?? 0)
        )),
    [annotations]
  )
  const paginated = paginateItems(sorted, page)

  useEffect(() => {
    setPage(1)
  }, [sorted.length])

  if (loading) {
    return <EmptyPanel icon={RefreshCwIcon} title="Loading annotations" description="Reading viewer review comments." />
  }

  if (error) {
    return <EmptyPanel icon={AlertTriangleIcon} title="Annotations unavailable" description={error} />
  }

  if (!sorted.length) {
    return <EmptyPanel icon={MessageSquareTextIcon} title="No annotations" description="No viewer comments have been captured yet." />
  }

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Annotation</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.items.map((annotation) => {
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
      </CardContent>
      <CardFooter>
        <TablePaginationFooter
          page={paginated.page}
          pageCount={paginated.pageCount}
          total={paginated.total}
          onPageChange={setPage}
        />
      </CardFooter>
    </Card>
  )
}

function ProjectTable({
  items,
  onOpenProject,
}: {
  items: ProjectStat[]
  onOpenProject: (slug: string) => void
}) {
  const [page, setPage] = useState(1)
  const paginated = paginateItems(items, page)

  if (!items.length) {
    return (
      <EmptyPanel icon={FolderIcon} title="No projects" description="No project contracts were indexed." />
    )
  }

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Workstreams</TableHead>
              <TableHead>Open tasks</TableHead>
              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.items.map((item) => (
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
      </CardContent>
      <CardFooter>
        <TablePaginationFooter
          page={paginated.page}
          pageCount={paginated.pageCount}
          total={paginated.total}
          onPageChange={setPage}
        />
      </CardFooter>
    </Card>
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
  const [page, setPage] = useState(1)
  const paginated = paginateItems(items, page)

  if (!items.length) {
    return <EmptyPanel icon={ListChecksIcon} title={emptyTitle} description={emptyDescription} />
  }

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Workstream</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.items.map((item) => (
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
      </CardContent>
      <CardFooter>
        <TablePaginationFooter
          page={paginated.page}
          pageCount={paginated.pageCount}
          total={paginated.total}
          onPageChange={setPage}
        />
      </CardFooter>
    </Card>
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
  const [page, setPage] = useState(1)
  const paginated = paginateItems(docs, page)

  if (!docs.length) {
    return <EmptyPanel icon={FileTextIcon} title={emptyTitle} description="No matching documents were indexed." />
  }

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.items.map((doc) => (
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
      </CardContent>
      <CardFooter>
        <TablePaginationFooter
          page={paginated.page}
          pageCount={paginated.pageCount}
          total={paginated.total}
          onPageChange={setPage}
        />
      </CardFooter>
    </Card>
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
