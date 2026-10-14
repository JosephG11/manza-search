import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { requireAdmin } from './_utils'
import { indexSectionValidator } from './validators'

const MAX_IMAGES_PER_SECTION = 20
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export const list = query({
  args: { section: indexSectionValidator },
  handler: async (ctx, { section }) => {
    const images = await ctx.db
      .query('carouselImages')
      .withIndex('by_section', (q) => q.eq('section', section))
      .take(MAX_IMAGES_PER_SECTION)

    const withUrls = await Promise.all(
      images.map(async (image) => ({
        _id: image._id,
        url: await ctx.storage.getUrl(image.storageId),
      })),
    )

    return withUrls.filter((image): image is { _id: typeof image._id; url: string } => !!image.url)
  },
})

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)

    return await ctx.storage.generateUploadUrl()
  },
})

export const add = mutation({
  args: { section: indexSectionValidator, storageId: v.id('_storage') },
  handler: async (ctx, { section, storageId }) => {
    const user = await requireAdmin(ctx)

    const file = await ctx.db.system.get(storageId)
    const invalid =
      !file ||
      file.size > MAX_IMAGE_BYTES ||
      !file.contentType ||
      !ALLOWED_TYPES.includes(file.contentType)

    if (invalid) {
      await ctx.storage.delete(storageId)
      throw new ConvexError('Use a JPG, PNG, WebP or GIF image up to 5MB')
    }

    const existing = await ctx.db
      .query('carouselImages')
      .withIndex('by_section', (q) => q.eq('section', section))
      .take(MAX_IMAGES_PER_SECTION)

    if (existing.length >= MAX_IMAGES_PER_SECTION) {
      await ctx.storage.delete(storageId)
      throw new ConvexError(`Carousel is limited to ${MAX_IMAGES_PER_SECTION} images`)
    }

    await ctx.db.insert('carouselImages', { section, storageId, createdBy: user._id })
  },
})

export const remove = mutation({
  args: { imageId: v.id('carouselImages') },
  handler: async (ctx, { imageId }) => {
    await requireAdmin(ctx)

    const image = await ctx.db.get(imageId)
    if (!image) throw new ConvexError('Image not found')

    await ctx.storage.delete(image.storageId)
    await ctx.db.delete(imageId)
  },
})
