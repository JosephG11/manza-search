'use server'

import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { actionClient } from '@/lib/safe-action'
import { isPayloadRow, toExternalContent } from '@/utilities/externalFiloContent'
import { fetchSavedContentSchema } from './schemas'

export const fetchSavedContent = actionClient
  .inputSchema(fetchSavedContentSchema)
  .action(async ({ parsedInput: { saveList } }) => {
    if (!saveList?.length) {
      console.warn('fetchSavedContent called with no saveList.')
      return []
    }

    try {
      const payload = await getPayload({ config: configPromise })

      const savedIds = saveList.filter(isPayloadRow).map((saved) => saved.contentId)

      const [articleResults, imageResults, bookResults] = await Promise.all([
        payload.find({
          collection: 'articles',
          pagination: false,
          where: {
            id: { in: savedIds },
          },
          depth: 1,
        }),
        payload.find({
          collection: 'article-media',
          pagination: false,
          where: {
            id: { in: savedIds },
          },
          depth: 1,
        }),
        payload.find({
          collection: 'books',
          pagination: false,
          where: {
            id: { in: savedIds },
          },
          depth: 1,
        }),
      ])

      const articles = articleResults.docs.map((doc) => ({ ...doc, type: 'article' as const }))
      const images = imageResults.docs.map((doc) => ({ ...doc, type: 'image' as const }))
      const books = bookResults.docs.map((doc) => ({ ...doc, type: 'book' as const }))

      const orderMap = new Map(saveList.map((saved, index) => [saved.contentId, index]))

      const externals = saveList.map(toExternalContent).filter((content) => content !== null)

      const mergedList = [...articles, ...images, ...books, ...externals].sort(
        (a, b) => (orderMap.get(a.id) ?? Infinity) - (orderMap.get(b.id) ?? Infinity),
      )

      return mergedList
    } catch (error) {
      console.error('[fetchSavedContent] Failed to query saved content:', error)
      throw new Error('Failed to fetch saved content.')
    }
  })
