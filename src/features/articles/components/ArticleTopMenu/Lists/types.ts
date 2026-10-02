import type { ExternalContentInput, FiloContentType } from '@/features/filo/types'

type ListItem = {
  content: { id: string }
  contentType: FiloContentType
  external?: ExternalContentInput
}

export type ListButtonProps = ListItem

export type ListsButtonAuthenticatedProps = ListItem & {
  children: React.ReactNode
}
