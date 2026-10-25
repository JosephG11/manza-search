'use client'

import { useClerk } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type SignInRequiredDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignInRequiredDialog({ open, onOpenChange }: SignInRequiredDialogProps) {
  const { openSignIn } = useClerk()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby="Signin required"
        className="border-black bg-menu p-8 font-serif"
        closeButtonStyles="text-white"
      >
        <DialogHeader>
          <DialogTitle className="text-white">Login necessário</DialogTitle>
          <DialogDescription>
            Essa função só fica disponível pra quem está logado.
          </DialogDescription>
        </DialogHeader>

        <Button
          className="bg-black hover:bg-neutral-900"
          onClick={() => {
            onOpenChange(false)
            openSignIn({ redirectUrl: '/' })
          }}
        >
          Fazer login
        </Button>
      </DialogContent>
    </Dialog>
  )
}
