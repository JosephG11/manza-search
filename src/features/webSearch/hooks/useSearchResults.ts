'use client'
import { useEffect, useState } from 'react'
import type { WebSearchType } from '../types'

const MAX_CACHE_ENTRIES = 50
const cache = new Map<string, unknown>()

function cacheResponse(key: string, value: unknown) {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value
    if (oldestKey !== undefined) cache.delete(oldestKey)
  }
  cache.set(key, value)
}

export function useSearchResults<T>(type: WebSearchType, query: string, page = 1) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const key = `${type}:${query}:${page}`
    const cached = cache.get(key) as T | undefined

    if (cached) {
      setData(cached)
      setHasError(false)
      setIsLoading(false)
      return
    }

    const controller = new AbortController()

    setData(null)
    setHasError(false)
    setIsLoading(true)
    fetch(`/api/web-search?q=${encodeURIComponent(query)}&type=${type}&page=${page}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((json: T) => {
        cacheResponse(key, json)
        setData(json)
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setHasError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [type, query, page])

  return { data, isLoading, hasError }
}
