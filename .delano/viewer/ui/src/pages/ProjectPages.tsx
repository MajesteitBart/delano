import { FileTextIcon, FolderIcon, ListChecksIcon } from "lucide-react"
import { useState } from "react"

import { TablePaginationFooter } from "@/components/molecules/TablePaginationFooter"
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
import { statusTone } from "@/lib/domain/status"
import type { DocMeta, ProjectIndex, ViewerIndex } from "@/lib/domain/types"
import { docsByPath } from "@/lib/domain/workspace-model"

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
  const [sourcePage, setSourcePage] = useState(1)

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
  const sourcePagination = paginateItems(sourceDocs, sourcePage)

  return (
    <section className="project-page">
      <div className="page-heading">
        <div className="eyebrow">Project</div>
        <h2>{project.title}</h2>
        <p>Source contracts, task state, and delivery structure for the selected project.</p>
      </div>
      <div className="summary-grid">
        <MetricCard label="Status" value={project.status ?? "planned"} />
        <MetricCard label="Workstreams" value={String(project.outline.workstreams?.length ?? 0)} />
        <MetricCard label="Open tasks" value={String(openTasks.length)} />
        <MetricCard label="Tasks" value={String(taskDocs.length)} />
      </div>
      <Card>
        <CardContent>
          <DocumentTable docs={sourcePagination.items} onOpenDoc={onOpenDoc} />
        </CardContent>
        <CardFooter>
          <TablePaginationFooter
            page={sourcePagination.page}
            pageCount={sourcePagination.pageCount}
            total={sourcePagination.total}
            onPageChange={setSourcePage}
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

export function ProjectWorkstreamsPage({
  docs,
  onOpenDoc,
  project,
}: {
  docs: Map<string, DocMeta>
  onOpenDoc: (path: string) => void
  project: ProjectIndex | null
}) {
  const workstreams = project?.outline?.workstreams ?? []
  const [page, setPage] = useState(1)
  const paginated = paginateItems(workstreams, page)

  return (
    <section className="project-page">
      <div className="page-heading">
        <div className="eyebrow">Project</div>
        <h2>Workstreams</h2>
        <p>{project?.title ?? "Selected project"}</p>
      </div>
      {!workstreams.length ? (
        <ProjectEmpty title="No workstreams" description="This project has no workstream contracts." />
      ) : (
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workstream</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead>Open tasks</TableHead>
                  <TableHead>Contract</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.items.map((workstream) => {
                  const taskDocs = (workstream.tasks ?? [])
                    .map((path) => docs.get(path))
                    .filter((doc): doc is DocMeta => Boolean(doc))
                  return (
                    <TableRow key={workstream.path}>
                      <TableCell>{workstream.title}</TableCell>
                      <TableCell>{taskDocs.length}</TableCell>
                      <TableCell>
                        {taskDocs.filter((doc) => statusTone(doc.status) !== "done").length}
                      </TableCell>
                      <TableCell>
                        <Button
                          className="h-auto justify-start px-0 text-left"
                          variant="link"
                          onClick={() => onOpenDoc(workstream.path)}
                        >
                          Open
                        </Button>
                      </TableCell>
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
  const tasks = project ? projectTaskDocs(project, docs) : []
  const [page, setPage] = useState(1)
  const paginated = paginateItems(tasks, page)

  return (
    <section className="project-page">
      <div className="page-heading">
        <div className="eyebrow">Project</div>
        <h2>Tasks</h2>
        <p>{project?.title ?? "Selected project"}</p>
      </div>
      {!tasks.length ? (
        <ProjectEmpty title="No tasks" description="This project has no indexed task contracts." />
      ) : (
        <Card>
          <CardContent>
            <DocumentTable docs={paginated.items} onOpenDoc={onOpenDoc} />
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
      )}
    </section>
  )
}

function projectTaskDocs(project: ProjectIndex, docs: Map<string, DocMeta>) {
  const workstreamTasks =
    project.outline?.workstreams?.flatMap((workstream) => workstream.tasks ?? []) ?? []
  const paths = [...workstreamTasks, ...(project.outline?.unassignedTasks ?? [])]
  return paths.map((path) => docs.get(path)).filter((doc): doc is DocMeta => Boolean(doc))
}

function DocumentTable({ docs, onOpenDoc }: { docs: DocMeta[]; onOpenDoc: (path: string) => void }) {
  return (
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
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
