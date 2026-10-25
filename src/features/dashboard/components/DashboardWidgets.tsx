'use client'

import { useState } from 'react'
import { Folder, Link, Plus, Settings, StickyNote } from 'lucide-react'
import { toast } from 'sonner'
import { ConvexError } from 'convex/values'
import { api } from '../../../../convex/_generated/api'
import { useMutationState } from '@/hooks/useMutationState'
import { useFiloActions } from '@/stores/filoStore'
import { useLinkStackActions } from '@/stores/linkStackStore'
import { useDashboardActions } from '@/stores/dashboardStore'
import { cn } from '@/utilities/ui'
import type { City } from '../types'
import { formatDates, formatTime, useNow } from '../useNow'
import { useDashboardData } from '../useDashboardData'
import { useWeather } from '../useWeather'
import { CityPicker } from './CityPicker'
import { DashboardWidget } from './DashboardWidget'
import { WeatherIcon } from './WeatherIcon'

const circleStyles =
  'flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-black sm:size-10'

const slotStyles =
  'flex flex-col items-center justify-center rounded-primary border-2 border-black/70 px-1 py-2 text-center text-white'

function showError(error: unknown) {
  toast.error(error instanceof ConvexError ? error.data : 'Unexpected error occurred')
}

function TimeZoneSlot({ city, now }: { city: City; now: Date }) {
  return (
    <>
      <span className="line-clamp-2 text-lg leading-tight">{city.name}</span>
      <span className="text-base sm:text-lg">{formatTime(now, city.timeZone)}</span>
    </>
  )
}

export function TimeZoneWidget({ className }: { className?: string }) {
  const now = useNow()
  const { isAuthenticated, timeZoneCities } = useDashboardData()
  const { mutate: setTimeZoneCities } = useMutationState(api.dashboard.setTimeZoneCities)
  const [editing, setEditing] = useState(false)

  async function handleSelect(slot: number, city: City) {
    try {
      await setTimeZoneCities({
        cities: timeZoneCities.map((current, i) => (i === slot ? city : current)),
      })
    } catch (error) {
      showError(error)
    }
  }

  return (
    <DashboardWidget
      title="Time Zone"
      editable
      editing={editing}
      onEditToggle={isAuthenticated ? () => setEditing((value) => !value) : undefined}
      editDisabledReason="Sign in to edit"
      className={className}
    >
      <div className="grid flex-1 grid-cols-3 gap-2">
        {timeZoneCities.map((city, slot) =>
          editing ? (
            <CityPicker key={slot} onSelect={(next) => handleSelect(slot, next)}>
              <button
                type="button"
                aria-label={`Change ${city.name}`}
                className={cn(slotStyles, 'border-dashed border-white hover:bg-white/10')}
              >
                <TimeZoneSlot city={city} now={now} />
              </button>
            </CityPicker>
          ) : (
            <div key={slot} className={slotStyles}>
              <TimeZoneSlot city={city} now={now} />
            </div>
          ),
        )}
      </div>
    </DashboardWidget>
  )
}

export function StickyNotesWidget({ className }: { className?: string }) {
  return (
    <DashboardWidget title="Sticky Notes" className={className}>
      <button
        type="button"
        disabled
        title="Em breve"
        aria-label="Open sticky notes"
        className="flex flex-1 items-center justify-center disabled:cursor-not-allowed"
      >
        <StickyNote className="size-14 fill-yellow-300 text-white" />
      </button>
    </DashboardWidget>
  )
}

