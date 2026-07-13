export type DataTableColumnMeta = {
  cellClassName?: string
  filter?: DataTableFilterMeta
  headerClassName?: string
}

export type DataTableOption = {
  label: string
  value: string
}

export type DataTableFilterMeta =
  | { kind: "text" }
  | {
      kind: "options"
      options: DataTableOption[]
      unavailableReason?: string | null
    }

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
