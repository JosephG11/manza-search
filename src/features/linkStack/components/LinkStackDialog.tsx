'use client'

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { LinkStackContent } from './LinkStackContent'

type LinkStackDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LinkStackDialog({ open, onOpenChange }: LinkStackDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[560px] max-h-[90vh] flex-col gap-3 overflow-hidden border-black bg-menu p-8 font-serif text-white"
        closeButtonStyles="text-white"
      >
        <DialogTitle className="sr-only">Links</DialogTitle>
        <DialogDescription className="sr-only">
          Organize your links and websites into tabs
        </DialogDescription>

        <LinkStackContent />
      </DialogContent>
    </Dialog>
  )
}
