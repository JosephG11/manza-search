'use client'
import React from 'react'
import { useSearchResults } from '../hooks/useSearchResults'
import type { ImageResult, ResultsListResponse } from '../types'
import { ClientPaginatedResults } from './ClientPaginatedResults'
import { ExternalExtraContentButton } from './ExternalExtraContentButton'
import { ExternalLinkBadge } from './ExternalLinkBadge'

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
        <div key={result.url} className="relative">
          <a
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

          <ExternalLinkBadge />

          <ExternalExtraContentButton
            contentType="link"
            item={{
              url: result.url,
              title: result.title,
              thumbnail: result.thumbnail,
              source: result.source,
            }}
          />
        </div>
      )}
    />
  )
}
