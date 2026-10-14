'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMutationState } from '@/hooks/useMutationState'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { INDEX_MAX_DEPTH } from '../../../../convex/indexLetter'
import { getErrorMessage } from '../errors'
import { useRequireSignIn } from '../hooks'
import type { IndexNode, IndexSection } from '../types'

const tileClassName =
  'flex aspect-square w-full items-center justify-center rounded-lg border-2 border-dashed border-secondary-blue text-secondary-blue hover:bg-secondary-blue hover:text-white'

const formClassName =
  'flex aspect-square w-full flex-col justify-center gap-2 rounded-lg border border-border p-3'

type PlusButtonProps = { label: string; onClick: () => void }

function PlusButton({ label, onClick }: PlusButtonProps) {
  const requireSignIn = useRequireSignIn()

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => requireSignIn(onClick)}
      className={tileClassName}
    >
      <Plus className="size-10" />
    </button>
  )
}

type NodeFormProps = { section: IndexSection; parentId: Id<'indexNodes'>; onDone: () => void }

function NodeForm({ section, parentId, onDone }: NodeFormProps) {
  const { mutate: createNode, pending } = useMutationState(api.indexBrowser.createNode)
  const [name, setName] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    await createNode({ section, parentId, name })
      .then(onDone)
      .catch((error: unknown) => toast.error(getErrorMessage(error)))
  }

  return (
    <form onSubmit={handleSubmit} className={formClassName}>
      <Input
        autoFocus
        required
        maxLength={60}
        placeholder="Name"
        aria-label="Subcategory name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          Add
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

type ItemFormProps = { nodeId: Id<'indexNodes'>; onDone: () => void }

function ItemForm({ nodeId, onDone }: ItemFormProps) {
  const { mutate: createItem, pending } = useMutationState(api.indexBrowser.createItem)
  const [title, setTitle] = useState('')
  const [link, setLink] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    await createItem({ nodeId, title, link })
      .then(onDone)
      .catch((error: unknown) => toast.error(getErrorMessage(error)))
  }

  return (
    <form onSubmit={handleSubmit} className={formClassName}>
      <Input
        autoFocus
        required
        maxLength={120}
        placeholder="Title"
        aria-label="Title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <Input
        required
        type="url"
        placeholder="https://..."
        aria-label="Link"
        value={link}
        onChange={(event) => setLink(event.target.value)}
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          Add
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

type AddTileProps = {
  section: IndexSection
  node: IndexNode
  childType: 'nodes' | 'items' | 'empty'
}

// A node holds either subcategories or items. The first thing added to an empty node decides which.
export function AddTile({ section, node, childType }: AddTileProps) {
  const [mode, setMode] = useState<'closed' | 'choose' | 'node' | 'item'>('closed')
  const canHaveChildNodes = node.depth + 1 <= INDEX_MAX_DEPTH

  const close = () => setMode('closed')

  if (mode === 'node') return <NodeForm section={section} parentId={node._id} onDone={close} />
  if (mode === 'item') return <ItemForm nodeId={node._id} onDone={close} />

  if (childType === 'nodes') {
    return <PlusButton label="New subcategory" onClick={() => setMode('node')} />
  }

  if (childType === 'items') {
    return <PlusButton label="New item" onClick={() => setMode('item')} />
  }

  if (mode === 'choose') {
    return (
      <div className={formClassName}>
        {canHaveChildNodes && (
          <Button size="sm" onClick={() => setMode('node')}>
            Subcategory
          </Button>
        )}
        <Button size="sm" onClick={() => setMode('item')}>
          Item
        </Button>
        <Button size="sm" variant="outline" onClick={close}>
          Cancel
        </Button>
      </div>
    )
  }

  return <PlusButton label="Add" onClick={() => setMode('choose')} />
}
