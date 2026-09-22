'use client'
import React, { useRef, useState } from 'react'
import { ResultsPagination } from './ResultsPagination'
import { ResultsStatus } from './ResultsStatus'

type ClientPaginatedResultsProps<T> = {
  results: T[] | undefined
  isLoading: boolean
  hasError: boolean
  pageSize: number
  className: string
  renderItem: (item: T) => React.ReactNode
}

export function ClientPaginatedResults<T>({
  results,
  isLoading,
  hasError,
  pageSize,
  className,
  renderItem,
}: ClientPaginatedResultsProps<T>) {
  const [page, setPage] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  const items = results ?? []
  const totalPages = Math.ceil(items.length / pageSize)
  const pageItems = items.slice((page - 1) * pageSize, page * pageSize)

  function handlePageChange(nextPage: number) {
    setPage(nextPage)
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div ref={containerRef} className="scroll-mt-4">
      <ResultsStatus
        isLoading={isLoading}
        hasError={hasError}
        isEmpty={!isLoading && !hasError && results !== undefined && items.length === 0}
      />
      <div className={className}>{pageItems.map(renderItem)}</div>
      <ResultsPagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  )
}
