import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  FileTextIcon,
  FolderIcon,
  ListChecksIcon,
  TrendingUpIcon,
} from "lucide-react"
import { useState } from "react"

import { TablePaginationFooter } from "@/components/molecules/TablePaginationFooter"
import { StatusBadge } from "@/components/atoms/StatusBadge"
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
import { formatDate } from "@/lib/domain/dates"
import { paginateItems } from "@/lib/domain/pagination"
import type { DocMeta, ViewerIndex } from "@/lib/domain/types"
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
  icon: typeof FolderIcon | typeof AlertTriangleIcon | typeof CheckCircle2Icon | typeof FileTextIcon | typeof ListChecksIcon | typeof TrendingUpIcon
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
