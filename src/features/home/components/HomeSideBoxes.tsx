'use client'

import Image from 'next/image'
import { useFiloActions } from '@/stores/filoStore'
import { useDashboardActions } from '@/stores/dashboardStore'
import { Button } from '@/components/ui/button'

export function HomeSideBoxes() {
  const { setOpen } = useFiloActions()
  const { setOpen: setDashboardOpen } = useDashboardActions()

  return (
    <div className="order-1 mt-4 flex w-auto flex-1 flex-row justify-around gap-2 xl:flex-col xl:justify-normal">
      <Button
        onClick={() => setDashboardOpen(true)}
        aria-label="Open dashboard"
        className="flex h-16 w-16 items-center justify-center rounded-primary border border-black bg-black sm:h-32 sm:w-32 xl:h-40 xl:w-40"
      >
        <Image src="/svg/dashboard.svg" alt="Dashboard" width={75} height={75} className="invert" />
      </Button>

      <Button
        onClick={() => setOpen(true)}
        className="flex h-16 w-16 items-center justify-center rounded-primary border border-black bg-black sm:h-32 sm:w-32 xl:h-40 xl:w-40"
      >
        <Image src="/svg/folder.svg" alt="Folder" width={75} height={75} className="invert" />
      </Button>
    </div>
  )
}
