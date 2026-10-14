'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type { WikipediaLetterEntry, WikipediaLetterPage } from '@/features/wikipedia/types'
import { ScopeWikiCard } from './ScopeWikiCard'

type Status = 'loading' | 'idle' | 'error'

// Keyed by letter in the parent, so state resets whenever the letter changes.
export function ScopeWikiGrid({ letter }: { letter: string }) {
  const [entries, setEntries] = useState<WikipediaLetterEntry[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [loaded, setLoaded] = useState(false)
  const requestId = useRef(0)

  const load = useCallback(
    async (cursor: string | null) => {
      const id = ++requestId.current
      setStatus('loading')

      try {
        const params = new URLSearchParams({ letter })
        if (cursor) params.set('cursor', cursor)

        const res = await fetch(`/api/wikipedia/letter?${params}`)
        if (!res.ok) throw new Error(`Request failed with ${res.status}`)

        const page: WikipediaLetterPage = await res.json()
        if (id !== requestId.current) return

        setEntries((current) => [...current, ...page.entries])
        setNextCursor(page.nextCursor)
        setStatus('idle')
        setLoaded(true)
      } catch {
        if (id === requestId.current) setStatus('error')
      }
    },
    [letter],
  )

  useEffect(() => {
    load(null)
  }, [load])

  return (
    <div className="space-y-4">
      {entries.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {entries.map((entry) => (
            <ScopeWikiCard key={entry.title} {...entry} />
          ))}
        </div>
      )}

      {status === 'loading' && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">Unable to load articles from Wikipedia.</p>
          <Button variant="outline" onClick={() => load(nextCursor)}>
            Try again
          </Button>
        </div>
      )}

      {status === 'idle' && loaded && entries.length === 0 && (
        <p className="text-sm text-muted-foreground">No articles found for this letter.</p>
      )}

      {status === 'idle' && nextCursor && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => load(nextCursor)}>
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
