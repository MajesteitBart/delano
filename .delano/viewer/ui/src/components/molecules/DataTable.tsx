import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ListFilterIcon,
} from "lucide-react"
import { useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"

import { TablePaginationFooter } from "@/components/molecules/TablePaginationFooter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { DataTableColumnMeta } from "@/lib/data-table"

export function DataTable<TData>({
  columns,
  data,
  emptyMessage = "No results.",
  getRowId,
  pageSize = 12,
  showPagination = true,
}: {
  columns: ColumnDef<TData>[]
  data: TData[]
  emptyMessage?: string
  getRowId?: (row: TData) => string
  pageSize?: number
  showPagination?: boolean
}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })
  // TanStack Table intentionally returns mutable callback APIs that the React
  // compiler cannot memoize safely.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: { columnFilters, pagination, sorting },
  })
  const filteredTotal = table.getFilteredRowModel().rows.length

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {columnFilters.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => table.resetColumnFilters()}
          >
            Clear filters
          </Button>
        </div>
      )}
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef
                    .meta as DataTableColumnMeta | undefined
                  return (
                    <TableHead
                      key={header.id}
                      className={meta?.headerClassName}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef
                      .meta as DataTableColumnMeta | undefined
                    return (
                      <TableCell
                        key={cell.id}
                        className={meta?.cellClassName}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination && (
        <TablePaginationFooter
          page={pagination.pageIndex + 1}
          pageCount={Math.max(table.getPageCount(), 1)}
          total={filteredTotal}
          onPageChange={(page) => table.setPageIndex(page - 1)}
        />
      )}
    </div>
  )
}

export function DataTableColumnHeader<TData>({
  column,
  title,
}: {
  column: Column<TData, unknown>
  title: string
}) {
  const sorting = column.getIsSorted()
  const filterValue = String(column.getFilterValue() ?? "")
  const SortIcon =
    sorting === "asc"
      ? ArrowUpIcon
      : sorting === "desc"
        ? ArrowDownIcon
        : ArrowUpDownIcon

  if (!column.getCanSort() && !column.getCanFilter()) return title

  return (
    <div className="flex min-w-max items-center gap-0.5">
      {column.getCanSort() ? (
        <Button
          variant="ghost"
          size="xs"
          className="-ml-2"
          onClick={column.getToggleSortingHandler()}
          aria-label={`Sort by ${title}`}
        >
          {title}
          <SortIcon data-icon="inline-end" />
        </Button>
      ) : (
        <span>{title}</span>
      )}
      {column.getCanFilter() && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={filterValue ? "secondary" : "ghost"}
              size="icon-xs"
              aria-label={`Filter ${title}`}
            >
              <ListFilterIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64">
            <PopoverHeader>
              <PopoverTitle>Filter {title}</PopoverTitle>
            </PopoverHeader>
            <Input
              autoFocus
              aria-label={`Filter ${title}`}
              placeholder={`Type to filter ${title.toLowerCase()}`}
              value={filterValue}
              onChange={(event) => column.setFilterValue(event.target.value)}
            />
            {filterValue && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => column.setFilterValue(undefined)}
                >
                  Clear
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
