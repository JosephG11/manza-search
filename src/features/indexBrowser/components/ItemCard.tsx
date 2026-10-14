'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Media } from '@/components/Media'
import { useMutationState } from '@/hooks/useMutationState'
import { ExternalLinkBadge } from '@/features/webSearch/components/ExternalLinkBadge'
import { ImagePlaceholder } from '@/features/shared/components/ImagePlaceholder'
import { api } from '../../../../convex/_generated/api'
import { getErrorMessage } from '../errors'
import type { IndexNodeItem, IndexViewer } from '../types'

type ItemCardProps = {
  item: IndexNodeItem
  viewer: IndexViewer | undefined
}

export function ItemCard({ item, viewer }: ItemCardProps) {
  const { mutate: deleteItem } = useMutationState(api.indexBrowser.deleteItem)
  const [coverFailed, setCoverFailed] = useState(false)

  // Imported articles link to pages of this site; anything else is an external link.
  const isInternal = item.link.startsWith('/')
  const canDelete = viewer && (viewer.isAdmin || viewer.userId === item.createdBy)

  async function handleDelete() {
    if (!window.confirm('Delete this item?')) return

    await deleteItem({ itemId: item._id }).catch((error: unknown) =>
      toast.error(getErrorMessage(error)),
    )
  }

  const cover = item.coverPublicId ? (
    <Media src={item.coverPublicId} alt={item.title} fill />
  ) : item.coverUrl && !coverFailed ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.coverUrl}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      className="size-full object-cover"
      onError={() => setCoverFailed(true)}
    />
  ) : (
    <ImagePlaceholder />
  )

  const content = (
    <>
      <div className="relative aspect-square w-full">{cover}</div>

      <p className="p-2 text-sm font-medium text-primary">{item.title}</p>
    </>
  )

  const linkClassName = 'block overflow-hidden rounded-lg border border-border'

  return (
    <div className="relative">
      {isInternal ? (
        <Link href={item.link} className={linkClassName}>
          {content}
        </Link>
      ) : (
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer nofollow ugc"
          className={linkClassName}
        >
          {content}
        </a>
      )}

      {!isInternal && <ExternalLinkBadge />}

      {canDelete && (
        <button
          type="button"
          aria-label={`Delete ${item.title}`}
          onClick={handleDelete}
          className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-red-600 hover:text-red-800"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  )
}
