'use client'

import { useEffect, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Spinner } from '@/components/ui/spinner'
import { useDebounce } from '@/utilities/useDebounce'
import type { City } from '../types'

const MIN_QUERY = 2

type CityPickerProps = {
  onSelect: (city: City) => void
  children: React.ReactNode
}

// Popover with a city search backed by /api/weather/cities. `children` is the trigger.
export function CityPicker({ onSelect, children }: CityPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query.trim(), 300)
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY) {
      setCities([])
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setFailed(false)

    fetch(`/api/weather/cities?q=${encodeURIComponent(debouncedQuery)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`City search failed: ${res.status}`)
        const { results } = (await res.json()) as { results: City[] }
        setCities(results)
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        console.error(error)
        setCities([])
        setFailed(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [debouncedQuery])

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setQuery('')
  }

  function handleSelect(city: City) {
    onSelect(city)
    handleOpenChange(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>

      <PopoverContent
        className="w-72 rounded-primary border-2 border-black p-0 font-serif"
        align="center"
      >
        <Command shouldFilter={false}>
          <CommandInput value={query} onValueChange={setQuery} placeholder="Search a city..." />

          <CommandList>
            {loading ? (
              <div className="flex justify-center py-6">
                <Spinner className="size-6" />
              </div>
            ) : (
              <>
                <CommandEmpty>
                  {failed
                    ? 'Could not load cities. Try again.'
                    : debouncedQuery.length < MIN_QUERY
                      ? 'Type at least 2 letters'
                      : 'No cities found'}
                </CommandEmpty>

                {cities.map((city) => (
                  <CommandItem
                    key={city.id}
                    value={String(city.id)}
                    onSelect={() => handleSelect(city)}
                    className="flex flex-col items-start gap-0"
                  >
                    <span>{city.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {[city.region, city.country].filter(Boolean).join(', ')}
                    </span>
                  </CommandItem>
                ))}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
