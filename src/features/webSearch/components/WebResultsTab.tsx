'use client'
import React, { useRef, useState } from 'react'
import { useSearchResults } from '../hooks/useSearchResults'
import type { WebPageResponse } from '../types'
import { ResultsPagination } from './ResultsPagination'
import { ResultsStatus } from './ResultsStatus'

export function WebResultsTab({ query }: { query: string }) {
  const [page, setPage] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const { data, isLoading, hasError } = useSearchResults<WebPageResponse>('web', query, page)

  function handlePageChange(nextPage: number) {
    setPage(nextPage)
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div ref={containerRef} className="scroll-mt-4">
      <ResultsStatus
        isLoading={isLoading}
        hasError={hasError}
        isEmpty={data !== null && data.results.length === 0}
      />
      <div className="space-y-4">
        {data?.results.map((result) => (
          <a
            key={result.url}
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-border p-4 hover:bg-muted"
          >
            <p className="text-sm text-muted-foreground">{result.hostname}</p>
            <p className="font-medium text-primary">{result.title}</p>
            <p className="text-sm text-muted-foreground">{result.description}</p>
          </a>
        ))}
      </div>
      <ResultsPagination
        page={page}
        totalPages={data?.hasMore ? page + 1 : page}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
