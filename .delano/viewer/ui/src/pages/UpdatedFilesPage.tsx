import {
  GitBranchIcon,
  RefreshCwIcon,
  ShieldAlertIcon,
} from "lucide-react"
import { useMemo, useState } from "react"

import { useTableQuery } from "@/app/useTableQuery"
import type { WorkOverviewState } from "@/app/useWorkOverview"
import { SortableHead } from "@/components/molecules/SortableHead"
import { TablePaginationFooter } from "@/components/molecules/TablePaginationFooter"
import { TableToolbar } from "@/components/molecules/TableToolbar"
import { FileActivityInspector } from "@/components/organisms/FileActivityInspector"
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
import { formatDate, relativeTime } from "@/lib/domain/dates"
import {
  activityCounts,
  changeKindLabel,
  flattenActivity,
  sourceLabel,
  type FileActivityRecord,
} from "@/lib/domain/file-activity"
import { DEFAULT_PAGE_SIZE } from "@/lib/domain/pagination"
import {
  resultSummaryLabel,
  TIME_RANGE_OPTIONS,
  withinTimeRange,
  type TableQueryConfig,
} from "@/lib/domain/table-query"
import type { ViewerIndex } from "@/lib/domain/types"
import { cn } from "@/lib/utils"

export function UpdatedFilesPage({
  index,
  onOpenDoc,
  overview,
}: {
  index: ViewerIndex | null
  onOpenDoc: (path: string) => void
  overview: WorkOverviewState
}) {
  const records = useMemo(
    () => flattenActivity(overview.payload, index),
    [overview.payload, index]
  )
  const config = useMemo(() => activityQueryConfig(), [])
  const query = useTableQuery(records, config, { syncToHash: true })
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const selected = records.find((record) => record.key === selectedKey) ?? null
  const relatedDocs = useMemo(
    () =>
      selected?.commit
        ? records.filter(
            (record) => record.commit?.hash === selected.commit?.hash && record.doc
          )
        : [],
    [records, selected]
  )

  // Group by provenance under the default newest-first ordering; explicit
  // column sorts switch to a flat list so the sort stays truthful.
  const grouped = query.state.sort === "updated"
  const orderedItems = useMemo(() => {
    if (!grouped) return query.result.items
    return [
      ...query.result.items.filter((item) => item.source === "working-tree"),
      ...query.result.items.filter((item) => item.source === "commit"),
    ]
  }, [grouped, query.result.items])
  const page = query.paginated.page
  const pageItems = useMemo(() => {
    const start = (page - 1) * DEFAULT_PAGE_SIZE
    return orderedItems.slice(start, start + DEFAULT_PAGE_SIZE)
  }, [orderedItems, page])

  const counts = activityCounts(query.result.items)

  return (
    <section className={cn("workspace-page", selected && "min-[1280px]:pr-[416px]")}>
      <div className="page-heading">
        <div className="eyebrow">Workspace</div>
        <h2>Updated files</h2>
        <p>Working-tree changes and recent committed activity, with explicit provenance.</p>
      </div>

      {overview.loading && (
        <StatePanel
          icon={<RefreshCwIcon />}
          title="Reading file activity"
          description="Collecting Git working-tree and recent commit records."
        />
      )}

      {!overview.loading && overview.unsupported && (
        <StatePanel
          icon={<GitBranchIcon />}
          title="Git activity not available yet"
          description="This viewer server does not expose the work-overview contract. Contract timestamps remain available under Validation; file activity appears once the server endpoint lands."
        />
      )}

      {!overview.loading && !overview.unsupported && overview.error && (
        <StatePanel
          icon={<ShieldAlertIcon />}
          title="File activity unavailable"
          description={overview.error}
          action={
            <Button variant="outline" size="sm" onClick={overview.refresh}>
              Retry
            </Button>
          }
        />
      )}

      {!overview.loading &&
        !overview.unsupported &&
        !overview.error &&
        overview.payload &&
        !overview.payload.gitAvailable && (
          <StatePanel
            icon={<GitBranchIcon />}
            title="Git is unavailable"
            description={
              overview.payload.gitUnavailableReason ??
              "This directory is not a Git worktree, so actual file activity cannot be shown. Contract timestamps remain separate and unaffected."
            }
          />
        )}

      {!overview.loading &&
        !overview.unsupported &&
        !overview.error &&
        overview.payload?.gitAvailable && (
          <>
            <TableToolbar
              config={config}
              items={records}
              noun="file records"
              query={query}
              searchPlaceholder="Search paths, commits, or projects..."
            />
            <Card>
              <CardContent>
                <div className="table-result-heading" role="status">
                  {query.result.filteredTotal} file record
                  {query.result.filteredTotal === 1 ? "" : "s"}
                </div>
                {query.result.filteredTotal === 0 ? (
                  <Empty className="min-h-[220px] border border-dashed bg-muted/20">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <GitBranchIcon />
                      </EmptyMedia>
                      <EmptyTitle>No matching activity</EmptyTitle>
                      <EmptyDescription>
                        No file records match the current search and filters.
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
                        <SortableHead label="File" sortId="path" query={query} />
                        <SortableHead label="Change" sortId="change" query={query} />
                        <TableHead>Source</TableHead>
                        <TableHead>Context</TableHead>
                        <SortableHead label="Updated" sortId="updated" query={query} />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pageItems.map((record, rowIndex) => {
                        const previous = pageItems[rowIndex - 1]
                        const showGroup =
                          grouped && (!previous || previous.source !== record.source)
                        return (
                          <ActivityRow
                            key={record.key}
                            record={record}
                            counts={counts}
                            selected={record.key === selectedKey}
                            showGroup={showGroup}
                            onSelect={() =>
                              setSelectedKey((current) =>
                                current === record.key ? null : record.key
                              )
                            }
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
                  summary={resultSummaryLabel({
                    filteredTotal: query.result.filteredTotal,
                    noun: "items",
                    page: query.paginated.page,
                    pageSize: DEFAULT_PAGE_SIZE,
                    shownCount: pageItems.length,
                    total: query.result.total,
                  })}
                  onPageChange={query.setPage}
                />
              </CardFooter>
            </Card>
            <p className="text-xs text-muted-foreground">
              File activity comes from local Git; contract timestamps remain separate.
            </p>
          </>
        )}

      <FileActivityInspector
        index={index}
        record={selected}
        relatedDocs={relatedDocs}
        onClose={() => setSelectedKey(null)}
        onOpenDoc={onOpenDoc}
        onViewCommit={(shortHash) => query.setSearch(shortHash)}
      />
    </section>
  )
}

function ActivityRow({
  counts,
  onSelect,
  record,
  selected,
  showGroup,
}: {
  counts: { workingTree: number; committed: number }
  onSelect: () => void
  record: FileActivityRecord
  selected: boolean
  showGroup: boolean
}) {
  return (
    <>
      {showGroup && (
        <TableRow className="table-group-row" aria-hidden="true">
          <TableCell colSpan={5}>
            {record.source === "working-tree"
              ? `Working tree · ${counts.workingTree} file${counts.workingTree === 1 ? "" : "s"}`
              : `Recent commits · ${counts.committed} file${counts.committed === 1 ? "" : "s"}`}
          </TableCell>
        </TableRow>
      )}
      <TableRow
        data-state={selected ? "selected" : undefined}
        className="cursor-pointer"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            onSelect()
          }
        }}
      >
        <TableCell className="max-w-[420px]">
          <span className="block truncate font-mono text-xs" title={record.path}>
            {record.path}
          </span>
          {record.renamedFrom && (
            <span className="mono-path">from {record.renamedFrom}</span>
          )}
        </TableCell>
        <TableCell>{changeKindLabel(record.changeKind)}</TableCell>
        <TableCell>
          <span className={record.source === "commit" ? "font-mono text-xs" : undefined}>
            {sourceLabel(record)}
          </span>
        </TableCell>
        <TableCell className="max-w-[220px]">
          <span className="block truncate" title={record.contextLabel}>
            {record.contextLabel}
          </span>
        </TableCell>
        <TableCell className="whitespace-nowrap">
          {record.source === "working-tree"
            ? `Observed ${relativeTime(record.timestamp)}`
            : `Committed ${formatDate(record.timestamp)}`}
        </TableCell>
      </TableRow>
    </>
  )
}

function StatePanel({
  action,
  description,
  icon,
  title,
}: {
  action?: React.ReactNode
  description: string
  icon: React.ReactNode
  title: string
}) {
  return (
    <Empty className="min-h-[320px] rounded-lg border bg-card">
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
        {action && <EmptyContent>{action}</EmptyContent>}
      </EmptyHeader>
    </Empty>
  )
}

function activityQueryConfig(): TableQueryConfig<FileActivityRecord> {
  return {
    searchText: (record) => [
      record.path,
      record.renamedFrom,
      record.contextLabel,
      record.commit?.shortHash,
      record.commit?.hash,
      record.commit?.subject,
      record.changeKind,
    ],
    filters: [
      {
        id: "source",
        label: "Source",
        value: (record) => record.source,
        options: [
          { value: "working-tree", label: "Working tree" },
          { value: "commit", label: "Recent commits" },
        ],
      },
      {
        id: "change",
        label: "Change",
        value: (record) => record.changeKind.toLowerCase(),
        valueLabel: changeKindLabel,
      },
      {
        id: "project",
        label: "Project",
        value: (record) => record.doc?.project ?? null,
      },
      {
        id: "range",
        label: "Range",
        multi: false,
        options: TIME_RANGE_OPTIONS,
        value: (record) => record.timestamp,
        match: (record, selected) => withinTimeRange(record.timestamp, selected),
      },
    ],
    sorts: [
      { id: "updated", label: "Newest", kind: "date", value: (record) => record.timestamp, initialDirection: "desc" },
      { id: "path", label: "Path", kind: "natural", value: (record) => record.path },
      { id: "change", label: "Change kind", value: (record) => record.changeKind },
    ],
    defaultSort: "updated",
    defaultDirection: "desc",
    tieBreaker: (a, b) => a.path.localeCompare(b.path),
  }
}
