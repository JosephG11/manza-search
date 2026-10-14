'use client'

import { ArrowRight, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useMutationState } from '@/hooks/useMutationState'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { getErrorMessage } from '../errors'
import { useIndexNav } from '../hooks'
import type { IndexSection, IndexViewer, NodeEntry } from '../types'
import { AddTile } from './AddTile'
import { ItemCard } from './ItemCard'
import { NodeCard } from './NodeCard'

type NodeBlockProps = {
  section: IndexSection
  entry: NodeEntry
  viewer: IndexViewer | undefined
}

export function NodeBlock({ section, entry, viewer }: NodeBlockProps) {
  const { letterParam, go } = useIndexNav()
  const { mutate: deleteNode } = useMutationState(api.indexBrowser.deleteNode)

  const open = (nodeId: Id<'indexNodes'>) => go(letterParam ?? entry.letter, nodeId)
  const canDelete = viewer && (viewer.isAdmin || viewer.userId === entry.createdBy)

  async function handleDelete() {
    if (!window.confirm(`Delete "${entry.name}" and everything inside it?`)) return

    await deleteNode({ nodeId: entry._id }).catch((error: unknown) =>
      toast.error(getErrorMessage(error)),
    )
  }

  return (
    <section className="space-y-3 py-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => open(entry._id)}
          className="font-serif text-2xl hover:text-secondary-blue"
        >
          {entry.name}
        </button>

        {canDelete && (
          <button
            type="button"
            aria-label={`Delete ${entry.name}`}
            onClick={handleDelete}
            className="p-1 text-red-600 hover:text-red-800"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="w-full shrink-0 lg:w-40">
          <AddTile section={section} node={entry} childType={entry.childType} />
        </div>

        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {entry.childType === 'nodes' &&
            entry.preview.map((child) => (
              <NodeCard key={child._id} node={child} onOpen={() => open(child._id)} />
            ))}

          {entry.childType === 'items' &&
            entry.preview.map((item) => <ItemCard key={item._id} item={item} viewer={viewer} />)}
        </div>

        {entry.hasMore && (
          <button
            type="button"
            onClick={() => open(entry._id)}
            className="flex shrink-0 items-center justify-center gap-1 self-center font-serif text-secondary-blue hover:underline"
          >
            See all <ArrowRight className="size-4" />
          </button>
        )}
      </div>
    </section>
  )
}
