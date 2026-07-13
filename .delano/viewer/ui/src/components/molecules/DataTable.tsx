import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  CheckIcon,
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
import type { DataTableColumnMeta, DataTableOption } from "@/lib/data-table"

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
    onColumnFiltersChange: (updater) => {
      setColumnFilters(updater)
      setPagination((current) => ({ ...current, pageIndex: 0 }))
    },
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
                  const meta = header.column.columnDef.meta as
                    DataTableColumnMeta | undefined
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
                    const meta = cell.column.columnDef.meta as
                      DataTableColumnMeta | undefined
                    return (
                      <TableCell key={cell.id} className={meta?.cellClassName}>
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
  const meta = column.columnDef.meta as DataTableColumnMeta | undefined
  const optionFilter = meta?.filter?.kind === "options" ? meta.filter : null
  const textFilterValue = optionFilter
    ? ""
    : String(column.getFilterValue() ?? "")
  const selectedOptions = optionFilter
    ? normalizeSelectedOptions(column.getFilterValue())
    : []
  const filterActive = optionFilter
    ? selectedOptions.length > 0
    : Boolean(textFilterValue)
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
              variant={filterActive ? "secondary" : "ghost"}
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
            {optionFilter ? (
              <OptionFilter
                column={column}
                options={optionFilter.options}
                selected={selectedOptions}
                title={title}
                unavailableReason={optionFilter.unavailableReason}
              />
            ) : (
              <>
                <Input
                  autoFocus
                  aria-label={`Filter ${title}`}
                  placeholder={`Type to filter ${title.toLowerCase()}`}
                  value={textFilterValue}
                  onChange={(event) =>
                    column.setFilterValue(event.target.value)
                  }
                />
                {textFilterValue && (
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
              </>
            )}
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}

function normalizeSelectedOptions(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : []
}

function OptionFilter<TData>({
  column,
  options,
  selected,
  title,
  unavailableReason,
}: {
  column: Column<TData, unknown>
  options: DataTableOption[]
  selected: string[]
  title: string
  unavailableReason?: string | null
}) {
  const toggle = (value: string) => {
    column.setFilterValue(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value]
    )
  }

  if (!options.length) {
    return (
      <p className="text-xs leading-5 text-muted-foreground" role="status">
        {unavailableReason || "No canonical options available."}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-1" aria-label={`${title} options`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="flex min-h-9 items-center gap-2 rounded-md px-2 text-left text-sm hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          onClick={() => toggle(option.value)}
          aria-pressed={selected.includes(option.value)}
        >
          <span
            className="flex size-4 shrink-0 items-center justify-center rounded-sm border border-input"
            aria-hidden="true"
          >
            {selected.includes(option.value) && (
              <CheckIcon className="size-3" />
            )}
          </span>
          <span className="min-w-0 flex-1 truncate">{option.label}</span>
        </button>
      ))}
      {selected.length > 0 && (
        <div className="mt-1 flex justify-end border-t pt-2">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => column.setFilterValue(undefined)}
          >
            Clear {title.toLowerCase()}
          </Button>
        </div>
      )}
    </div>
  )
}
