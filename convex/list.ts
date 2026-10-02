import { ConvexError, v } from 'convex/values'
import { mutation } from './_generated/server'
import { getAuthenticatedUser } from './_utils'
import { contentTypeValidator, externalContentValidator } from './validators'

export const createList = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, { name }) => {
    const user = await getAuthenticatedUser(ctx)

    const existing = await ctx.db
      .query('contentLists')
      .withIndex('by_user_name', (q) => q.eq('userId', user._id).eq('name', name))
      .unique()

    if (existing) throw new ConvexError(`List with name (${name}) already exists`)

    await ctx.db.insert('contentLists', {
      userId: user._id,
      name,
    })
  },
})

export const addToList = mutation({
  args: {
    listId: v.id('contentLists'),
    contentId: v.string(),
    contentType: contentTypeValidator,
    external: v.optional(externalContentValidator),
  },
  handler: async (ctx, { listId, contentId, contentType, external }) => {
    const user = await getAuthenticatedUser(ctx)

    const list = await ctx.db.get(listId)

    if (!list) throw new ConvexError('List not found')
    if (list.userId !== user._id) throw new ConvexError('unauthorized')

    const existing = await ctx.db
      .query('listedContent')
      .withIndex('by_list_content', (q) => q.eq('listId', listId).eq('contentId', contentId))
      .unique()

    if (existing) throw new ConvexError('Content already added to this list')

    await ctx.db.insert('listedContent', {
      userId: user._id,
      listId,
      contentId,
      contentType,
      external,
    })
  },
})

export const removeFromList = mutation({
  args: {
    listId: v.id('contentLists'),
    contentId: v.string(),
  },
  handler: async (ctx, { listId, contentId }) => {
    const user = await getAuthenticatedUser(ctx)

    const existing = await ctx.db
      .query('listedContent')
      .withIndex('by_list', (q) => q.eq('listId', listId))
      .filter((q) =>
        q.and(q.eq(q.field('userId'), user._id), q.eq(q.field('contentId'), contentId)),
      )
      .unique()

    if (!existing) throw new ConvexError('Content not found in list')

    await ctx.db.delete(existing._id)
  },
})

export const removeList = mutation({
  args: { listId: v.id('contentLists') },
  handler: async (ctx, { listId }) => {
    const user = await getAuthenticatedUser(ctx)

    const list = await ctx.db.get(listId)

    if (!list) throw new ConvexError('List not found')
    if (list.userId !== user._id) throw new ConvexError('unauthorized')

    const listContent = await ctx.db
      .query('listedContent')
      .withIndex('by_list', (q) => q.eq('listId', listId))
      .collect()

    if (listContent && listContent.length > 0) {
      await Promise.all(listContent.map((item) => ctx.db.delete(item._id)))
    }

    await ctx.db.delete(list._id)
  },
})

export const createListWithContent = mutation({
  args: {
    name: v.string(),
    contentId: v.string(),
    contentType: contentTypeValidator,
    external: v.optional(externalContentValidator),
  },
  handler: async (ctx, { name, contentId, contentType, external }) => {
    const user = await getAuthenticatedUser(ctx)

    const existing = await ctx.db
      .query('contentLists')
      .withIndex('by_user_name', (q) => q.eq('userId', user._id).eq('name', name))
      .unique()

    if (existing) throw new ConvexError(`List with name (${name}) already exists`)

    const listId = await ctx.db.insert('contentLists', {
      userId: user._id,
      name,
    })

    if (!listId) throw new ConvexError(`Error creating list (${name})`)

    await ctx.db.insert('listedContent', {
      userId: user._id,
      listId: listId,
      contentId,
      contentType,
      external,
    })
  },
})
