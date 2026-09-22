import React from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

type ResultsPaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

function getPageItems(page: number, totalPages: number): Array<number | 'ellipsis'> {
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b)

  return pages.flatMap((p, index) =>
    index > 0 && p - pages[index - 1]! > 1 ? (['ellipsis', p] as const) : [p],
  )
}

export function ResultsPagination({ page, totalPages, onPageChange }: ResultsPaginationProps) {
  if (totalPages <= 1) return null

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious disabled={page <= 1} onClick={() => onPageChange(page - 1)} />
        </PaginationItem>

        {getPageItems(page, totalPages).map((item, index) => (
          <PaginationItem key={item === 'ellipsis' ? `ellipsis-${index}` : item}>
            {item === 'ellipsis' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink isActive={item === page} onClick={() => onPageChange(item)}>
                {item}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
