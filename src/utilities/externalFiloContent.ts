import type { LinkWithType, VideoWithType } from '@/features/filo/types'

type ContentRow = {
  contentId: string
  contentType: string
  external?: { url: string; title: string; thumbnail?: string; source?: string }
}

const EXTERNAL_TYPES = ['link', 'video']

export const isPayloadRow = ({ contentType }: ContentRow) => !EXTERNAL_TYPES.includes(contentType)

export function toExternalContent(row: ContentRow): LinkWithType | VideoWithType | null {
  if (!row.external || !EXTERNAL_TYPES.includes(row.contentType)) return null

  return {
    ...row.external,
    id: row.contentId,
    type: row.contentType as 'link' | 'video',
  }
}
