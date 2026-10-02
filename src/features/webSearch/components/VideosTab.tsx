'use client'
import React from 'react'
import { useSearchResults } from '../hooks/useSearchResults'
import type { ResultsListResponse, VideoResult } from '../types'
import { ClientPaginatedResults } from './ClientPaginatedResults'
import { ExternalExtraContentButton } from './ExternalExtraContentButton'

const VIDEOS_PER_PAGE = 12

export function VideosTab({ query }: { query: string }) {
  const { data, isLoading, hasError } = useSearchResults<ResultsListResponse<VideoResult>>(
    'videos',
    query,
  )

  return (
    <ClientPaginatedResults
      results={data?.results}
      isLoading={isLoading}
      hasError={hasError}
      pageSize={VIDEOS_PER_PAGE}
      className="grid grid-cols-2 gap-4 sm:grid-cols-3"
      renderItem={(result) => (
        <div key={result.url} className="relative">
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-lg border border-border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.image}
              alt={result.title}
              loading="lazy"
              className="aspect-video w-full object-cover"
            />
            <div className="p-2">
              <p className="text-sm font-medium text-primary">{result.title}</p>
              <p className="text-xs text-muted-foreground">
                {result.publisher} - {result.duration}
              </p>
            </div>
          </a>

          <ExternalExtraContentButton
            contentType="video"
            item={{
              url: result.url,
              title: result.title,
              thumbnail: result.image,
              source: result.publisher,
            }}
            className="absolute right-2 top-2 h-fit rounded-full bg-red-600 px-2.5 py-1"
          />
        </div>
      )}
    />
  )
}
