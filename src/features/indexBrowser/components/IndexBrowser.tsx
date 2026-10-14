'use client'

import { useQuery } from 'convex/react'
import { Spinner } from '@/components/ui/spinner'
import { api } from '../../../../convex/_generated/api'
import { isIndexLetter, type IndexLetter } from '../../../../convex/indexLetter'
import { useIndexNav } from '../hooks'
import type { IndexSection } from '../types'
import { IndexTableOfContent } from './IndexTableOfContent'
import { NodeBlocks } from './NodeBlocks'
import { NodeView } from './NodeView'

const DEFAULT_LETTER: IndexLetter = 'A'

export function IndexBrowser({ section }: { section: IndexSection }) {
  const { letterParam, nodeParam } = useIndexNav()
  const viewer = useQuery(api.indexBrowser.viewer)
  const details = useQuery(api.indexBrowser.getNode, nodeParam ? { nodeId: nodeParam } : 'skip')

  const topLevel = details ? (details.ancestors[0] ?? details.node) : null
  const letter =
    topLevel?.letter ?? (isIndexLetter(letterParam ?? '') ? letterParam! : DEFAULT_LETTER)

  return (
    <>
      <IndexTableOfContent active={isIndexLetter(letter) ? letter : DEFAULT_LETTER} />

      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 lg:pl-32">
        {!nodeParam && <NodeBlocks section={section} viewer={viewer} letter={letter} />}

        {nodeParam && details === undefined && <Spinner />}

        {nodeParam && details === null && (
          <p className="text-sm text-muted-foreground">This category no longer exists.</p>
        )}

        {nodeParam && details && <NodeView section={section} details={details} viewer={viewer} />}
      </div>
    </>
  )
}