export function CalendarWidget({ className }: { className?: string }) {
  const now = useNow()
  const { isAuthenticated, calendarCity } = useDashboardData()
  const { mutate: setCalendarCity } = useMutationState(api.dashboard.setCalendarCity)
  const [editing, setEditing] = useState(false)
  const weather = useWeather(calendarCity)
  const dates = formatDates(now, calendarCity.timeZone)
  const useFahrenheit = calendarCity.country === 'United States of America'
  const temperature = weather ? Math.round(useFahrenheit ? weather.tempF : weather.tempC) : null

  async function handleSelect(city: City) {
    try {
      await setCalendarCity({ city })
    } catch (error) {
      showError(error)
    }
  }

  const location = (
    <>
      {calendarCity.name} - {formatTime(now, calendarCity.timeZone)}
    </>
  )

  return (
    <DashboardWidget
      title="Calendar"
      editable
      editing={editing}
      onEditToggle={isAuthenticated ? () => setEditing((value) => !value) : undefined}
      editDisabledReason="Sign in to edit"
      className={className}
    >
      <div className="flex flex-1 items-center justify-between gap-4 text-white">
        <div className="min-w-0 space-y-1 text-base sm:text-lg">
          <p>{dates.long}</p>
          <p>{dates.short}</p>
          {editing ? (
            <CityPicker onSelect={handleSelect}>
              <button
                type="button"
                aria-label={`Change ${calendarCity.name}`}
                className="rounded border-2 border-dashed border-white px-2 text-left hover:bg-white/10"
              >
                {location}
              </button>
            </CityPicker>
          ) : (
            <p className="truncate">{location}</p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-center gap-2" title={weather?.text}>
          <span className="text-lg">
            {temperature ?? '--'}°{useFahrenheit ? 'F' : 'C'}
          </span>
          <WeatherIcon
            weather={weather}
            className="size-12 rounded-full bg-white/90 p-1.5 text-neutral-500"
          />
        </div>
      </div>
    </DashboardWidget>
  )
}

export function QuiGWidget({ className }: { className?: string }) {
  const { setOpen: setDashboardOpen } = useDashboardActions()
  const { setOpen: setFiloOpen } = useFiloActions()
  const { setOpen: setLinkStackOpen } = useLinkStackActions()

  const shortcuts = [
    {
      label: 'Filo',
      icon: <Folder className="size-5" />,
      onClick: () => {
        setDashboardOpen(false)
        setFiloOpen(true)
      },
    },
    {
      label: 'Link Stack',
      icon: <Link className="size-5" />,
      onClick: () => {
        setDashboardOpen(false)
        setLinkStackOpen(true)
      },
    },
  ]

  return (
    <section
      className={cn('flex items-center gap-3 rounded-primary bg-neutral-500 pr-3', className)}
      aria-label="QuiG shortcuts"
    >
      <div className="rounded-primary bg-black px-4 py-2 font-serif text-lg text-white">QuiG</div>

      <div className="custom-scrollbar flex flex-1 gap-2 overflow-x-auto py-1">
        {shortcuts.map(({ label, icon, onClick }) => (
          <button
            key={label}
            type="button"
            title={label}
            aria-label={label}
            onClick={onClick}
            className={cn(circleStyles, 'hover:bg-secondary-blue hover:text-white')}
          >
            {icon}
          </button>
        ))}

        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} aria-hidden className={circleStyles} />
        ))}
      </div>
    </section>
  )
}

export function MirrorWidget({ className }: { className?: string }) {
  return (
    <DashboardWidget className={cn('items-center justify-center', className)}>
      <span className="text-xl text-white">Mirror</span>
    </DashboardWidget>
  )
}

export function ShortcutsWidget({ className }: { className?: string }) {
  return (
    <DashboardWidget editable className={className}>
      <div className="grid flex-1 grid-cols-2 place-items-center gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} aria-hidden className={cn(circleStyles, 'size-10 sm:size-12')} />
        ))}
      </div>
    </DashboardWidget>
  )
}

export function DashboardActionsWidget({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-around gap-4 sm:flex-col', className)}>
      <button
        type="button"
        disabled
        title="Em breve"
        aria-label="Dashboard settings"
        className="flex size-12 items-center justify-center rounded-full bg-white text-secondary-blue disabled:cursor-not-allowed"
      >
        <Settings className="size-7" />
      </button>

      <button
        type="button"
        disabled
        title="Em breve"
        aria-label="Add widget"
        className="flex size-12 items-center justify-center rounded-full border-2 border-black bg-white text-neutral-500 outline outline-2 outline-white disabled:cursor-not-allowed"
      >
        <Plus className="size-7" />
      </button>
    </div>
  )
}
