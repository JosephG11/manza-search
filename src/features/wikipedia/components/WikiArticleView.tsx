import Link from 'next/link'
import React from 'react'
import TitleBar from '@/blocks/article-blocks/TitleBar'
import { ArticleLeftMenu } from '@/features/articles/components/ArticleLeftMenu'
import { BottomMenu } from '@/features/shared/components/BottomMenu'
import type { WikipediaArticle } from '../types'

const IMAGES_SECTION_ID = 'wiki-images'

const sectionId = (index: number) => `wiki-section-${index}`

function WikiRelatedBar({ related }: { related: string[] }) {
  return (
    <div className="mb-2 bg-black lg:mb-0">
      <div className="container flex w-full gap-4 overflow-x-auto py-1">
        {related.map((title) => (
          <Link key={title} href={`/articles/wiki/${encodeURIComponent(title)}`}>
            <div className="flex justify-center whitespace-nowrap rounded-[8px] bg-white px-3 py-[2px] font-medium hover:text-secondary-blue">
              {title}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function WikiHero({ article }: { article: WikipediaArticle }) {
  return (
    <div className="w-full p-2">
      <div className="border-content border-4">
        <div className="mx-auto flex w-3/4 justify-center rounded-b-[10px] bg-black md:w-1/2 xl:w-1/3">
          <h2 className="py-2 font-serif text-xl uppercase text-white">Scope Section</h2>
        </div>

        <div className="flex flex-wrap-reverse justify-center gap-2 px-2 pb-4 lg:pb-8 xl:flex-nowrap xl:justify-between">
          <div className="flex w-full flex-col justify-center gap-4 bg-slate-100 px-6 py-6 sm:px-12">
            <h1 className="font-serif text-3xl">{article.title}</h1>
            {article.intro.map((paragraph, index) => (
              <p key={index} className="font-serif">
                {paragraph}
              </p>
            ))}
          </div>

          {article.heroImage && (
            <div className="flex w-full items-center justify-center bg-slate-100 px-4 py-6 sm:w-fit sm:px-12">
              <div className="relative h-64 w-96 overflow-hidden shadow-[10px_10px_10px_black]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.heroImage}
                  alt={article.title}
                  className="size-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function WikiSection({
  id,
  title,
  paragraphs,
}: {
  id: string
  title: string
  paragraphs: string[]
}) {
  return (
    <div className="my-[2px]" id={id}>
      <div className="flex w-full flex-col gap-4 p-2">
        <TitleBar title={title} />

        <div className="border-content flex w-full flex-col gap-4 px-4 py-4 sm:px-10">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="font-serif">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

function WikiImagesSection({ images }: { images: WikipediaArticle['images'] }) {
  return (
    <div className="my-[2px]" id={IMAGES_SECTION_ID}>
      <div className="flex w-full flex-col gap-4 p-2">
        <TitleBar title="Images" />

        <div className="border-content grid grid-cols-2 gap-4 px-4 py-4 sm:px-10 md:grid-cols-3 xl:grid-cols-4">
          {images.map((image) => (
            <a
              key={image.url}
              href={image.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-1"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.thumbnail}
                alt={image.caption}
                loading="lazy"
                className="aspect-square w-full rounded-primary object-cover"
              />
              <span className="line-clamp-2 font-serif text-sm">{image.caption}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export function WikiArticleView({ article, url }: { article: WikipediaArticle; url: string }) {
  const sectionTitles = article.sections.map(({ title }, index) => ({
    id: sectionId(index),
    title,
  }))

  if (article.images.length > 0) {
    sectionTitles.push({ id: IMAGES_SECTION_ID, title: 'Images' })
  }

  const otherVerifiedSources = [
    {
      id: 'wikipedia',
      label: 'Wikipedia',
      link: { type: 'custom' as const, url: article.url, newTab: true },
    },
    ...article.sources.map(({ label, link }, index) => ({
      id: `source-${index}`,
      label,
      link: { type: 'custom' as const, url: link, newTab: true },
    })),
  ]

  return (
    <article className="pb-16">
      <WikiRelatedBar related={article.related} />

      <div className="flex">
        <div className="sticky top-0 hidden h-[650px] w-28 flex-col rounded-r-xl border-4 border-black bg-menu py-4 hover:bg-black lg:flex">
          <ArticleLeftMenu
            authors={['Wikipedia']}
            otherVerifiedSources={otherVerifiedSources}
            sectionTitles={sectionTitles}
            url={url}
            imagesHref={`#${IMAGES_SECTION_ID}`}
          />
        </div>

        <div className="flex w-full min-w-0 flex-col">
          <WikiHero article={article} />

          {article.sections.map((section, index) => (
            <WikiSection key={section.title + index} id={sectionId(index)} {...section} />
          ))}

          {article.images.length > 0 && <WikiImagesSection images={article.images} />}

          <p className="p-4 text-center font-serif text-sm">
            Content from{' '}
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-secondary-blue"
            >
              Wikipedia
            </a>
            , available under{' '}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-secondary-blue"
            >
              CC BY-SA 4.0
            </a>
            .
          </p>
        </div>
      </div>

      <BottomMenu />
    </article>
  )
}
