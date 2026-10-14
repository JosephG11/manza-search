'use client'

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useIndexNav } from '../hooks'
import type { IndexSection, IndexViewer, NodeDetails } from '../types'
import { AddTile } from './AddTile'
import { ItemGrid } from './ItemGrid'
import { NodeBlocks } from './NodeBlocks'

type NodeViewProps = {
  section: IndexSection
  details: NodeDetails
  viewer: IndexViewer | undefined
}

export function NodeView({ section, details, viewer }: NodeViewProps) {
  const { go } = useIndexNav()
  const { node, ancestors, childType } = details

  const letter = (ancestors[0] ?? node).letter
  const parent = ancestors[ancestors.length - 1]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => go(letter, parent?._id)}>
          <ArrowLeft className="size-4" /> Back
        </Button>

        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 font-serif text-3xl"
        >
          {ancestors.map((ancestor) => (
            <span key={ancestor._id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => go(letter, ancestor._id)}
                className="hover:text-secondary-blue"
              >
                {ancestor.name}
              </button>
              <span aria-hidden>›</span>
            </span>
          ))}
          <h2>{node.name}</h2>
        </nav>
      </div>

      {childType === 'nodes' && (
        <NodeBlocks section={section} viewer={viewer} parentId={node._id} />
      )}

      {childType === 'items' && <ItemGrid section={section} node={node} viewer={viewer} />}

      {childType === 'empty' && (
        <div className="flex items-center gap-4">
          <div className="w-40">
            <AddTile section={section} node={node} childType="empty" />
          </div>
          <p className="text-sm text-muted-foreground">
            Nothing here yet. Add a subcategory or an item.
          </p>
        </div>
      )}
    </div>
  )
}
