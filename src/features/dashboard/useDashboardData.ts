'use client'

import { useConvexAuth, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { CALENDAR_PRESET, TIME_ZONE_PRESETS } from './data'

// Saved dashboard settings merged with the presets. Queries are skipped until Convex auth is ready.
export function useDashboardData() {
  const { isAuthenticated } = useConvexAuth()
  const settings = useQuery(api.dashboard.getSettings, isAuthenticated ? {} : 'skip')
  const goals = useQuery(api.dashboard.getGoals, isAuthenticated ? {} : 'skip')

  return {
    isAuthenticated,
    timeZoneCities: settings?.timeZoneCities ?? TIME_ZONE_PRESETS,
    calendarCity: settings?.calendarCity ?? CALENDAR_PRESET,
    goals,
  }
}
