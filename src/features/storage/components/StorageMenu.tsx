'use client'

import type { ReactNode } from 'react'
import { Calculator, Folder, LayoutDashboard, MapIcon } from 'lucide-react'
import { cn } from '@/utilities/ui'
import { useFiloActions } from '@/stores/filoStore'
import { useDashboardActions } from '@/stores/dashboardStore'

type StorageItem = {
  label: string
  icon: ReactNode
  color: string
  onClick?: () => void
}

export function StorageMenu() {
  const { setOpen: setFiloOpen } = useFiloActions()
  const { setOpen: setDashboardOpen } = useDashboardActions()

  const items: StorageItem[] = [
    {
      label: 'Filo',
      icon: <Folder className="size-5" />,
      color: 'bg-[#c9a227]',
      onClick: () => setFiloOpen(true),
    },
    {
      label: 'Dashboard',
      icon: <LayoutDashboard className="size-5" />,
      color: 'bg-[#0a7ea4]',
      onClick: () => setDashboardOpen(true),
    },
    {
      label: 'Calculator',
      icon: <Calculator className="size-5" />,
      color: 'bg-[#006c00]',
    },
    {
      label: 'RoadMap',
      icon: <MapIcon className="size-5" />,
      color: 'bg-[#8a1384]',
    },
  ]

  return (
    <ul className="flex w-full flex-col gap-3">
      {items.map(({ label, icon, color, onClick }) => (
        <li key={label}>
          <button
            type="button"
            onClick={onClick}
            disabled={!onClick}
            title={onClick ? label : 'Em breve'}
            className="flex w-full items-center gap-3 rounded-full pr-4 text-left hover:text-secondary-blue disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-inherit"
          >
            <span
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-black text-white',
                color,
              )}
            >
              {icon}
            </span>

            <span className="font-serif">{label}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
