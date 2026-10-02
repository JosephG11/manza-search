import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getAuthenticatedUser } from './_utils'
import { contentTypeValidator, externalContentValidator } from './validators'

export const pinContent = mutation({
  args: {
    contentId: v.string(),
    contentType: contentTypeValidator,
    external: v.optional(externalContentValidator),
  },
  handler: async (ctx, { contentId, contentType, external }) => {
    const currentUser = await getAuthenticatedUser(ctx)

    const exists = await ctx.db
      .query('pinnedContent')
      .withIndex('by_user_content', (q) =>
        q.eq('userId', currentUser._id).eq('contentId', contentId),
      )
      .unique()

    if (exists) {
      throw new ConvexError(`${contentType} already pinned`)
    }

    await ctx.db.insert('pinnedContent', {
      userId: currentUser._id,
      contentId,
      contentType,
      external,
      pinnedAt: Date.now(),
    })
  },
})

export const unpinContent = mutation({
  args: {
    contentId: v.string(),
  },
  handler: async (ctx, { contentId }) => {
    const currentUser = await getAuthenticatedUser(ctx)

    const pin = await ctx.db
      .query('pinnedContent')
      .withIndex('by_user_content', (q) =>
        q.eq('userId', currentUser._id).eq('contentId', contentId),
      )
      .unique()

    if (!pin) {
      throw new ConvexError("Content doesn't exist")
    }

    await ctx.db.delete(pin._id)
  },
})

export const getPinned = query({
  args: {
    contentId: v.string(),
  },
  handler: async (ctx, { contentId }) => {
    const currentUser = await getAuthenticatedUser(ctx)

    return await ctx.db
      .query('pinnedContent')
      .withIndex('by_user_content', (q) =>
        q.eq('userId', currentUser._id).eq('contentId', contentId),
      )
      .unique()
  },
})
