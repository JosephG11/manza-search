'use client'

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/utilities/ui'
import { useDashboardActions, useDashboardOpen } from '@/stores/dashboardStore'
import {
  CalendarWidget,
  DashboardActionsWidget,
  MirrorWidget,
  QuiGWidget,
  ShortcutsWidget,
  StickyNotesWidget,
  TimeZoneWidget,
} from './DashboardWidgets'
import { GoalsWidget } from './GoalsWidget'

export function DashboardDialog() {
  const open = useDashboardOpen()
  const { setOpen } = useDashboardActions()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className={cn(
          'flex flex-col gap-4 overflow-hidden border-black bg-menu p-8 font-serif',
          'h-full max-w-full md:h-auto md:max-h-[90%] md:max-w-5xl',
        )}
        closeButtonStyles="text-white"
      >
        <DialogTitle className="sr-only">Dashboard</DialogTitle>
        <DialogDescription className="sr-only">
          Your dashboard with time zones, calendar, goals and quick tools
        </DialogDescription>

        <div className="custom-scrollbar grid flex-1 grid-cols-1 gap-3 overflow-y-auto pr-1 md:grid-cols-12">
          <TimeZoneWidget className="md:col-span-5" />
          <StickyNotesWidget className="md:col-span-2" />
          <CalendarWidget className="md:col-span-5" />

          <GoalsWidget className="md:col-span-5" />

          <div className="grid grid-cols-2 gap-3 md:col-span-7 md:grid-cols-7">
            <QuiGWidget className="col-span-2 md:col-span-7" />
            <MirrorWidget className="min-h-32 md:col-span-3" />
            <ShortcutsWidget className="md:col-span-2" />
            <DashboardActionsWidget className="col-span-2 md:col-span-2" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
