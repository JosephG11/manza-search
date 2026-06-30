import React from 'react'

import { cn } from '@/utilities/ui'
import { MoreOptionsMenu } from '@/features/moreOptions/components/MoreOptionsMenu'

import { zeroRightClassName } from 'react-remove-scroll-bar'

export function RightMenu() {
  return (
    <div className={cn('relative flex size-fit px-2 sm:size-28 sm:p-0')}>
      <MoreOptionsMenu />
    </div>
  )
}

export function RightMenuContainer() {
  return (
    <div className={cn(zeroRightClassName, 'fixed right-0 top-[25%] z-50 hidden sm:block')}>
      <RightMenu />
    </div>
  )
}
