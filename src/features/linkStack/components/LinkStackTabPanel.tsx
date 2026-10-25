'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { LinkStackTab } from '../types'
import { AddLinkForm } from './AddLinkForm'
import { LinkStackItem } from './LinkStackItem'
import { RemoveTabButton } from './RemoveTabButton'

export function LinkStackTabPanel({ tab }: { tab: LinkStackTab }) {
  const [adding, setAdding] = useState(false)

  return (
    <div role="tabpanel" aria-label={tab.name} className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-white/60 pb-2">
        <RemoveTabButton tab={tab} />

        <button
          type="button"
          onClick={() => setAdding((value) => !value)}
          aria-expanded={adding}
          className="flex items-center gap-2 text-white hover:text-white/60"
        >
          <span className="flex size-5 items-center justify-center rounded bg-white text-black">
            <Plus className="size-4" />
          </span>
          add
        </button>
      </div>

      {adding && <AddLinkForm tabId={tab._id} onDone={() => setAdding(false)} />}

      {tab.links.length ? (
        <ul className="custom-scrollbar mt-2 flex-1 space-y-1 overflow-y-auto pr-1">
          {tab.links.map((link) => (
            <LinkStackItem key={link._id} link={link} />
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-center text-white/70">
          No links in {tab.name} yet. Click <span className="font-bold">add</span> to save one.
        </p>
      )}
    </div>
  )
}
