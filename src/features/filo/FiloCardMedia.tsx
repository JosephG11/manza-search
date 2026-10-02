import dynamic from 'next/dynamic'
import { ImagePlaceholder } from '../shared/components/ImagePlaceholder'
import { ImageDetailDialog } from '../shared/components/ImageDetailDialog'
import { FiloCardMediaProps } from './types'

const BookReader = dynamic(
  () => import('@/features/bookReader/components/BookReader').then((m) => m.BookReader),
  { ssr: false, loading: () => <ImagePlaceholder className="p-0 text-black" /> },
)

export function FiloCardMedia({ content, mediaElement, label }: FiloCardMediaProps) {
  if (content.type === 'image')
    return <ImageDetailDialog image={content} hasValidLink={false} triggerClassName="size-full" />

  if (content.type === 'link' || content.type === 'video')
    return (
      <a
        href={content.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block size-full"
        aria-label={label}
      >
        {mediaElement}
      </a>
    )

  if (content.type !== 'book') return mediaElement

  return (
    <BookReader book={content}>
      <button className="block size-full cursor-pointer" aria-label={label}>
        {mediaElement}
      </button>
    </BookReader>
  )
}
