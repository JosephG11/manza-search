'use client'

import { useEffect, useState } from 'react'

// Current time, refreshed every `intervalMs` so clocks stay up to date while the dashboard is open.
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)

    return () => clearInterval(id)
  }, [intervalMs])

  return now
}

export function formatTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
  })
    .format(date)
    .replace(/\s/g, '')
    .toLowerCase()
}

// "October 25, 2026" and "10/25/26", in the given time zone.
export function formatDates(date: Date, timeZone: string) {
  return {
    long: new Intl.DateTimeFormat('en-US', {
      timeZone,
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date),
    short: new Intl.DateTimeFormat('en-US', {
      timeZone,
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
    }).format(date),
  }
}
