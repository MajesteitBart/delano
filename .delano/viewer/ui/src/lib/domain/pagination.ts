export const DEFAULT_PAGE_SIZE = 15

export function pageCountFor(totalItems: number, pageSize = DEFAULT_PAGE_SIZE) {
  if (pageSize <= 0) return 1
  return Math.max(1, Math.ceil(Math.max(0, totalItems) / pageSize))
}

export function clampPage(page: number, totalItems: number, pageSize = DEFAULT_PAGE_SIZE) {
  const count = pageCountFor(totalItems, pageSize)
  if (!Number.isFinite(page)) return 1
  return Math.min(count, Math.max(1, Math.trunc(page)))
}

export function paginateItems<T>(items: T[], page: number, pageSize = DEFAULT_PAGE_SIZE) {
  const safePage = clampPage(page, items.length, pageSize)
  const start = (safePage - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageCount: pageCountFor(items.length, pageSize),
    total: items.length,
  }
}
