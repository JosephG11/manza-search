import { Article, ArticleMedia, Book } from '@/payload-types'
import { sectionTitle } from '@/utilities/getSectionTitles'
import { ButtonProps } from '@/components/ui/button'
import { ReactNode } from 'react'
import type { ExternalContentInput, FiloContentType } from '@/features/filo/types'

export type CardArticleData = Pick<Article, 'slug' | 'meta' | 'title' | 'updatedAt'>

export type ArticleCardProps = {
  alignItems?: 'center'
  className?: string
  doc?: CardArticleData
  relationTo?: 'articles'
  title?: string
  updatedAt?: string
}

export type ArticleArchiveProps = {
  articles: CardArticleData[]
}

export type ArticleLeftMenuProps = Pick<Article, 'otherVerifiedSources'> & {
  authors: string[]
  sectionTitles: sectionTitle[]
  url?: string
  imagesHref?: string
}

export interface ArticleLeftMenuContainerProps {
  article: Article
  url?: string
}

export type ArticleMenuButtonProps = ButtonProps & {
  dark?: boolean
}

export type PopoverButtonProps = {
  data?: (string | NonNullable<Article['otherVerifiedSources']>[number] | sectionTitle)[]
  children: ReactNode
  dark?: boolean
}

export type ArticleTopMenuContainerProps = {
  article: Article
  className: string
  url?: string
}

export type RelatedArticlesProps = {
  articles: Article['relatedArticles']
}

type MenuItem = {
  name: string
  onClick: () => void
  disabled: boolean
}

export type ExtraContentPopoverMenuProps = {
  menuItems: MenuItem[]
  content: string | null | ArticleMedia | Book | { id: string }
  isSignedIn?: boolean
  contentType: FiloContentType
  external?: ExternalContentInput
}
