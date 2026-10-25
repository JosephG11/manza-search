'use client'

import { useState } from 'react'
import { Check, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { ConvexError } from 'convex/values'
import { api } from '../../../../convex/_generated/api'
import { useMutationState } from '@/hooks/useMutationState'
import { cn } from '@/utilities/ui'
import { LinkStackTab } from '../types'

type LinkStackTabsBarProps = {
  tabs: LinkStackTab[]
  activeTabId?: string
  onSelect: (tabId: string) => void
}

export function LinkStackTabsBar({ tabs, activeTabId, onSelect }: LinkStackTabsBarProps) {
  const { mutate: createTab, pending } = useMutationState(api.linkStack.createTab)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

  function closeForm() {
    setCreating(false)
    setName('')
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault()

    if (!name.trim()) return

    try {
      const tabId = await createTab({ name })
      toast.success(`Tab ${name.trim()} created!`)
      onSelect(tabId)
      closeForm()
    } catch (error) {
      toast.error(error instanceof ConvexError ? error.data : 'Unexpected error occurred')
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-primary bg-neutral-500 p-2">
      <div role="tablist" aria-label="Link stack tabs" className="contents">
        {tabs.map((tab) => {
          const active = tab._id === activeTabId

          return (
            <button
              key={tab._id}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => onSelect(tab._id)}
              className={cn(
                'max-w-40 truncate rounded bg-secondary-blue px-3 py-1 text-white',
                active ? 'ring-2 ring-white' : 'opacity-80 hover:opacity-100',
              )}
            >
              {tab.name}
            </button>
          )
        })}
      </div>

      {creating ? (
        <form onSubmit={handleCreate} className="flex items-center gap-1">
          <input
            autoFocus
            value={name}
            maxLength={40}
            onChange={(event) => setName(event.target.value)}
            placeholder="Tab name"
            aria-label="New tab name"
            className="h-8 w-32 rounded border-0 bg-white px-2 text-black outline-none"
          />

          <button
            type="submit"
            disabled={pending || !name.trim()}
            aria-label="Create tab"
            className="flex size-8 items-center justify-center rounded bg-black text-white disabled:opacity-50"
          >
            <Check className="size-4" />
          </button>

          <button
            type="button"
            onClick={closeForm}
            aria-label="Cancel"
            className="flex size-8 items-center justify-center rounded bg-black/60 text-white"
          >
            <X className="size-4" />
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          aria-label="New tab"
          title="New tab"
          className="flex size-8 items-center justify-center rounded border-2 border-white text-white hover:bg-white hover:text-neutral-500"
        >
          <Plus className="size-5" />
        </button>
      )}
    </div>
  )
}
