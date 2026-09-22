'use client'

import { useState } from 'react'
import { Folder } from 'lucide-react'
import { useClerk, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { MOMenuButton } from '@/features/moreOptions/components/MOMenuButton'
import { useFiloActions } from '@/stores/filoStore'

export function FiloStorageButton() {
  const { isSignedIn } = useUser()
  const { openSignIn } = useClerk()
  const { setOpen } = useFiloActions()
  const [showSignInPrompt, setShowSignInPrompt] = useState(false)

  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <MOMenuButton
          className="size-10 bg-[#c9a227]"
          aria-label="Open filo"
          onClick={() => (isSignedIn ? setOpen(true) : setShowSignInPrompt(true))}
        >
          <Folder className="size-5" />
        </MOMenuButton>

        <span className="font-serif text-sm text-white">Filo</span>
      </div>

      <Dialog open={showSignInPrompt} onOpenChange={setShowSignInPrompt}>
        <DialogContent aria-describedby="Filo signin required">
          <DialogTitle>Login necessário</DialogTitle>
          <DialogDescription>
            Essa função só fica disponível pra quem está logado.
          </DialogDescription>

          <Button
            onClick={() => {
              setShowSignInPrompt(false)
              openSignIn({ redirectUrl: '/' })
            }}
          >
            Fazer login
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
