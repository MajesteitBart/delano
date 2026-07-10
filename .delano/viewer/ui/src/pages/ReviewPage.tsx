import { ListChecksIcon } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

import { useTableQuery } from "@/app/useTableQuery"
import { fetchDocMarkdown, type WorkOverviewState } from "@/app/useWorkOverview"
import { SortableHead } from "@/components/molecules/SortableHead"
import { TablePaginationFooter } from "@/components/molecules/TablePaginationFooter"
import { TableToolbar } from "@/components/molecules/TableToolbar"
import { ReviewTaskPanel } from "@/components/organisms/ReviewTaskPanel"
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
import { formatDate } from "@/lib/domain/dates"
import { flattenActivity } from "@/lib/domain/file-activity"
import { DEFAULT_PAGE_SIZE } from "@/lib/domain/pagination"
import {
  evidenceHealthLabel,
  parseReviewSummary,
  type ReviewSummary,
} from "@/lib/domain/review-summary"
import {
  resultSummaryLabel,
  TIME_RANGE_OPTIONS,
  withinTimeRange,
  type TableQueryConfig,
} from "@/lib/domain/table-query"
import type { ViewerIndex } from "@/lib/domain/types"
import { reviewQueue, type TaskWorkItem } from "@/lib/domain/work-selectors"
import { cn } from "@/lib/utils"

/** Bounded client-side parsing: only this many recent done tasks are read. */
const REVIEW_PARSE_LIMIT = 40

