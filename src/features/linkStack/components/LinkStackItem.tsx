'use client'

import { useState } from 'react'
import { Globe, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ConvexError } from 'convex/values'
import { api } from '../../../../convex/_generated/api'
import { useMutationState } from '@/hooks/useMutationState'
import { LinkStackLink } from '../types'
import { getFaviconUrl, getHostname } from '../utils'

export function LinkStackItem({ link }: { link: LinkStackLink }) {
  const { mutate: removeLink, pending } = useMutationState(api.linkStack.removeLink)
  const [iconFailed, setIconFailed] = useState(false)

  async function handleRemove() {
    try {
      await removeLink({ linkId: link._id })
      toast.success('Link removed!')
    } catch (error) {
      toast.error(error instanceof ConvexError ? error.data : 'Unexpected error occurred')
    }
  }

  return (
    <li className="flex items-center gap-3 rounded-primary px-1 py-1 hover:bg-white/10">
      <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
        {iconFailed ? (
          <Globe className="size-5 text-black" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getFaviconUrl(link.url)}
            alt=""
            className="size-5"
            onError={() => setIconFailed(true)}
          />
        )}
      </span>

      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        title={link.url}
        className="min-w-0 flex-1 text-white hover:underline"
      >
        <span className="block truncate">{link.title ?? link.url}</span>
        {link.title && (
          <span className="block truncate text-xs text-white/60">{getHostname(link.url)}</span>
        )}
      </a>

      <button
        type="button"
        onClick={handleRemove}
        disabled={pending}
        aria-label={`Remove ${link.title ?? link.url}`}
        className="shrink-0 text-white hover:text-red-500 disabled:opacity-50"
      >
        <Trash2 className="size-5" />
      </button>
    </li>
  )
}
