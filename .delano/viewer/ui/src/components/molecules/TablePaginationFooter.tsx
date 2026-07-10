import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"

export function TablePaginationFooter({
  onPageChange,
  page,
  pageCount,
  summary,
  total,
}: {
  onPageChange: (page: number) => void
  page: number
  pageCount: number
  /** Optional replacement for the default item count, e.g. filtered totals. */
  summary?: string
  total: number
}) {
  const pages = pageWindow(page, pageCount)

  return (
    <div className="table-pagination-footer">
      <div className="table-pagination-count" role="status">
        {summary ?? `${total} item${total === 1 ? "" : "s"}`}
      </div>
      {pageCount > 1 && (
        <Pagination className="table-pagination !mx-0 !w-auto !justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                aria-disabled={page === 1}
                className={cn(page === 1 && "pointer-events-none opacity-50")}
                onClick={(event) => {
                  event.preventDefault()
                  if (page > 1) onPageChange(page - 1)
                }}
              />
            </PaginationItem>
            {pages.map((item, index) =>
              item === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={item}>
                  <PaginationLink
                    href="#"
                    isActive={item === page}
                    onClick={(event) => {
                      event.preventDefault()
                      onPageChange(item)
                    }}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                aria-disabled={page === pageCount}
                className={cn(page === pageCount && "pointer-events-none opacity-50")}
                onClick={(event) => {
                  event.preventDefault()
                  if (page < pageCount) onPageChange(page + 1)
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

function pageWindow(page: number, pageCount: number) {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, index) => index + 1)
  }

  const pages: Array<number | "ellipsis"> = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(pageCount - 1, page + 1)

  if (start > 2) pages.push("ellipsis")
  for (let item = start; item <= end; item += 1) pages.push(item)
  if (end < pageCount - 1) pages.push("ellipsis")
  pages.push(pageCount)

  return pages
}
