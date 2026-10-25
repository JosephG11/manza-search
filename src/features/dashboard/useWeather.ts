'use client'

import { useEffect, useState } from 'react'
import type { City, CurrentWeather } from './types'

const REFRESH_MS = 10 * 60_000

export function useWeather(city: Pick<City, 'lat' | 'lon'>) {
  const [weather, setWeather] = useState<CurrentWeather | null>(null)
  const { lat, lon } = city

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const res = await fetch(`/api/weather/current?lat=${lat}&lon=${lon}`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(`Weather request failed: ${res.status}`)

        setWeather(await res.json())
      } catch (error) {
        if (controller.signal.aborted) return
        console.error(error)
        setWeather(null)
      }
    }

    setWeather(null)
    load()
    const id = setInterval(load, REFRESH_MS)

    return () => {
      controller.abort()
      clearInterval(id)
    }
  }, [lat, lon])

  return weather
}
