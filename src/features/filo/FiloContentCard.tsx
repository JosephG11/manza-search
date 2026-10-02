import { Media } from '@/components/Media'
import { RenderMedia } from '../shared/components/RenderMedia'
import { ImagePlaceholder } from '../shared/components/ImagePlaceholder'
import { RemoveFiloItemButton } from './RemoveFiloItemButton'
import { FiloCardMedia } from './FiloCardMedia'
import { FiloTypeBadge } from './FiloTypeBadge'
import { toast } from 'sonner'
import { ConvexError } from 'convex/values'
import { FiloContentCardProps } from './types'

export function FiloContentCard({ content, removeFn, pending, name }: FiloContentCardProps) {
  async function handleRemove() {
    try {
      if (removeFn) {
        await removeFn({ contentId: content.id })
        toast.success(`${name ? name : 'Content'} removed!`)
      }
    } catch (error) {
      toast.error(error instanceof ConvexError ? error.data : 'Unexpected error occurred')
    }
  }

  let mediaElement: React.ReactNode = <ImagePlaceholder className="p-0 text-black" />
  let label: string = `${content.type}`

  switch (content.type) {
    case 'article':
      if (content.heroImage && typeof content.heroImage !== 'string') {
        mediaElement = (
          <Media imgClassName="size-full object-cover" resource={content.heroImage} fill />
        )
      }

      label = content.title
      break

    case 'image':
      mediaElement = <RenderMedia media={content} />

      label = content.alt
      break

    case 'book':
      if (content?.content?.cover && typeof content?.content?.cover !== 'string') {
        mediaElement = <RenderMedia media={content.content.cover} />
      }

      label = content.title
      break

    case 'link':
    case 'video':
      if (content.thumbnail) {
        mediaElement = (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={content.thumbnail} alt={content.title} className="size-full object-cover" />
        )
      }

      label = content.title
      break
  }

  return (
    <div className="space-y-2">
      <div className="relative h-40 w-32 overflow-hidden rounded-md border-2 border-black">
        <FiloCardMedia content={content} mediaElement={mediaElement} label={label} />

        <FiloTypeBadge type={content.type} />

        <RemoveFiloItemButton onClick={handleRemove} disabled={pending ? pending : false} />
      </div>

      <div className="w-32 truncate text-center text-lg">{label}</div>
    </div>
  )
}
