import { ListTodoIcon } from "lucide-react"
import { useMemo } from "react"

import { useTableQuery } from "@/app/useTableQuery"
import { SortableHead } from "@/components/molecules/SortableHead"
import { TablePaginationFooter } from "@/components/molecules/TablePaginationFooter"
import { TableToolbar } from "@/components/molecules/TableToolbar"
import { StatusBadge } from "@/components/atoms/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
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
import { DEFAULT_PAGE_SIZE } from "@/lib/domain/pagination"
import {
  resultSummaryLabel,
  type TableQueryConfig,
} from "@/lib/domain/table-query"
import type { ViewerIndex } from "@/lib/domain/types"
import {
  compareByRank,
  PLAN_CATEGORY_COPY,
  planCategoryCounts,
  planItems,
  priorityRank,
  type PlanCategory,
  type PlanItem,
} from "@/lib/domain/work-selectors"

const CATEGORY_ORDER: Record<PlanCategory, number> = {
  should: 0,
  can: 1,
  could: 2,
  waiting: 3,
}

export function PlanPage({
  index,
  onOpenDoc,
  onOpenProject,
}: {
  index: ViewerIndex | null
  onOpenDoc: (path: string) => void
  onOpenProject: (slug: string) => void
}) {
  const items = useMemo(() => planItems(index), [index])
  const counts = useMemo(() => planCategoryCounts(items), [items])
  const config = useMemo(() => planQueryConfig(), [])
  const query = useTableQuery(items, config, { syncToHash: true })
  const grouped = query.state.sort === "recommended"

  return (
    <section className="workspace-page">
      <div className="page-heading">
        <div className="eyebrow">Workspace</div>
        <h2>Plan upcoming work</h2>
        <p>Should, can, could, and waiting — derived from canonical task state and dependencies.</p>
      </div>

      <div className="plan-summary" role="list">
        {(Object.keys(PLAN_CATEGORY_COPY) as PlanCategory[]).map((category) => (
          <div key={category} className="plan-summary-item" role="listitem">
            <div className="plan-summary-title">
              {PLAN_CATEGORY_COPY[category].label} {counts[category]}
            </div>
            <div className="plan-summary-definition">
              {PLAN_CATEGORY_COPY[category].definition}
            </div>
          </div>
        ))}
      </div>

      {!items.length ? (
        <Empty className="min-h-[320px] rounded-lg border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ListTodoIcon />
            </EmptyMedia>
            <EmptyTitle>No upcoming work</EmptyTitle>
            <EmptyDescription>
              Every indexed task is complete or deferred; new tasks appear here as soon as they are planned.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <TableToolbar
            config={config}
            items={items}
            noun="open tasks"
            query={query}
            searchPlaceholder="Search upcoming work..."
          />
          <Card>
            <CardContent>
              {query.result.filteredTotal === 0 ? (
                <Empty className="min-h-[220px] border border-dashed bg-muted/20">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <ListTodoIcon />
                    </EmptyMedia>
                    <EmptyTitle>No matching tasks</EmptyTitle>
                    <EmptyDescription>
                      No open task matches the current search and filters.
                    </EmptyDescription>
                    <EmptyContent>
                      <Button variant="outline" size="sm" onClick={query.reset}>
                        Reset filters
                      </Button>
                    </EmptyContent>
                  </EmptyHeader>
                </Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableHead label="Task" sortId="task" query={query} />
                      <TableHead>Project &amp; workstream</TableHead>
                      <TableHead>Canonical state</TableHead>
                      <SortableHead label="Priority" sortId="priority" query={query} />
                      <TableHead>Why here</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {query.paginated.items.map((item, rowIndex) => {
                      const previous = query.paginated.items[rowIndex - 1]
                      const showGroup =
                        grouped && (!previous || previous.category !== item.category)
                      return (
                        <PlanRow
                          key={item.doc.path}
                          item={item}
                          showGroup={showGroup}
                          onOpenDoc={onOpenDoc}
                          onOpenProject={onOpenProject}
                        />
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
                summary={`${resultSummaryLabel({
                  filteredTotal: query.result.filteredTotal,
                  noun: "open tasks",
                  page: query.paginated.page,
                  pageSize: DEFAULT_PAGE_SIZE,
                  shownCount: query.paginated.items.length,
                  total: query.result.total,
                })} · Categories are computed, task files remain the source of truth.`}
                onPageChange={query.setPage}
              />
            </CardFooter>
          </Card>
        </>
      )}
    </section>
  )
}

function PlanRow({
  item,
  onOpenDoc,
  onOpenProject,
  showGroup,
}: {
  item: PlanItem
  onOpenDoc: (path: string) => void
  onOpenProject: (slug: string) => void
  showGroup: boolean
}) {
  return (
    <>
      {showGroup && (
        <TableRow className="table-group-row" aria-hidden="true">
          <TableCell colSpan={6}>
            {PLAN_CATEGORY_COPY[item.category].label} —{" "}
            {PLAN_CATEGORY_COPY[item.category].definition}
          </TableCell>
        </TableRow>
      )}
      <TableRow>
        <TableCell className="max-w-[360px]">
          <div className="flex items-center gap-2">
            {item.taskId && (
              <span className="font-mono text-xs text-muted-foreground">{item.taskId}</span>
            )}
            <span className="truncate">{item.doc.title}</span>
          </div>
        </TableCell>
        <TableCell className="max-w-[240px]">
          {item.project ? (
            <Button
              variant="link"
              className="h-auto max-w-full justify-start px-0 text-left"
              onClick={() => onOpenProject(item.project!.slug)}
            >
              <span className="truncate">{item.project.title}</span>
            </Button>
          ) : (
            <span className="text-muted-foreground">None</span>
          )}
          {item.workstream?.id && (
            <div className="font-mono text-xs text-muted-foreground">
              {item.workstream.id}
            </div>
          )}
        </TableCell>
        <TableCell>
          <StatusBadge status={item.doc.status ?? "planned"} />
        </TableCell>
        <TableCell>
          {item.priority ? (
            <span className="capitalize">{item.priority}</span>
          ) : (
            <span className="text-muted-foreground">None</span>
          )}
        </TableCell>
        <TableCell className="max-w-[220px]">
          <span className="block truncate text-xs text-muted-foreground" title={item.reason}>
            {item.reason}
          </span>
        </TableCell>
        <TableCell className="text-right">
          <Button
            variant="link"
            className="h-auto px-0"
            onClick={() => onOpenDoc(item.doc.path)}
          >
            {item.category === "should" && item.reason === "Active work"
              ? "Open active task"
              : "Open task"}
          </Button>
        </TableCell>
      </TableRow>
    </>
  )
}

function planQueryConfig(): TableQueryConfig<PlanItem> {
  return {
    searchText: (item) => [
      item.taskId,
      item.doc.title,
      item.doc.path,
      item.project?.title,
      item.workstream?.id,
      item.workstream?.title,
      item.reason,
    ],
    filters: [
      {
        id: "project",
        label: "Project",
        value: (item) => item.project?.slug ?? null,
      },
      {
        id: "workstream",
        label: "Workstream",
        value: (item) => item.workstream?.id ?? null,
      },
      {
        id: "priority",
        label: "Priority",
        value: (item) => item.priority?.toLowerCase() ?? null,
      },
    ],
    sorts: [
      {
        id: "recommended",
        label: "Recommended",
        kind: "number",
        value: (item) => CATEGORY_ORDER[item.category],
      },
      {
        id: "task",
        label: "Task ID",
        kind: "natural",
        value: (item) => item.taskId ?? null,
      },
      {
        id: "priority",
        label: "Priority",
        kind: "number",
        value: (item) => priorityRank(item.priority),
      },
    ],
    defaultSort: "recommended",
    defaultDirection: "asc",
    tieBreaker: compareByRank,
  }
}
