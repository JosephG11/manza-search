'use client'

import { usePaginatedQuery } from 'convex/react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useMutationState } from '@/hooks/useMutationState'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { SECTION_CONFIG } from '../sectionConfig'
import type { IndexSection, IndexViewer } from '../types'
import { InlineCreateBox } from './InlineCreateBox'
import { NodeBlock } from './NodeBlock'

type NodeBlocksProps = {
  section: IndexSection
  viewer: IndexViewer | undefined
} & ({ letter: string; parentId?: undefined } | { parentId: Id<'indexNodes'>; letter?: undefined })

// The nodes of a letter (top level) or the children of a parent, each rendered as a block.
export function NodeBlocks({ section, viewer, letter, parentId }: NodeBlocksProps) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.indexBrowser.listNodes,
    parentId ? { section, parentId } : { section, letter },
    { initialNumItems: 20 },
  )
  const { mutate: createNode } = useMutationState(api.indexBrowser.createNode)

  const isEmpty = status !== 'LoadingFirstPage' && results.length === 0

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <InlineCreateBox
          label={parentId ? 'New subcategory' : SECTION_CONFIG[section].newCategoryLabel}
          maxLength={60}
          onCreate={(name) => createNode({ section, parentId, name })}
        />

        {status === 'LoadingFirstPage' && <Spinner />}
        {isEmpty && (
          <p className="text-sm text-muted-foreground">
            {parentId ? 'Nothing here yet.' : `No categories under ${letter} yet.`}
          </p>
        )}
      </div>

      {results.map((entry) => (
        <NodeBlock key={entry._id} section={section} entry={entry} viewer={viewer} />
      ))}

      {status === 'CanLoadMore' && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => loadMore(20)}>
            More
          </Button>
        </div>
      )}
    </div>
  )
}
