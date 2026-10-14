'use client'

import { usePaginatedQuery } from 'convex/react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { api } from '../../../../convex/_generated/api'
import type { IndexNode, IndexSection, IndexViewer } from '../types'
import { AddTile } from './AddTile'
import { ItemCard } from './ItemCard'

type ItemGridProps = {
  section: IndexSection
  node: IndexNode
  viewer: IndexViewer | undefined
}

export function ItemGrid({ section, node, viewer }: ItemGridProps) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.indexBrowser.listItems,
    { nodeId: node._id },
    { initialNumItems: 12 },
  )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        <AddTile section={section} node={node} childType="items" />

        {results.map((item) => (
          <ItemCard key={item._id} item={item} viewer={viewer} />
        ))}
      </div>

      {status === 'LoadingFirstPage' && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}

      {status === 'CanLoadMore' && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => loadMore(12)}>
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
