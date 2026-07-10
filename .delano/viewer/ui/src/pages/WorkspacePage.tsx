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
import type { ColumnDef } from "@tanstack/react-table"

import { StatusBadge } from "@/components/atoms/StatusBadge"
import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/molecules/DataTable"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { messageFromError, requestJson } from "@/lib/api"
import { annotationLine } from "@/lib/domain/annotations"
import { formatDate } from "@/lib/domain/dates"
import { statusLabel } from "@/lib/domain/status"
import type { Annotation, DocMeta, ViewerIndex } from "@/lib/domain/types"
import { type WorkspaceView } from "@/lib/domain/navigation"
import { getWorkspaceModel, type ProjectStat, type WorkspaceTaskItem } from "@/lib/domain/workspace-model"
import { dataTableMeta } from "@/lib/data-table"

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
  const rows = sorted.map((annotation) => {
    const sourceDoc = docs.get(annotation.sourcePath)
    return {
      annotation,
      sourceTitle: sourceDoc?.title ?? annotation.repoPath,
    }
  })
  const columns: ColumnDef<(typeof rows)[number]>[] = [
    {
      id: "annotation",
      accessorFn: (row) =>
        `${row.annotation.type} ${row.annotation.id} ${row.annotation.comment} ${row.annotation.quote}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Annotation" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={annotationTypeVariant(row.original.annotation.type)}>
              {row.original.annotation.type}
            </Badge>
            <span className="font-mono text-xs text-muted-foreground">
              {row.original.annotation.id.slice(0, 8)}
            </span>
          </div>
          <p className="line-clamp-2 text-sm leading-5">
            {row.original.annotation.comment}
          </p>
          <blockquote className="line-clamp-2 border-l-2 border-border pl-2 font-mono text-xs text-muted-foreground">
            "{row.original.annotation.quote || "Global comment"}"
          </blockquote>
        </div>
      ),
      filterFn: "includesString",
      meta: dataTableMeta({
        cellClassName: "min-w-[26rem] max-w-[32rem] whitespace-normal",
        headerClassName: "min-w-[26rem]",
      }),
    },
    {
      id: "source",
      accessorFn: (row) =>
        `${row.sourceTitle} ${row.annotation.repoPath} ${annotationLine(row.annotation)}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Source" />
      ),
      cell: ({ row }) => (
        <>
          <Button
            className="h-auto max-w-80 justify-start px-0 text-left"
            variant="link"
            onClick={() => onOpenDoc(row.original.annotation.sourcePath)}
          >
            <span className="truncate" title={row.original.sourceTitle}>
              {row.original.sourceTitle}
            </span>
          </Button>
          <div className="mono-path">{row.original.annotation.repoPath}</div>
          <div className="mt-1 font-mono text-xs text-muted-foreground">
            {annotationLine(row.original.annotation)}
          </div>
        </>
      ),
      filterFn: "includesString",
      meta: dataTableMeta({
        cellClassName: "min-w-80 whitespace-normal",
        headerClassName: "min-w-80",
      }),
    },
    {
      id: "status",
      accessorFn: (row) => statusLabel(row.annotation.status || "open"),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <StatusBadge status={row.original.annotation.status || "open"} />
      ),
      filterFn: "includesString",
      meta: dataTableMeta({
        cellClassName: "min-w-28",
        headerClassName: "min-w-28",
      }),
    },
    {
      id: "updated",
      accessorFn: (row) =>
        formatDate(row.annotation.updatedAt ?? row.annotation.createdAt),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated" />
      ),
      cell: ({ row }) =>
        formatDate(
          row.original.annotation.updatedAt ??
            row.original.annotation.createdAt
        ),
      filterFn: "includesString",
      sortingFn: (a, b) =>
        String(
          a.original.annotation.updatedAt ??
            a.original.annotation.createdAt ??
            ""
        ).localeCompare(
          String(
            b.original.annotation.updatedAt ??
              b.original.annotation.createdAt ??
              ""
          )
        ),
      meta: dataTableMeta({
        cellClassName: "min-w-40",
        headerClassName: "min-w-40",
      }),
    },
  ]

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
        <DataTable
          columns={columns}
          data={rows}
          getRowId={(row) => row.annotation.id}
        />
      </CardContent>
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
  const columns: ColumnDef<ProjectStat>[] = [
    {
      id: "project",
      accessorFn: (item) => item.project.title,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Project" />
      ),
      cell: ({ row }) => (
        <Button
          className="h-auto justify-start px-0 text-left whitespace-normal"
          variant="link"
          onClick={() => onOpenProject(row.original.project.slug)}
        >
          {row.original.project.title}
        </Button>
      ),
      filterFn: "includesString",
      meta: dataTableMeta({
        cellClassName: "min-w-72 whitespace-normal",
        headerClassName: "min-w-72",
      }),
    },
    {
      id: "status",
      accessorFn: (item) => statusLabel(item.project.status),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) =>
        row.original.project.status ? (
          <StatusBadge status={row.original.project.status} />
        ) : (
          "Planned"
        ),
      filterFn: "includesString",
      meta: dataTableMeta({
        cellClassName: "min-w-28",
        headerClassName: "min-w-28",
      }),
    },
    {
      id: "workstreams",
      accessorFn: (item) => String(item.workstreamCount),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Workstreams" />
      ),
      cell: ({ row }) => row.original.workstreamCount,
      filterFn: "includesString",
      meta: dataTableMeta({
        cellClassName: "min-w-32",
        headerClassName: "min-w-32",
      }),
    },
    {
      id: "openTasks",
      accessorFn: (item) => String(item.openTaskCount),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Open tasks" />
      ),
      cell: ({ row }) => row.original.openTaskCount,
      filterFn: "includesString",
      meta: dataTableMeta({
        cellClassName: "min-w-32",
        headerClassName: "min-w-32",
      }),
    },
    {
      id: "updated",
      accessorFn: (item) => formatDate(item.updated),
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

  if (!items.length) {
    return (
      <EmptyPanel icon={FolderIcon} title="No projects" description="No project contracts were indexed." />
    )
  }

  return (
    <Card>
      <CardContent>
        <DataTable
          columns={columns}
          data={items}
          getRowId={(item) => item.project.slug}
        />
      </CardContent>
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
  const columns: ColumnDef<WorkspaceTaskItem>[] = [
    {
      id: "task",
      accessorFn: (item) => `${item.doc.taskId ?? ""} ${item.doc.title}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Task" />
      ),
      cell: ({ row }) => (
        <Button
          className="h-auto justify-start px-0 text-left whitespace-normal"
          variant="link"
          onClick={() => onOpenDoc(row.original.doc.path)}
        >
          {row.original.doc.title}
        </Button>
      ),
      filterFn: "includesString",
      meta: dataTableMeta({
        cellClassName: "min-w-80 whitespace-normal",
        headerClassName: "min-w-80",
      }),
    },
    {
      id: "project",
      accessorFn: (item) => item.project?.title ?? "None",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Project" />
      ),
      cell: ({ row }) =>
        row.original.project ? (
          <Button
            className="h-auto justify-start px-0 text-left whitespace-normal"
            variant="link"
            onClick={() => onOpenProject(row.original.project?.slug ?? "")}
          >
            {row.original.project.title}
          </Button>
        ) : (
          <span className="text-muted-foreground">None</span>
        ),
      filterFn: "includesString",
      meta: dataTableMeta({
        cellClassName: "min-w-64 whitespace-normal",
        headerClassName: "min-w-64",
      }),
    },
    {
      id: "workstream",
      accessorFn: (item) => item.workstream?.title ?? "None",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Workstream" />
      ),
      cell: ({ row }) =>
        row.original.workstream?.title ?? (
          <span className="text-muted-foreground">None</span>
        ),
      filterFn: "includesString",
      meta: dataTableMeta({
        cellClassName: "min-w-64 whitespace-normal",
        headerClassName: "min-w-64",
      }),
    },
    {
      id: "status",
      accessorFn: (item) => statusLabel(item.doc.status),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <StatusBadge status={row.original.doc.status ?? "planned"} />
      ),
      filterFn: "includesString",
      meta: dataTableMeta({
        cellClassName: "min-w-28",
        headerClassName: "min-w-28",
      }),
    },
  ]

  if (!items.length) {
    return <EmptyPanel icon={ListChecksIcon} title={emptyTitle} description={emptyDescription} />
  }

  return (
    <Card>
      <CardContent>
        <DataTable
          columns={columns}
          data={items}
          getRowId={(item) => item.doc.path}
        />
      </CardContent>
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

  if (!docs.length) {
    return <EmptyPanel icon={FileTextIcon} title={emptyTitle} description="No matching documents were indexed." />
  }

  return (
    <Card>
      <CardContent>
        <DataTable columns={columns} data={docs} getRowId={(doc) => doc.path} />
      </CardContent>
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
