import { useEffect, useMemo, useState } from "react"

import { paginateItems, DEFAULT_PAGE_SIZE } from "@/lib/domain/pagination"
import { decodeQuery, encodeQuery } from "@/lib/domain/route-codec"
import {
  applyTableQuery,
  defaultQueryState,
  isDefaultQuery,
  toggleFilterValue,
  type SortDirection,
  type TableQueryConfig,
  type TableQueryState,
} from "@/lib/domain/table-query"

function readHashQuery(): Partial<TableQueryState> | null {
  const hash = window.location.hash
  const separator = hash.indexOf("?")
  if (separator === -1) return null
  return decodeQuery(hash.slice(separator + 1))
}

function writeHashQuery(state: TableQueryState, isDefault: boolean) {
  const hash = window.location.hash || "#/"
  const separator = hash.indexOf("?")
  const path = separator === -1 ? hash : hash.slice(0, separator)
  const queryText = isDefault ? "" : encodeQuery(state)
  const nextHash = queryText ? `${path}?${queryText}` : path
  if (nextHash !== hash) {
    window.history.replaceState(null, "", nextHash)
  }
}

function sanitizeQuery<T>(
  config: TableQueryConfig<T>,
  partial: Partial<TableQueryState> | null
): TableQueryState {
  const state = defaultQueryState(config)
  if (!partial) return state
  if (typeof partial.search === "string") state.search = partial.search
  if (partial.filters) {
    const known = new Set((config.filters ?? []).map((filter) => filter.id))
    for (const [field, values] of Object.entries(partial.filters)) {
      if (known.has(field) && values.length) state.filters[field] = values
    }
  }
  if (partial.sort && config.sorts.some((sort) => sort.id === partial.sort)) {
    state.sort = partial.sort
    state.direction =
      partial.direction ??
      config.sorts.find((sort) => sort.id === partial.sort)?.initialDirection ??
      "asc"
  }
  if (partial.direction === "asc" || partial.direction === "desc") {
    state.direction = partial.direction
  }
  if (partial.page && partial.page > 1) state.page = partial.page
  return state
}

/**
 * Shared table query state: search + filters + sort run over the full dataset
 * before pagination, and any query change returns to page 1 (AC-002). With
 * `syncToHash`, state round-trips through the route hash so filtered views are
 * shareable and restorable (FR-13); only the page's primary table should opt in.
 */
export function useTableQuery<T>(
  items: T[],
  config: TableQueryConfig<T>,
  options?: { syncToHash?: boolean; pageSize?: number }
) {
  const syncToHash = options?.syncToHash ?? false
  const pageSize = options?.pageSize ?? DEFAULT_PAGE_SIZE

  const [state, setState] = useState<TableQueryState>(() =>
    sanitizeQuery(config, syncToHash ? readHashQuery() : null)
  )

  const isDefault = isDefaultQuery(config, state)
  useEffect(() => {
    if (!syncToHash) return
    writeHashQuery(state, isDefault)
  }, [state, isDefault, syncToHash])

  const result = useMemo(
    () => applyTableQuery(items, config, state),
    // config is declared inline by callers; state/items drive recomputation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, state]
  )
  const paginated = paginateItems(result.items, state.page, pageSize)

  const patch = (partial: Partial<TableQueryState>) =>
    setState((current) => ({ ...current, ...partial, page: 1 }))

  return {
    state,
    result,
    paginated,
    isDefault,
    setSearch: (search: string) => patch({ search }),
    toggleFilter: (field: string, value: string, multi = true) =>
      setState((current) => ({
        ...current,
        filters: toggleFilterValue(current.filters, field, value, multi),
        page: 1,
      })),
    clearFilter: (field: string) =>
      setState((current) => ({
        ...current,
        filters: { ...current.filters, [field]: [] },
        page: 1,
      })),
    setSort: (sort: string, direction: SortDirection) =>
      patch({ sort, direction }),
    toggleSort: (sortId: string) =>
      setState((current) => {
        const definition = config.sorts.find((sort) => sort.id === sortId)
        if (!definition) return current
        const direction: SortDirection =
          current.sort === sortId
            ? current.direction === "asc"
              ? "desc"
              : "asc"
            : (definition.initialDirection ?? "asc")
        return { ...current, sort: sortId, direction, page: 1 }
      }),
    setPage: (page: number) => setState((current) => ({ ...current, page })),
    reset: () => setState(defaultQueryState(config)),
  }
}

export type TableQueryHandle<T> = ReturnType<typeof useTableQuery<T>>
