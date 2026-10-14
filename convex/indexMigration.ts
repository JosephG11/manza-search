import { ConvexError, v } from 'convex/values'
import { internalMutation } from './_generated/server'
import type { MutationCtx } from './_generated/server'
import type { Id } from './_generated/dataModel'
import { toLetter, toSortKey } from './indexLetter'
import { indexSectionValidator } from './validators'

const BATCH = 2000

async function clearTable(ctx: MutationCtx, table: 'indexNodes' | 'indexNodeItems') {
  const docs = await ctx.db.query(table).take(BATCH)
  await Promise.all(docs.map((doc) => ctx.db.delete(doc._id)))

  return docs.length
}

// Deletes everything in the tree tables. Run repeatedly while the result is `hasMore`.
export const resetTree = internalMutation({
  args: {},
  handler: async (ctx) => {
    const items = await clearTable(ctx, 'indexNodeItems')
    const nodes = await clearTable(ctx, 'indexNodes')

    return { deleted: items + nodes, hasMore: items === BATCH || nodes === BATCH }
  },
})

// Imports Payload topics/categories/articles as a tree: topic -> category -> articles.
// Categories whose topic is missing are placed under `orphanTopicName`. Safe to re-run (idempotent).
export const importTree = internalMutation({
  args: {
    section: indexSectionValidator,
    createdByClerkId: v.string(),
    orphanTopicName: v.string(),
    dryRun: v.boolean(),
    topics: v.array(v.object({ id: v.string(), title: v.string() })),
    categories: v.array(
      v.object({ id: v.string(), title: v.string(), topicId: v.optional(v.string()) }),
    ),
    articles: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        slug: v.string(),
        categoryIds: v.array(v.string()),
        coverPublicId: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', args.createdByClerkId))
      .unique()
    if (!user) throw new ConvexError(`No Convex user with clerkId ${args.createdByClerkId}`)

    const summary = { nodesCreated: 0, itemsCreated: 0, orphanCategories: [] as string[] }

    async function ensureNode(name: string, parentId: Id<'indexNodes'> | undefined, depth: number) {
      const nameLower = name.toLowerCase()

      const existing = await ctx.db
        .query('indexNodes')
        .withIndex('by_section_parent_nameLower', (q) =>
          q.eq('section', args.section).eq('parentId', parentId).eq('nameLower', nameLower),
        )
        .first()
      if (existing) return existing._id

      const sortKey = toSortKey(name)
      summary.nodesCreated++

      return await ctx.db.insert('indexNodes', {
        section: args.section,
        parentId,
        depth,
        letter: toLetter(sortKey),
        name,
        nameLower,
        sortKey,
        createdBy: user!._id,
      })
    }

    const topicNodes = new Map<string, Id<'indexNodes'>>()
    for (const topic of args.topics) {
      topicNodes.set(topic.id, await ensureNode(topic.title, undefined, 0))
    }

    let orphanNodeId: Id<'indexNodes'> | undefined
    const categoryNodes = new Map<string, Id<'indexNodes'>>()

    for (const category of args.categories) {
      let parentId = category.topicId ? topicNodes.get(category.topicId) : undefined

      if (!parentId) {
        orphanNodeId ??= await ensureNode(args.orphanTopicName, undefined, 0)
        parentId = orphanNodeId
        summary.orphanCategories.push(category.title)
      }

      categoryNodes.set(category.id, await ensureNode(category.title, parentId, 1))
    }

    for (const article of args.articles) {
      const link = `/articles/${article.slug}`

      for (const categoryId of new Set(article.categoryIds)) {
        const nodeId = categoryNodes.get(categoryId)
        if (!nodeId) continue

        const siblings = await ctx.db
          .query('indexNodeItems')
          .withIndex('by_node', (q) => q.eq('nodeId', nodeId))
          .take(1000)
        if (siblings.some((item) => item.link === link)) continue

        summary.itemsCreated++
        await ctx.db.insert('indexNodeItems', {
          nodeId,
          title: article.title,
          link,
          coverPublicId: article.coverPublicId,
          createdBy: user._id,
        })
      }
    }

    // Throwing rolls back every write above, which is how the dry run stays side-effect free.
    if (args.dryRun) throw new ConvexError(`DRY RUN (nothing written): ${JSON.stringify(summary)}`)

    return summary
  },
})
