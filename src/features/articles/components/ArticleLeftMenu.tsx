import React from 'react'
import { ArticleMenuButton } from './ArticleMenuButton'
import { ArticlePopoverButton } from './ArticlePopoverButton'
import scrollToTop from '@/utilities/scrollToTop'
import { ArticleLeftMenuProps } from '../types'
import Link from 'next/link'

const MenuSeparator = () => <div className="mb-2 h-1 w-full bg-black" />

export function ArticleLeftMenu({
  authors,
  otherVerifiedSources,
  sectionTitles,
  url,
  imagesHref,
}: ArticleLeftMenuProps) {
  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <ArticleMenuButton onClick={scrollToTop}>TOP</ArticleMenuButton>

        <ArticleMenuButton asChild>
          <Link href={imagesHref ?? `${url}/images`}>IMG</Link>
        </ArticleMenuButton>
        <ArticleMenuButton>VIDS</ArticleMenuButton>
      </div>

      <MenuSeparator />

      <div className="flex flex-col items-center gap-4">
        <ArticlePopoverButton data={sectionTitles} dark>
          TBL
        </ArticlePopoverButton>

        <ArticleMenuButton>Articles</ArticleMenuButton>

        <ArticleMenuButton>SHOP</ArticleMenuButton>

        <ArticlePopoverButton data={authors}>Authors</ArticlePopoverButton>
      </div>

      <MenuSeparator />

      <div className="flex flex-col items-center">
        <ArticlePopoverButton data={otherVerifiedSources ?? []} dark>
          OVS
        </ArticlePopoverButton>
      </div>
    </>
  )
}
