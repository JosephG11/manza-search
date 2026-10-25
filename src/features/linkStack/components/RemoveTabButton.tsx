'use client'

import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ConvexError } from 'convex/values'
import { api } from '../../../../convex/_generated/api'
import { useMutationState } from '@/hooks/useMutationState'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { LinkStackTab } from '../types'

export function RemoveTabButton({ tab }: { tab: LinkStackTab }) {
  const { mutate: removeTab, pending } = useMutationState(api.linkStack.removeTab)

  async function handleRemove() {
    try {
      await removeTab({ tabId: tab._id })
      toast.success(`${tab.name} removed!`)
    } catch (error) {
      toast.error(error instanceof ConvexError ? error.data : 'Unexpected error occurred')
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="flex min-w-0 items-center gap-2 text-sm text-white/70 hover:text-red-500"
        >
          <Trash2 className="size-4 shrink-0" />
          <span className="truncate">Delete tab</span>
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent className="border-black bg-menu">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">{`Tab: ${tab.name}`}</AlertDialogTitle>
          <AlertDialogDescription className="text-accent">
            Are you sure you want to delete this tab and its {tab.links.length} link(s)?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="bg-transparent text-white">Cancel</AlertDialogCancel>

          <AlertDialogAction
            disabled={pending}
            onClick={handleRemove}
            className="bg-red-600 hover:bg-red-900"
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