export function ReviewPage({
  index,
  onOpenDoc,
  onOpenProject,
  overview,
}: {
  index: ViewerIndex | null
  onOpenDoc: (path: string) => void
  onOpenProject: (slug: string) => void
  overview: WorkOverviewState
}) {
  const queue = useMemo(() => reviewQueue(index), [index])
  const summaries = useReviewSummaries(queue)
  const [notice, setNotice] = useState<{ message: string; tone: "info" | "error" } | null>(null)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)

  const config = useMemo(
    () => reviewQueryConfig(summaries.byPath),
    [summaries.byPath]
  )
  const query = useTableQuery(queue, config, { syncToHash: true })

  const selected = queue.find((item) => item.doc.path === selectedPath) ?? null
  const activity = useMemo(
    () => flattenActivity(overview.payload, index),
    [overview.payload, index]
  )
  const relatedActivity = useMemo(() => {
    if (!selected?.project) return []
    return activity
      .filter((record) => record.doc?.project === selected.project?.slug)
      .slice(0, 8)
  }, [activity, selected])

  return (
    <section className={cn("workspace-page", selected && "min-[1280px]:pr-[416px]")}>
      <div className="page-heading">
        <div className="eyebrow">Workspace</div>
        <h2>Review recent delivery</h2>
        <p>Check completed contracts, evidence, and the files that changed.</p>
      </div>

      {notice && (
        <p
          className={
            notice.tone === "error"
              ? "text-sm text-destructive"
              : "text-sm text-muted-foreground"
          }
          role="status"
        >
          {notice.message}{" "}
          <Button variant="ghost" size="xs" onClick={() => setNotice(null)}>
            Dismiss
          </Button>
        </p>
      )}

      {!queue.length ? (
        <Empty className="min-h-[320px] rounded-lg border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ListChecksIcon />
            </EmptyMedia>
            <EmptyTitle>Nothing to review</EmptyTitle>
            <EmptyDescription>
              Completed tasks appear here with their acceptance and evidence health.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <TableToolbar
            config={config}
            items={queue}
            noun="completed tasks"
            query={query}
            searchPlaceholder="Search completed work..."
          />
          <Card>
            <CardContent>
              <div className="table-result-heading" role="status">
                {query.result.filteredTotal} completed task
                {query.result.filteredTotal === 1 ? "" : "s"}
              </div>
              {query.result.filteredTotal === 0 ? (
                <Empty className="min-h-[220px] border border-dashed bg-muted/20">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <ListChecksIcon />
                    </EmptyMedia>
                    <EmptyTitle>No matching tasks</EmptyTitle>
                    <EmptyDescription>
                      No completed task matches the current search and filters.
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
                      <TableHead>Project</TableHead>
                      <TableHead>Workstream</TableHead>
                      <TableHead>Evidence</TableHead>
                      <SortableHead label="Completed" sortId="completed" query={query} />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {query.paginated.items.map((item) => {
                      const summary = summaries.byPath.get(item.doc.path) ?? null
                      const isSelected = item.doc.path === selectedPath
                      return (
                        <TableRow
                          key={item.doc.path}
                          data-state={isSelected ? "selected" : undefined}
                          className="cursor-pointer"
                          tabIndex={0}
                          onClick={() =>
                            setSelectedPath((current) =>
                              current === item.doc.path ? null : item.doc.path
                            )
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault()
                              setSelectedPath((current) =>
                                current === item.doc.path ? null : item.doc.path
                              )
                            }
                          }}
                        >
                          <TableCell className="max-w-[420px]">
                            <div className="flex items-center gap-2">
                              <StatusBadge status={item.doc.status ?? "complete"} />
                              {item.taskId && (
                                <span className="font-mono text-xs text-muted-foreground">
                                  {item.taskId}
                                </span>
                              )}
                              <span className="truncate">{item.doc.title}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.project ? (
                              <Button
                                variant="link"
                                className="h-auto max-w-full justify-start px-0 text-left"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  onOpenProject(item.project!.slug)
                                }}
                              >
                                <span className="truncate">{item.project.title}</span>
                              </Button>
                            ) : (
                              <span className="text-muted-foreground">None</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.workstream?.id ?? (
                              <span className="text-muted-foreground">None</span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-[220px]">
                            <span className="block truncate text-xs text-muted-foreground">
                              {summary
                                ? evidenceHealthLabel(summary)
                                : summaries.loading
                                  ? "Reading…"
                                  : "Not read"}
                            </span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatDate(item.doc.updated)}
                          </TableCell>
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
          <p className="text-xs text-muted-foreground">
            Review is a derived queue over done tasks; the viewer never writes a review status.
          </p>
        </>
      )}

      <ReviewTaskPanel
        item={selected}
        onClose={() => setSelectedPath(null)}
        onOpenDoc={onOpenDoc}
        onStatus={(message, tone) => setNotice({ message, tone })}
        relatedActivity={relatedActivity}
        summary={selected ? (summaries.byPath.get(selected.doc.path) ?? null) : null}
        summaryLoading={summaries.loading}
      />
    </section>
  )
}

/**
 * Fetches and parses recent done-task markdown, bounded by
 * REVIEW_PARSE_LIMIT. Server-emitted summaries (T-002) will take precedence
 * once available; until then this is the plan's bounded client parser.
 */
function useReviewSummaries(queue: TaskWorkItem[]) {
  const [byPath, setByPath] = useState<Map<string, ReviewSummary>>(new Map())
  const [loading, setLoading] = useState(false)
  const pendingRef = useRef(new Set<string>())

  const paths = useMemo(
    () => queue.slice(0, REVIEW_PARSE_LIMIT).map((item) => item.doc.path),
    [queue]
  )

  useEffect(() => {
    const missing = paths.filter(
      (path) => !byPath.has(path) && !pendingRef.current.has(path)
    )
    if (!missing.length) return
    let cancelled = false
    missing.forEach((path) => pendingRef.current.add(path))
    setLoading(true)
    void Promise.all(
      missing.map(async (path) => {
        try {
          const markdown = await fetchDocMarkdown(path)
          return [path, parseReviewSummary(markdown)] as const
        } catch {
          return null
        }
      })
    ).then((entries) => {
      if (cancelled) return
      setByPath((current) => {
        const next = new Map(current)
        for (const entry of entries) {
          if (entry) next.set(entry[0], entry[1])
        }
        return next
      })
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [paths, byPath])

  return { byPath, loading }
}

function reviewQueryConfig(
  summaries: Map<string, ReviewSummary>
): TableQueryConfig<TaskWorkItem> {
  return {
    searchText: (item) => [
      item.taskId,
      item.doc.title,
      item.doc.path,
      item.project?.title,
      item.workstream?.id,
      item.workstream?.title,
    ],
    filters: [
      {
        id: "project",
        label: "Project",
        value: (item) => item.project?.slug ?? null,
        valueLabel: (value) => value,
      },
      {
        id: "evidence",
        label: "Evidence",
        multi: false,
        options: [
          { value: "present", label: "Evidence present" },
          { value: "missing", label: "Evidence missing" },
        ],
        value: () => null,
        match: (item, selected) => {
          const summary = summaries.get(item.doc.path)
          if (!summary) return false
          const present = summary.evidencePresent
          return selected.includes(present ? "present" : "missing")
        },
      },
      {
        id: "range",
        label: "Range",
        multi: false,
        options: TIME_RANGE_OPTIONS,
        value: (item) => item.doc.updated ?? null,
        match: (item, selected) => withinTimeRange(item.doc.updated, selected),
      },
    ],
    sorts: [
      {
        id: "completed",
        label: "Completed newest",
        kind: "date",
        value: (item) => item.doc.updated ?? null,
        initialDirection: "desc",
      },
      {
        id: "task",
        label: "Task ID",
        kind: "natural",
        value: (item) => item.taskId ?? null,
      },
    ],
    defaultSort: "completed",
    defaultDirection: "desc",
    tieBreaker: (a, b) => a.doc.path.localeCompare(b.doc.path),
  }
}
