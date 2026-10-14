import Link from 'next/link'
import { ImagePlaceholder } from '@/features/shared/components/ImagePlaceholder'
import type { WikipediaLetterEntry } from '@/features/wikipedia/types'

export function ScopeWikiCard({ title, thumbnail }: WikipediaLetterEntry) {
  return (
    <Link
      href={`/articles/wiki/${encodeURIComponent(title)}`}
      className="block overflow-hidden rounded-lg border border-border"
    >
      <div className="relative aspect-square w-full">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className="size-full object-cover"
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>

      <p className="p-2 text-sm font-medium text-primary">{title}</p>
    </Link>
  )
}
