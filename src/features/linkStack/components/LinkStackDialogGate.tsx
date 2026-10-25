'use client'

import { useUser } from '@clerk/nextjs'
import { useLinkStackActions, useLinkStackOpen } from '@/stores/linkStackStore'
import { SignInRequiredDialog } from '@/features/shared/components/SignInRequiredDialog'
import { LinkStackDialog } from './LinkStackDialog'

export function LinkStackDialogGate() {
  const { isSignedIn, isLoaded } = useUser()
  const open = useLinkStackOpen()
  const { setOpen } = useLinkStackActions()

  if (!isLoaded) return null

  if (!isSignedIn) return <SignInRequiredDialog open={open} onOpenChange={setOpen} />

  return <LinkStackDialog open={open} onOpenChange={setOpen} />
}
