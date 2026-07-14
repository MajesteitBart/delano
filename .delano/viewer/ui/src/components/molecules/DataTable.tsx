import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ListFilterIcon,
} from "lucide-react"
import { endOfDay, format, startOfDay, startOfYear, subDays } from "date-fns"
import { useState } from "react"
import type { DateRange } from "react-day-picker"
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
import { Calendar } from "@/components/ui/calendar"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
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
import {
  normalizeDateRange,
  type DataTableColumnMeta,
  type DataTableDateRange,
  type DataTableOption,
} from "@/lib/data-table"
import { cn } from "@/lib/utils"

export function DataTable<TData>({
  columns,
  data,
  emptyMessage = "No results.",
  getRowId,
  initialSorting = [],
  pageSize = 12,
  showPagination = true,
}: {
  columns: ColumnDef<TData>[]
  data: TData[]
  emptyMessage?: string
  getRowId?: (row: TData) => string
  initialSorting?: SortingState
  pageSize?: number
  showPagination?: boolean
}) {
  const [sorting, setSorting] = useState<SortingState>(() => initialSorting)
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
      <div className="overflow-hidden rounded-md border">
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
  const dateFilter = meta?.filter?.kind === "date-range"
  const textFilterValue =
    optionFilter || dateFilter ? "" : String(column.getFilterValue() ?? "")
  const selectedOptions = optionFilter
    ? normalizeSelectedOptions(column.getFilterValue())
    : []
  const selectedDateRange = dateFilter
    ? normalizeDateRange(column.getFilterValue())
    : {}
  const filterActive = dateFilter
    ? Boolean(selectedDateRange.from || selectedDateRange.to)
    : optionFilter
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
          <PopoverContent
            align="start"
            className={cn(dateFilter ? "w-auto gap-0 p-0" : "w-64")}
          >
            <PopoverHeader className={cn(dateFilter && "px-3 pt-3 pb-2")}>
              <PopoverTitle>Filter {title}</PopoverTitle>
            </PopoverHeader>
            {dateFilter ? (
              <DateRangeFilter
                range={selectedDateRange}
                title={title}
                onChange={(range) =>
                  column.setFilterValue(
                    range.from || range.to ? range : undefined
                  )
                }
              />
            ) : optionFilter ? (
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

const DATE_PRESETS = [
  {
    label: "Today",
    range: (now: Date) => ({
      from: startOfDay(now),
      to: endOfDay(now),
    }),
  },
  {
    label: "Last 7 days",
    range: (now: Date) => ({
      from: startOfDay(subDays(now, 6)),
      to: endOfDay(now),
    }),
  },
  {
    label: "Last 30 days",
    range: (now: Date) => ({
      from: startOfDay(subDays(now, 29)),
      to: endOfDay(now),
    }),
  },
  {
    label: "This year",
    range: (now: Date) => ({
      from: startOfYear(now),
      to: endOfDay(now),
    }),
  },
]

function DateRangeFilter({
  onChange,
  range,
  title,
}: {
  onChange: (range: DataTableDateRange) => void
  range: DataTableDateRange
  title: string
}) {
  const selected: DateRange | undefined = range.from
    ? { from: range.from, to: range.to }
    : undefined
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-2 gap-1 border-y p-2">
        {DATE_PRESETS.map((preset) => (
          <Button
            key={preset.label}
            variant={range.preset === preset.label ? "secondary" : "ghost"}
            size="xs"
            onClick={() =>
              onChange({ ...preset.range(new Date()), preset: preset.label })
            }
          >
            {preset.label}
          </Button>
        ))}
      </div>
      <Calendar
        mode="range"
        selected={selected}
        onSelect={(next) =>
          onChange({ from: next?.from, to: next?.to, preset: "Custom range" })
        }
        defaultMonth={range.from}
        timeZone={timeZone}
      />
      <div className="flex min-h-10 items-center justify-between gap-3 border-t px-3 py-2">
        <span className="text-xs text-muted-foreground">
          {formatDateRangeSummary(range, title)}
        </span>
        {(range.from || range.to) && (
          <Button variant="ghost" size="xs" onClick={() => onChange({})}>
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}

function formatDateRangeSummary(range: DataTableDateRange, title: string) {
  if (!range.from && !range.to) return `All ${title.toLowerCase()} dates`
  if (range.preset && range.preset !== "Custom range") return range.preset
  const from = range.from ? format(range.from, "d MMM yyyy") : "Start"
  const to = range.to ? format(range.to, "d MMM yyyy") : from
  return `${from} – ${to}`
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
      <Command>
        <CommandInput
          autoFocus
          aria-label={`Search ${title} options`}
          placeholder={`Search ${title.toLowerCase()}`}
        />
        <CommandList>
          <CommandEmpty>No matching options.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={`${option.label} ${option.value}`}
                onSelect={() => toggle(option.value)}
                aria-label={`${option.label}${selected.includes(option.value) ? ", selected" : ""}`}
              >
                <span
                  className="flex size-4 shrink-0 items-center justify-center rounded-sm border border-input"
                  aria-hidden="true"
                >
                  {selected.includes(option.value) && <CheckIcon />}
                </span>
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
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
