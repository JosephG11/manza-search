'use server'

import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { actionClient } from '@/lib/safe-action'
import { isPayloadRow, toExternalContent } from '@/utilities/externalFiloContent'
import { fetchPinnedContentSchema } from './schemas'

export const fetchPinnedContent = actionClient
  .inputSchema(fetchPinnedContentSchema)
  .action(async ({ parsedInput: { pinList } }) => {
    if (!pinList?.length) {
      console.warn('fetchPinnedContent called with no pinList.')
      return []
    }

    try {
      const payload = await getPayload({ config: configPromise })

      const savedIds = pinList.filter(isPayloadRow).map((pin) => pin.contentId)

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

      const orderMap = new Map(pinList.map((pin, index) => [pin.contentId, index]))

      const externals = pinList.map(toExternalContent).filter((content) => content !== null)

      const mergedList = [...articles, ...images, ...books, ...externals].sort(
        (a, b) => (orderMap.get(a.id) ?? Infinity) - (orderMap.get(b.id) ?? Infinity),
      )

      return mergedList
    } catch (error) {
      console.error('[fetchPinnedContent] Failed to query pinned content:', error)
      throw new Error('Failed to fetch pinned content.')
    }
  })
