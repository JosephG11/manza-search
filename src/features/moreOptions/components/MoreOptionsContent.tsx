'use client'

import React from 'react'
import useBreakpoint from '@/hooks/useBreakpoint'
import { PopoverContent } from '@/components/ui/popover'
import { MOMenuButton } from './MOMenuButton'
import { Messenger } from '@/features/messenger/components/Messenger'
import { Calendar } from '@/features/calendar/components/Calendar'
import { MistralDialog } from '@/features/mistral/components/MistralDialog'

export function MoreOptionsContent() {
  const { isMobileSM } = useBreakpoint()

  return (
    <PopoverContent
      side={isMobileSM ? 'bottom' : 'left'}
      sideOffset={isMobileSM ? 20 : 80}
      className="w-fit border-0 bg-transparent p-0 shadow-none"
    >
      {isMobileSM ? (
        <div className="mr-4 flex w-32 flex-wrap gap-2">
          <Calendar />
          <MOMenuButton className="ml-1 bg-[#0011ff]">B</MOMenuButton>
          <MOMenuButton className="self-end bg-[#0011ff]">P</MOMenuButton>
          <Messenger />
          <MOMenuButton className="self-end bg-[#8a1384]">E</MOMenuButton>
          <MOMenuButton className="bg-[#006c00]">K</MOMenuButton>
          <MistralDialog />
        </div>
      ) : (
        <div className="mt-12 flex h-64 w-fit gap-2 sm:mt-0">
          <div className="flex w-[90px] flex-col justify-between gap-2 py-9">
            <MOMenuButton className="self-end bg-[#0011ff]">P</MOMenuButton>
            <Messenger />
            <MOMenuButton className="self-end bg-[#8a1384]">E</MOMenuButton>
          </div>

          <div className="flex flex-col justify-between py-1.5">
            <Calendar />
            <MistralDialog />
            <MOMenuButton className="bg-[#006c00]">K</MOMenuButton>
          </div>

          <div className="h-60">
            <MOMenuButton className="ml-1 bg-[#0011ff]">B</MOMenuButton>
          </div>
        </div>
      )}
    </PopoverContent>
  )
}
