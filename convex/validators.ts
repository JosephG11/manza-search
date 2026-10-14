import { v } from 'convex/values'

export const contentTypeValidator = v.union(
  v.literal('article'),
  v.literal('image'),
  v.literal('book'),
  v.literal('link'),
  v.literal('video'),
)

export const externalContentValidator = v.object({
  url: v.string(),
  title: v.string(),
  thumbnail: v.optional(v.string()),
  source: v.optional(v.string()),
})

export const indexSectionValidator = v.union(
  v.literal('scope'),
  v.literal('art'),
  v.literal('img'),
  v.literal('sound'),
  v.literal('literature'),
  v.literal('travel'),
  v.literal('healthAndWellness'),
)
