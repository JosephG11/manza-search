'use client'

import { useState } from 'react'
import { useConvexAuth, useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Spinner } from '@/components/ui/spinner'
import { LinkStackTabsBar } from './LinkStackTabsBar'
import { LinkStackTabPanel } from './LinkStackTabPanel'

export function LinkStackContent() {
  const { isAuthenticated } = useConvexAuth()
  const tabs = useQuery(api.linkStack.getTabsWithLinks, isAuthenticated ? {} : 'skip')
  const [selectedTabId, setSelectedTabId] = useState<string | null>(null)

  if (tabs === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="size-12" />
      </div>
    )
  }

  // Falls back to the first tab when nothing is selected or the selected tab was removed.
  const activeTab = tabs.find((tab) => tab._id === selectedTabId) ?? tabs[0]

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <LinkStackTabsBar tabs={tabs} activeTabId={activeTab?._id} onSelect={setSelectedTabId} />

      {activeTab ? (
        <LinkStackTabPanel key={activeTab._id} tab={activeTab} />
      ) : (
        <p className="mt-8 text-center text-white/70">
          Create your first tab with the <span className="font-bold">+</span> button, e.g. Personal,
          Work, Banking…
        </p>
      )}
    </div>
  )
}
