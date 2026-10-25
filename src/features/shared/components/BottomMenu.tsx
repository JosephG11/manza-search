import React from 'react'
import { Button } from '@/components/ui/button'
import { DocPadPopoverButton } from '@/features/docPad/components/DocPadPopoverButton'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/utilities/ui'

import { noScrollbarsClassName } from 'react-remove-scroll-bar'
import { ToolsMenu } from '@/features/toolsMenu/components/ToolsMenu'
import { StorageMenu } from '@/features/storage/components/StorageMenu'
import { GamepadDirectional } from 'lucide-react'
import { MenuBoxIcon } from '@/components/site-icons'
import { Panel } from '@/features/shared/components/PanelTitle'

const popoverStyles = 'w-fit border-0 bg-transparent p-0 shadow-none'

export function BottomMenu() {
  return (
    <div
      className={cn(
        noScrollbarsClassName,
        'fixed bottom-0 z-10 flex h-12 w-full justify-between sm:h-16',
      )}
    >
      <div className="w-16 sm:w-28">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              aria-label="Tools"
              className="size-full rounded-b-none rounded-tl-none rounded-tr-xl bg-menu-red hover:bg-pink-500"
            >
              <GamepadDirectional className="size-8 text-white" />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            side="top"
            align="start"
            sideOffset={8}
            className={cn(popoverStyles, 'ml-2')}
          >
            <Panel title="Tools">
              <ToolsMenu />
            </Panel>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex-1 overflow-hidden rounded-t-xl border-x-[3px] border-t-[3px] border-green-600">
        <div className="flex size-full items-center justify-center bg-menu hover:bg-black">
          <DocPadPopoverButton />
        </div>
      </div>

      <div className="w-16 sm:w-28">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              aria-label="Storage"
              className="flex size-full gap-1 rounded-b-none rounded-tl-xl rounded-tr-none bg-blue-800 hover:bg-green-600"
            >
              <MenuBoxIcon className="h-8 w-8 text-white" />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            side="top"
            align="end"
            sideOffset={8}
            className={cn(popoverStyles, 'mr-2')}
          >
            <Panel title="Storage" className="min-w-52">
              <StorageMenu />
            </Panel>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
