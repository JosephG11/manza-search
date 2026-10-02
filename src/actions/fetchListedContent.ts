'use server'

import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { actionClient } from '@/lib/safe-action'
import { isPayloadRow, toExternalContent } from '@/utilities/externalFiloContent'
import { fetchListedContentSchema } from './schemas'
import { FiloContent } from '@/features/filo/types'

export const fetchListsContent = actionClient
  .inputSchema(fetchListedContentSchema)
  .action(async ({ parsedInput: { listItems } }) => {
    if (!listItems?.length) return []

    const payload = await getPayload({ config: configPromise })

    const enrichedLists = await Promise.all(
      listItems.map(async (list) => {
        const listedIds = list.items.map((item) => item.contentId)
        const payloadIds = list.items.filter(isPayloadRow).map((item) => item.contentId)
        const externals = list.items.map(toExternalContent).filter((content) => content !== null)

        const [articles, images, books] = await Promise.all([
          payload.find({
            collection: 'articles',
            pagination: false,
            where: { id: { in: payloadIds } },
            depth: 1,
          }),
          payload.find({
            collection: 'article-media',
            pagination: false,
            where: { id: { in: payloadIds } },
            depth: 1,
          }),
          payload.find({
            collection: 'books',
            pagination: false,
            where: { id: { in: payloadIds } },
            depth: 1,
          }),
        ])

        const combined = [
          ...articles.docs.map((d) => ({ ...d, type: 'article' as const })),
          ...images.docs.map((d) => ({ ...d, type: 'image' as const })),
          ...books.docs.map((d) => ({ ...d, type: 'book' as const })),
          ...externals,
        ]

        const ordered = listedIds
          .map((id) => combined.find((doc) => doc.id === id))
          .filter((doc): doc is FiloContent => !!doc)

        return {
          ...list,
          items: ordered,
        }
      }),
    )

    return enrichedLists
  })
