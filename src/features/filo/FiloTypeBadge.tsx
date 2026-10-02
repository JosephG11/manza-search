import { BookOpen, FileText, ImageIcon, Link2, Video } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { FiloTypeBadgeProps } from './types'

const TYPE_BADGES = {
  article: { label: 'Article', Icon: FileText },
  link: { label: 'Link', Icon: Link2 },
  book: { label: 'Book', Icon: BookOpen },
  image: { label: 'Image', Icon: ImageIcon },
  video: { label: 'Video', Icon: Video },
}

export function FiloTypeBadge({ type }: FiloTypeBadgeProps) {
  const { label, Icon } = TYPE_BADGES[type]

  return (
    <Badge
      variant="secondary"
      className="pointer-events-none absolute bottom-1 left-1 gap-1 px-1.5 py-0 text-[10px]"
    >
      <Icon className="size-3" />
      {label}
    </Badge>
  )
}
