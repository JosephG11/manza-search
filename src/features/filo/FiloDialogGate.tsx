'use client'

import { useUser } from '@clerk/nextjs'
import { FiloDialog } from './FiloDialog'
import { useFiloActions, useFiloOpen } from '@/stores/filoStore'
import { SignInRequiredDialog } from '../shared/components/SignInRequiredDialog'

export function FiloDialogGate() {
  const { isSignedIn, isLoaded } = useUser()
  const open = useFiloOpen()
  const { setOpen } = useFiloActions()

  if (!isLoaded) return null

  if (!isSignedIn) return <SignInRequiredDialog open={open} onOpenChange={setOpen} />

  return <FiloDialog />
}
