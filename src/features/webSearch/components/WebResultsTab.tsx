'use client'
import React, { useRef, useState } from 'react'
import { useSearchResults } from '../hooks/useSearchResults'
import type { WebPageResponse } from '../types'
import { ResultsPagination } from './ResultsPagination'
import { ResultsStatus } from './ResultsStatus'
import { ExternalExtraContentButton } from './ExternalExtraContentButton'

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
          <div key={result.url} className="relative">
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-border p-4 pr-12 hover:bg-muted"
            >
              <p className="text-sm text-muted-foreground">{result.hostname}</p>
              <p className="font-medium text-primary">{result.title}</p>
              <p className="text-sm text-muted-foreground">{result.description}</p>
            </a>

            <ExternalExtraContentButton
              contentType="link"
              item={{ url: result.url, title: result.title, source: result.hostname }}
              className="absolute right-3 top-3 h-fit rounded-full bg-red-600 px-2.5 py-1"
            />
          </div>
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
