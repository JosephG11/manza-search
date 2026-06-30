'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import Image from 'next/image'
import { useUser } from '@clerk/nextjs'
import { useFiloActions } from '@/stores/filoStore'
import { FiloDialog } from '@/features/filo/FiloDialog'
import { cn } from '@/utilities/ui'
import { Button } from '@/components/ui/button'

export function HomeSideBoxes() {
  const { isSignedIn } = useUser()
  const { setOpen } = useFiloActions()

  return (
    <div className="order-1 mt-4 flex w-auto flex-1 flex-row justify-around gap-2 xl:flex-col xl:justify-normal">
      <Dialog>
        <DialogTrigger asChild>
          <Button className="flex h-16 w-16 items-center justify-center rounded-primary border border-black bg-black sm:h-32 sm:w-32 xl:h-40 xl:w-40">
            <Image
              src="/svg/dashboard.svg"
              alt="Dashboard"
              width={75}
              height={75}
              className="invert"
            />
          </Button>
        </DialogTrigger>

        <DialogTitle className="sr-only">Dashboard</DialogTitle>
        <DialogDescription className="sr-only">Dashboard dialog content</DialogDescription>

        <DialogContent
          aria-description="Dashboard dialog content"
          className={cn(
            'sm:px-6 md:h-[90%] md:max-w-[80%]',
            'h-full max-w-full px-0',
            'border-black bg-menu',
          )}
          closeButtonStyles="text-white"
        >
          dashboard
        </DialogContent>
      </Dialog>

      <Button
        onClick={() => setOpen(true)}
        className="flex h-16 w-16 items-center justify-center rounded-primary border border-black bg-black sm:h-32 sm:w-32 xl:h-40 xl:w-40"
      >
        <Image src="/svg/folder.svg" alt="Folder" width={75} height={75} className="invert" />
      </Button>

      {isSignedIn && <FiloDialog />}
    </div>
  )
}
