import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getAuthenticatedUser } from './_utils'
import { contentTypeValidator, externalContentValidator } from './validators'

export const saveContent = mutation({
  args: {
    contentId: v.string(),
    contentType: contentTypeValidator,
    external: v.optional(externalContentValidator),
  },
  handler: async (ctx, { contentId, contentType, external }) => {
    const currentUser = await getAuthenticatedUser(ctx)

    const exists = await ctx.db
      .query('savedContent')
      .withIndex('by_user_content', (q) =>
        q.eq('userId', currentUser._id).eq('contentId', contentId),
      )
      .unique()

    if (exists) {
      throw new ConvexError(`${contentType} already saved`)
    }

    await ctx.db.insert('savedContent', {
      userId: currentUser._id,
      contentId,
      contentType,
      external,
    })
  },
})

export const unsaveContent = mutation({
  args: {
    contentId: v.string(),
  },
  handler: async (ctx, { contentId }) => {
    const currentUser = await getAuthenticatedUser(ctx)

    const saved = await ctx.db
      .query('savedContent')
      .withIndex('by_user_content', (q) =>
        q.eq('userId', currentUser._id).eq('contentId', contentId),
      )
      .unique()

    if (!saved) {
      throw new ConvexError("Content doesn't exist")
    }

    await ctx.db.delete(saved._id)
  },
})

export const getSaved = query({
  args: {
    contentId: v.string(),
  },
  handler: async (ctx, { contentId }) => {
    const currentUser = await getAuthenticatedUser(ctx)

    return await ctx.db
      .query('savedContent')
      .withIndex('by_user_content', (q) =>
        q.eq('userId', currentUser._id).eq('contentId', contentId),
      )
      .unique()
  },
})
