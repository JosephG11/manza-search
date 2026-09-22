'use client'
import React from 'react'
import { useSearchResults } from '../hooks/useSearchResults'
import type { ImageResult, ResultsListResponse } from '../types'
import { ClientPaginatedResults } from './ClientPaginatedResults'

const IMAGES_PER_PAGE = 20

export function ImagesTab({ query }: { query: string }) {
  const { data, isLoading, hasError } = useSearchResults<ResultsListResponse<ImageResult>>(
    'images',
    query,
  )

  return (
    <ClientPaginatedResults
      results={data?.results}
      isLoading={isLoading}
      hasError={hasError}
      pageSize={IMAGES_PER_PAGE}
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
      renderItem={(result) => (
        <a
          key={result.url}
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block overflow-hidden rounded-lg border border-border"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={result.thumbnail}
            alt={result.title}
            loading="lazy"
            className="aspect-square w-full object-cover"
          />
        </a>
      )}
    />
  )
}
