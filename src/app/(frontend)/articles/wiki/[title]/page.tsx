import { notFound } from 'next/navigation'
import { cache } from 'react'
import type { Metadata } from 'next'
import { WikiArticleView } from '@/features/wikipedia/components/WikiArticleView'
import { getWikipediaArticle } from '@/features/wikipedia/wikipediaClient'

type Args = {
  params: Promise<{
    title: string
  }>
}

const queryWikiArticle = cache(async (title: string) => {
  try {
    return await getWikipediaArticle(title)
  } catch (error) {
    console.error('Error querying wikipedia article:', error)
    return null
  }
})

export default async function WikiArticle({ params }: Args) {
  const { title } = await params
  const decodedTitle = decodeURIComponent(title)
  const article = await queryWikiArticle(decodedTitle)

  if (!article) notFound()

  return <WikiArticleView article={article} url={`/articles/wiki/${title}`} />
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { title } = await params
  const article = await queryWikiArticle(decodeURIComponent(title))

  return {
    title: article ? `${article.title} | Manza Search` : 'Article | Manza Search',
    description: article?.intro[0]?.slice(0, 160),
  }
}
