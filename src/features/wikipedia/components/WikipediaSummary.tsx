'use client'
import React, { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { WikipediaResponse, WikipediaSummary as WikipediaSummaryData } from '../types'

export function WikipediaSummary({ query }: { query: string }) {
  const [summary, setSummary] = useState<WikipediaSummaryData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!query) {
      setSummary(null)
      return
    }

    const controller = new AbortController()

    setIsLoading(true)
    fetch(`/api/wikipedia?q=${encodeURIComponent(query)}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((json: WikipediaResponse) => setSummary(json.summary))
      .catch((error) => {
        if (error.name !== 'AbortError') setSummary(null)
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [query])

  if (isLoading) {
    return (
      <div
        aria-hidden
        className="animate-pulse space-y-3 rounded-2xl border border-border bg-background p-4 shadow-sm"
      >
        <div className="h-5 w-1/3 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
      </div>
    )
  }

  if (!summary) return null

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-background p-4 shadow-sm">
      <div>
        <p className="text-sm text-muted-foreground">From Wikipedia</p>
        <h2 className="text-lg font-medium text-primary">{summary.title}</h2>
      </div>

      <div className="space-y-2 text-sm text-muted-foreground">
        {summary.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <Button asChild variant="outline" size="sm">
        <a href={summary.url} target="_blank" rel="noopener noreferrer">
          Read on Wikipedia
          <ArrowUpRight aria-hidden className="ml-1.5 h-4 w-4" />
        </a>
      </Button>
    </section>
  )
}
