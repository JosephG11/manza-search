import type { IndexSection } from './types'

type SectionConfig = {
  title: string
  newCategoryLabel: string
  newItemLabel: string
}

export const SECTION_CONFIG: Record<IndexSection, SectionConfig> = {
  scope: { title: 'Scope', newCategoryLabel: 'New category', newItemLabel: 'New item' },
  art: { title: 'Art', newCategoryLabel: 'New category', newItemLabel: 'New item' },
  img: { title: 'Img', newCategoryLabel: 'New category', newItemLabel: 'New item' },
  sound: { title: 'Sound', newCategoryLabel: 'New category', newItemLabel: 'New item' },
  literature: { title: 'Literature', newCategoryLabel: 'New category', newItemLabel: 'New item' },
  travel: { title: 'Travel', newCategoryLabel: 'New category', newItemLabel: 'New item' },
  healthAndWellness: {
    title: 'Health & Wellness',
    newCategoryLabel: 'New category',
    newItemLabel: 'New item',
  },
}
