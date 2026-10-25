'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ConvexError } from 'convex/values'
import { api } from '../../../../convex/_generated/api'
import { useMutationState } from '@/hooks/useMutationState'
import { Button } from '@/components/ui/button'
import { LinkStackTab } from '../types'

type AddLinkFormProps = {
  tabId: LinkStackTab['_id']
  onDone: () => void
}

const inputStyles = 'h-9 w-full rounded border-0 bg-white px-2 text-black outline-none'

export function AddLinkForm({ tabId, onDone }: AddLinkFormProps) {
  const { mutate: addLink, pending } = useMutationState(api.linkStack.addLink)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!url.trim()) return

    try {
      await addLink({ tabId, url, title: title || undefined })
      toast.success('Link added!')
      onDone()
    } catch (error) {
      toast.error(error instanceof ConvexError ? error.data : 'Unexpected error occurred')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-2 flex flex-col gap-2 rounded-primary bg-neutral-500 p-2"
    >
      <input
        autoFocus
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="https://www.linkedin.com"
        aria-label="Link URL"
        inputMode="url"
        className={inputStyles}
      />

      <div className="flex gap-2">
        <input
          value={title}
          maxLength={120}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Name (optional)"
          aria-label="Link name"
          className={inputStyles}
        />

        <Button
          type="submit"
          disabled={pending || !url.trim()}
          className="h-9 bg-black text-white hover:bg-black/70"
        >
          Save
        </Button>
      </div>
    </form>
  )
}
