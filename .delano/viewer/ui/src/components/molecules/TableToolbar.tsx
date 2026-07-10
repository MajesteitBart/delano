import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from "lucide-react"
import { useMemo } from "react"

import type { TableQueryHandle } from "@/app/useTableQuery"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  deriveFilterOptions,
  type FilterDefinition,
  type FilterOption,
  type TableQueryConfig,
} from "@/lib/domain/table-query"

const ANY_VALUE = "__any__"

/**
 * Shared table controls (FR-6): visible search, declared field filters, an
 * explicit sort control, and reset. Rendering of rows and cells stays with
 * each table; this bar only drives the shared query state.
 */
export function TableToolbar<T>({
  config,
  items,
  noun,
  query,
  searchPlaceholder,
}: {
  config: TableQueryConfig<T>
  /** Unfiltered dataset; used to derive filter options. */
  items: T[]
  /** Plural noun for the chip-row summary, e.g. "projects". */
  noun: string
  query: TableQueryHandle<T>
  searchPlaceholder: string
}) {
  const filters = config.filters ?? []
  const activeChips = filters.flatMap((definition) => {
    const selected = query.state.filters[definition.id] ?? []
    return selected.map((value) => ({ definition, value }))
  })

  return (
    <div className="table-toolbar-card">
      <div className="table-toolbar">
        <InputGroup className="table-toolbar-search">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            value={query.state.search}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            onChange={(event) => query.setSearch(event.target.value)}
          />
        </InputGroup>
        {filters.map((definition) => (
          <ToolbarField key={definition.id} label={definition.label}>
            <FilterControl definition={definition} items={items} query={query} />
          </ToolbarField>
        ))}
        <ToolbarField label="Sort">
          <SortControl config={config} query={query} />
        </ToolbarField>
        <div className="table-toolbar-reset">
          <Button
            variant="outline"
            size="sm"
            onClick={query.reset}
            disabled={query.isDefault}
          >
            Reset
          </Button>
        </div>
      </div>
      {(activeChips.length > 0 || query.state.search) && (
        <div className="table-toolbar-chips">
          {query.state.search && (
            <FilterChip
              label={`"${query.state.search}"`}
              onRemove={() => query.setSearch("")}
            />
          )}
          {activeChips.map(({ definition, value }) => (
            <FilterChip
              key={`${definition.id}:${value}`}
              label={chipLabel(definition, items, value)}
              onRemove={() => query.toggleFilter(definition.id, value, definition.multi ?? true)}
            />
          ))}
          <span className="table-toolbar-count" role="status">
            {query.result.filteredTotal} of {query.result.total} {noun}
          </span>
        </div>
      )}
    </div>
  )
}

function ToolbarField({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <div className="table-toolbar-field">
      <span className="table-toolbar-label">{label}</span>
      {children}
    </div>
  )
}

function chipLabel<T>(
  definition: FilterDefinition<T>,
  items: T[],
  value: string
) {
  const options = deriveFilterOptions(definition, items)
  return (
    options.find((option) => option.value === value)?.label ??
    definition.valueLabel?.(value) ??
    value
  )
}

function FilterControl<T>({
  definition,
  items,
  query,
}: {
  definition: FilterDefinition<T>
  items: T[]
  query: TableQueryHandle<T>
}) {
  const options = useMemo(
    () => deriveFilterOptions(definition, items),
    [definition, items]
  )
  const selected = query.state.filters[definition.id] ?? []

  if (definition.multi === false) {
    return (
      <Select
        value={selected[0] ?? ANY_VALUE}
        onValueChange={(value) => {
          if (value === ANY_VALUE) query.clearFilter(definition.id)
          else query.toggleFilter(definition.id, value, false)
        }}
      >
        <SelectTrigger
          size="sm"
          className="table-toolbar-trigger"
          aria-label={definition.label}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY_VALUE}>{anyLabel(definition.label)}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="table-toolbar-trigger justify-between font-normal"
          aria-label={definition.label}
        >
          <span className="truncate">
            {selected.length
              ? `${definition.label} · ${selected.length}`
              : anyLabel(definition.label)}
          </span>
          <ChevronDownIcon className="size-4 opacity-50" data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44">
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selected.includes(option.value)}
            onSelect={(event) => event.preventDefault()}
            onCheckedChange={() =>
              query.toggleFilter(definition.id, option.value, true)
            }
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
        {selected.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 w-full justify-start"
            onClick={() => query.clearFilter(definition.id)}
          >
            <CheckIcon data-icon="inline-start" />
            Clear selection
          </Button>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function anyLabel(label: string) {
  return `All ${label.toLowerCase()}`
}

function SortControl<T>({
  config,
  query,
}: {
  config: TableQueryConfig<T>
  query: TableQueryHandle<T>
}) {
  return (
    <Select
      value={query.state.sort}
      onValueChange={(value) => {
        const definition = config.sorts.find((sort) => sort.id === value)
        query.setSort(value, definition?.initialDirection ?? "asc")
      }}
    >
      <SelectTrigger size="sm" className="table-toolbar-trigger" aria-label="Sort">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {config.sorts.map((sort) => (
          <SelectItem key={sort.id} value={sort.id}>
            {sort.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <span className="table-filter-chip">
      {label}
      <button
        type="button"
        className="table-filter-chip-remove"
        onClick={onRemove}
        aria-label={`Remove filter ${label}`}
      >
        <XIcon className="size-3" />
      </button>
    </span>
  )
}

export type { FilterOption }
