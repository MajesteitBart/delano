import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react"

import type { TableQueryHandle } from "@/app/useTableQuery"
import { TableHead } from "@/components/ui/table"
import { cn } from "@/lib/utils"

/**
 * Sortable column header: visible direction, `aria-sort` announcement, and
 * keyboard operation through a real button (FR-8, AC-006).
 */
export function SortableHead<T>({
  className,
  label,
  query,
  sortId,
}: {
  className?: string
  label: string
  query: TableQueryHandle<T>
  sortId: string
}) {
  const active = query.state.sort === sortId
  const direction = query.state.direction

  return (
    <TableHead
      className={className}
      aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        className={cn("table-sort-button", active && "is-active")}
        onClick={() => query.toggleSort(sortId)}
      >
        {label}
        {active ? (
          direction === "asc" ? (
            <ArrowUpIcon className="size-3.5" />
          ) : (
            <ArrowDownIcon className="size-3.5" />
          )
        ) : (
          <ChevronsUpDownIcon className="size-3.5 opacity-40" />
        )}
      </button>
    </TableHead>
  )
}
