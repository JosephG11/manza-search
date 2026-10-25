'use client'

import React from 'react'
import { GalleryHorizontalEnd, LayersPlus, StepForward } from 'lucide-react'
import { SiWikibooks } from 'react-icons/si'
import useBreakpoint from '@/hooks/useBreakpoint'
import { PopoverContent } from '@/components/ui/popover'
import { MOMenuButton } from './MOMenuButton'
import { Messenger } from '@/features/messenger/components/Messenger'
import { Calendar } from '@/features/calendar/components/Calendar'
import { MistralDialog } from '@/features/mistral/components/MistralDialog'
import { LinkStackButton } from '@/features/linkStack/components/LinkStackButton'
import { Panel } from '@/features/shared/components/PanelTitle'
import { DashboardButton } from './DashboardButton'
import { FiloButton } from './FiloButton'

export function MoreOptionsContent() {
  const { isMobileSM } = useBreakpoint()

  const items = [
    <Calendar key="calendar" />,
    <MOMenuButton key="b" className="bg-[#0011ff]" aria-label="Books">
      <GalleryHorizontalEnd className="size-6" />
    </MOMenuButton>,
    <MOMenuButton key="p" className="bg-[#0011ff]" aria-label="Pages">
      <SiWikibooks className="size-6" />
    </MOMenuButton>,
    <Messenger key="messenger" />,
    <MOMenuButton key="e" className="bg-[#8a1384]" aria-label="Events">
      <LayersPlus className="size-6" />
    </MOMenuButton>,
    <MOMenuButton key="k" className="bg-[#006c00]" aria-label="Explore">
      <StepForward className="size-6" />
    </MOMenuButton>,
    <MistralDialog key="mistral" />,
    <DashboardButton key="dashboard" />,
    <FiloButton key="filo" />,
    <LinkStackButton key="linkStack" />,
  ]

  return (
    <PopoverContent
      side={isMobileSM ? 'bottom' : 'left'}
      sideOffset={isMobileSM ? 20 : 80}
      className="w-fit border-0 bg-transparent p-0 shadow-none"
    >
      <Panel title="QuiG" className="pb-6">
        <div className="grid grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.key} className="flex items-center justify-center">
              {item}
            </div>
          ))}
        </div>
      </Panel>
    </PopoverContent>
  )
}
