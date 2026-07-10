// Shared table query behavior (AD-4): search, field filters, and stable
// sorting run over the whole dataset before pagination. Tables keep their own
// columns and cells; they only declare searchable text, filter fields, and
// sort accessors here.

export type SortDirection = "asc" | "desc"

export type TableQueryState = {
  search: string
  filters: Record<string, string[]>
  sort: string
  direction: SortDirection
  page: number
}

export type FilterOption = {
  value: string
  label: string
}

export type FilterDefinition<T> = {
  id: string
  label: string
  /** Values the item carries for this field; used by the default matcher and to derive options. */
  value: (item: T) => Array<string | null | undefined> | string | null | undefined
  /** Fixed options; derived from the dataset when absent. */
  options?: FilterOption[]
  /** Allow multiple selected values (OR within the field). Defaults to true. */
  multi?: boolean
  /** Custom predicate, e.g. time ranges. Selected values still OR together. */
  match?: (item: T, selected: string[]) => boolean
  /** Label for selected values in chips; falls back to option label or raw value. */
  valueLabel?: (value: string) => string
}

export type SortDefinition<T> = {
  id: string
  label: string
  kind?: "text" | "natural" | "date" | "number"
  value: (item: T) => string | number | null | undefined
  /** Direction used when this sort is first selected. */
  initialDirection?: SortDirection
}

export type TableQueryConfig<T> = {
  searchText: (item: T) => Array<string | null | undefined>
  filters?: FilterDefinition<T>[]
  sorts: SortDefinition<T>[]
  defaultSort: string
  defaultDirection?: SortDirection
  /** Deterministic final tie-breaker; natural path/id comparison by default callers supply item paths. */
  tieBreaker?: (a: T, b: T) => number
}

export function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim()
}

export function matchesSearch<T>(
  item: T,
  config: TableQueryConfig<T>,
  search: string
) {
  const needle = normalizeSearchText(search)
  if (!needle) return true
  const haystack = normalizeSearchText(
    config.searchText(item).filter(Boolean).join(" ")
  )
  return needle
    .split(" ")
    .every((token) => haystack.includes(token))
}

function filterValues<T>(definition: FilterDefinition<T>, item: T): string[] {
  const raw = definition.value(item)
  const list = Array.isArray(raw) ? raw : [raw]
  return list
    .map((value) => String(value ?? "").trim())
    .filter((value) => value.length > 0)
}

export function matchesFilters<T>(
  item: T,
  config: TableQueryConfig<T>,
  filters: TableQueryState["filters"]
) {
  // Different fields combine with AND; values within one field combine with OR.
  for (const definition of config.filters ?? []) {
    const selected = filters[definition.id] ?? []
    if (!selected.length) continue
    if (definition.match) {
      if (!definition.match(item, selected)) return false
      continue
    }
    const values = filterValues(definition, item)
    if (!selected.some((value) => values.includes(value))) return false
  }
  return true
}

export function deriveFilterOptions<T>(
  definition: FilterDefinition<T>,
  items: T[]
): FilterOption[] {
  if (definition.options) return definition.options
  const seen = new Map<string, string>()
  for (const item of items) {
    for (const value of filterValues(definition, item)) {
      if (!seen.has(value)) seen.set(value, value)
    }
  }
  return [...seen.keys()]
    .sort((a, b) => naturalCompare(a, b))
    .map((value) => ({ value, label: definition.valueLabel?.(value) ?? value }))
}

export function naturalCompare(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
}

function sortableValue<T>(definition: SortDefinition<T>, item: T) {
  const raw = definition.value(item)
  if (raw === null || raw === undefined || raw === "") return null
  if (definition.kind === "date") {
    const time = new Date(String(raw)).getTime()
    return Number.isNaN(time) ? null : time
  }
  if (definition.kind === "number") {
    const numeric = Number(raw)
    return Number.isNaN(numeric) ? null : numeric
  }
  return String(raw)
}

