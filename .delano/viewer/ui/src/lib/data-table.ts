export type DataTableColumnMeta = {
  cellClassName?: string
  filter?: DataTableFilterMeta
  headerClassName?: string
}

export type DataTableOption = {
  label: string
  value: string
}

export type DataTableDateRange = {
  from?: Date
  to?: Date
  preset?: string
}

export type DataTableFilterMeta =
  | { kind: "text" }
  | {
      kind: "options"
      options: DataTableOption[]
      unavailableReason?: string | null
    }
  | { kind: "date-range" }

export function dataTableMeta(meta: DataTableColumnMeta) {
  return meta
}

export function optionMembershipFilter(
  row: { getValue: (columnId: string) => unknown },
  columnId: string,
  filterValue: unknown
) {
  const selected = Array.isArray(filterValue)
    ? filterValue.filter((value): value is string => typeof value === "string")
    : []
  if (!selected.length) return true
  return selected.includes(String(row.getValue(columnId) ?? ""))
}

export function dateRangeFilter(
  row: { getValue: (columnId: string) => unknown },
  columnId: string,
  filterValue: unknown
) {
  const range = normalizeDateRange(filterValue)
  if (!range.from && !range.to) return true
  const value = new Date(String(row.getValue(columnId) ?? ""))
  if (Number.isNaN(value.getTime())) return false

  const from = range.from ? startOfLocalDay(range.from).getTime() : -Infinity
  const to = range.to
    ? endOfLocalDay(range.to).getTime()
    : range.from
      ? endOfLocalDay(range.from).getTime()
      : Infinity
  return value.getTime() >= from && value.getTime() <= to
}

export function normalizeDateRange(value: unknown): DataTableDateRange {
  if (!value || typeof value !== "object") return {}
  const candidate = value as Partial<DataTableDateRange>
  return {
    from: validDate(candidate.from),
    to: validDate(candidate.to),
    preset: typeof candidate.preset === "string" ? candidate.preset : undefined,
  }
}

function validDate(value: unknown) {
  return value instanceof Date && !Number.isNaN(value.getTime())
    ? value
    : undefined
}

function startOfLocalDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function endOfLocalDay(value: Date) {
  return new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate(),
    23,
    59,
    59,
    999
  )
}
