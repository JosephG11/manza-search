'use client'
import React, { useEffect, useState } from 'react'
import { SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDebounce } from '@/utilities/useDebounce'
import { WikipediaSummary } from '@/features/wikipedia/components/WikipediaSummary'
import { ImagesTab } from './ImagesTab'
import { VideosTab } from './VideosTab'
import { WebResultsTab } from './WebResultsTab'

export function WebSearchResults({ initialQuery }: { initialQuery: string }) {
  const [value, setValue] = useState(initialQuery)
  const debouncedValue = useDebounce(value)

  // Keep `?q=` in sync with the debounced input. `replaceState` (integrated with the
  // Next router) avoids both a server re-render and a history entry per keystroke.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if ((params.get('q') ?? '') === debouncedValue) return

    if (debouncedValue) params.set('q', debouncedValue)
    else params.delete('q')

    const queryString = params.toString()
    window.history.replaceState(
      null,
      '',
      queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname,
    )
  }, [debouncedValue])

  return (
    <div className="container flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex h-12 w-full max-w-4xl items-center rounded-md border border-border bg-background px-4"
        >
          <Label htmlFor="web-search" className="sr-only">
            Search the web
          </Label>
          <Input
            id="web-search"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Search the web"
            className="border-none bg-transparent text-primary outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <button type="submit" className="sr-only">
            submit
          </button>
          <SearchIcon className="ml-3 w-5 shrink-0 text-muted-foreground" />
        </form>

        {debouncedValue && (
          <Tabs defaultValue="web" className="w-full min-w-0 max-w-4xl">
            <TabsList>
              <TabsTrigger value="web">Web</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
            </TabsList>

            <TabsContent value="web" className="mt-4 w-full">
              <WebResultsTab key={debouncedValue} query={debouncedValue} />
            </TabsContent>
            <TabsContent value="images" className="mt-4 w-full">
              <ImagesTab key={debouncedValue} query={debouncedValue} />
            </TabsContent>
            <TabsContent value="videos" className="mt-4 w-full">
              <VideosTab key={debouncedValue} query={debouncedValue} />
            </TabsContent>
          </Tabs>
        )}
      </div>

      <aside className="order-first w-full empty:hidden lg:sticky lg:top-4 lg:order-none lg:w-96 lg:shrink-0">
        <WikipediaSummary query={debouncedValue} />
      </aside>
    </div>
  )
}