export function sortItems<T>(
  items: T[],
  config: TableQueryConfig<T>,
  sortId: string,
  direction: SortDirection
): T[] {
  const definition =
    config.sorts.find((sort) => sort.id === sortId) ??
    config.sorts.find((sort) => sort.id === config.defaultSort)
  if (!definition) return items.slice()

  const sign = direction === "desc" ? -1 : 1
  // Decorate with the original index so equal keys keep a stable order.
  return items
    .map((item, index) => ({ item, index, key: sortableValue(definition, item) }))
    .sort((a, b) => {
      // Missing values sort last in both directions.
      if (a.key === null && b.key === null) return tie(a, b)
      if (a.key === null) return 1
      if (b.key === null) return -1
      let result: number
      if (typeof a.key === "number" && typeof b.key === "number") {
        result = a.key === b.key ? 0 : a.key < b.key ? -1 : 1
      } else if (definition.kind === "natural") {
        result = naturalCompare(String(a.key), String(b.key))
      } else {
        result = String(a.key).localeCompare(String(b.key))
      }
      return result !== 0 ? sign * result : tie(a, b)
    })
    .map((entry) => entry.item)

  function tie(
    a: { item: T; index: number },
    b: { item: T; index: number }
  ) {
    const breaker = config.tieBreaker?.(a.item, b.item) ?? 0
    return breaker !== 0 ? breaker : a.index - b.index
  }
}

export function defaultQueryState<T>(config: TableQueryConfig<T>): TableQueryState {
  return {
    search: "",
    filters: {},
    sort: config.defaultSort,
    direction:
      config.defaultDirection ??
      config.sorts.find((sort) => sort.id === config.defaultSort)?.initialDirection ??
      "asc",
    page: 1,
  }
}

export function isDefaultQuery<T>(
  config: TableQueryConfig<T>,
  state: TableQueryState
) {
  const initial = defaultQueryState(config)
  return (
    !state.search &&
    Object.values(state.filters).every((values) => !values.length) &&
    state.sort === initial.sort &&
    state.direction === initial.direction
  )
}

export function applyTableQuery<T>(
  items: T[],
  config: TableQueryConfig<T>,
  state: TableQueryState
): { items: T[]; filteredTotal: number; total: number } {
  const filtered = items.filter(
    (item) =>
      matchesSearch(item, config, state.search) &&
      matchesFilters(item, config, state.filters)
  )
  return {
    items: sortItems(filtered, config, state.sort, state.direction),
    filteredTotal: filtered.length,
    total: items.length,
  }
}

export function toggleFilterValue(
  filters: TableQueryState["filters"],
  field: string,
  value: string,
  multi = true
): TableQueryState["filters"] {
  const current = filters[field] ?? []
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : multi
      ? [...current, value]
      : [value]
  return { ...filters, [field]: next }
}

export function resultSummaryLabel({
  filteredTotal,
  noun,
  page,
  pageSize,
  shownCount,
  total,
}: {
  filteredTotal: number
  noun: string
  page: number
  pageSize: number
  shownCount: number
  total: number
}) {
  if (!filteredTotal) {
    return total ? `0 of ${total} ${noun}` : `0 ${noun}`
  }
  const start = (page - 1) * pageSize + 1
  const end = start + shownCount - 1
  const range = start === end ? `${end}` : `${start}–${end}`
  if (filteredTotal < total) {
    return `${range} of ${filteredTotal} filtered · ${total} total`
  }
  if (filteredTotal > shownCount) {
    return `${range} of ${filteredTotal} ${noun}`
  }
  return `${filteredTotal} ${noun}`
}

export const TIME_RANGE_OPTIONS: FilterOption[] = [
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
]

const TIME_RANGE_MS: Record<string, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
}

export function withinTimeRange(
  value: string | null | undefined,
  selected: string[],
  now = Date.now()
) {
  if (!selected.length) return true
  const time = value ? new Date(value).getTime() : NaN
  if (Number.isNaN(time)) return false
  return selected.some((range) => {
    const window = TIME_RANGE_MS[range]
    return window ? now - time <= window : false
  })
}
