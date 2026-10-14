import { ConvexError, v } from 'convex/values'
import { paginationOptsValidator } from 'convex/server'
import { internal } from './_generated/api'
import { internalMutation, mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'
import { getAuthenticatedUser, isAdmin } from './_utils'
import { indexSectionValidator } from './validators'
import { isIndexLetter, normalizeName, toLetter, toSortKey } from './indexLetter'

const MAX_NAME_LENGTH = 60
const MAX_TITLE_LENGTH = 120
const MAX_LINK_LENGTH = 2048
const MAX_DEPTH = 3
const CREATIONS_PER_HOUR = 20
const HOUR_MS = 60 * 60 * 1000
const DELETE_SCAN_LIMIT = 500
const PREVIEW_COUNT = 5

type Node = Doc<'indexNodes'>
type NodeItem = Doc<'indexNodeItems'>

export type NodeListEntry = Node &
  (
    | { childType: 'nodes'; preview: Node[]; hasMore: boolean }
    | { childType: 'items'; preview: NodeItem[]; hasMore: boolean }
    | { childType: 'empty'; preview: []; hasMore: false }
  )

function validateText(value: string, label: string, maxLength: number) {
  const text = normalizeName(value)

  if (text.length === 0) throw new ConvexError(`${label} is required`)
  if (text.length > maxLength) {
    throw new ConvexError(`${label} must be at most ${maxLength} characters`)
  }

  return text
}

function validateLink(value: string) {
  const link = value.trim()

  if (link.length > MAX_LINK_LENGTH) throw new ConvexError('Link is too long')

  let url: URL
  try {
    url = new URL(link)
  } catch {
    throw new ConvexError('Link must be a valid URL')
  }

  if (url.protocol !== 'https:') throw new ConvexError('Link must start with https://')
  if (url.username || url.password) throw new ConvexError('Link must not contain credentials')

  return url.toString()
}

async function assertUnderRateLimit(ctx: MutationCtx, user: Doc<'users'>) {
  if (isAdmin(user)) return

  const userId = user._id
  const since = Date.now() - HOUR_MS

  const [nodes, items] = await Promise.all([
    ctx.db
      .query('indexNodes')
      .withIndex('by_createdBy', (q) => q.eq('createdBy', userId).gt('_creationTime', since))
      .take(CREATIONS_PER_HOUR),
    ctx.db
      .query('indexNodeItems')
      .withIndex('by_createdBy', (q) => q.eq('createdBy', userId).gt('_creationTime', since))
      .take(CREATIONS_PER_HOUR),
  ])

  if (nodes.length + items.length >= CREATIONS_PER_HOUR) {
    throw new ConvexError('Too many submissions. Try again later.')
  }
}

async function getOptionalUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) return null

  return await ctx.db
    .query('users')
    .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
    .unique()
}

async function hasChildNodes(ctx: QueryCtx, nodeId: Id<'indexNodes'>) {
  const child = await ctx.db
    .query('indexNodes')
    .withIndex('by_parent_sortKey', (q) => q.eq('parentId', nodeId))
    .first()

  return child !== null
}

async function hasItems(ctx: QueryCtx, nodeId: Id<'indexNodes'>) {
  const item = await ctx.db
    .query('indexNodeItems')
    .withIndex('by_node', (q) => q.eq('nodeId', nodeId))
    .first()

  return item !== null
}

async function withPreview(ctx: QueryCtx, node: Node): Promise<NodeListEntry> {
  const childNodes = await ctx.db
    .query('indexNodes')
    .withIndex('by_parent_sortKey', (q) => q.eq('parentId', node._id))
    .take(PREVIEW_COUNT + 1)

  if (childNodes.length > 0) {
    return {
      ...node,
      childType: 'nodes',
      preview: childNodes.slice(0, PREVIEW_COUNT),
      hasMore: childNodes.length > PREVIEW_COUNT,
    }
  }

  const items = await ctx.db
    .query('indexNodeItems')
    .withIndex('by_node', (q) => q.eq('nodeId', node._id))
    .order('desc')
    .take(PREVIEW_COUNT + 1)

  if (items.length > 0) {
    return {
      ...node,
      childType: 'items',
      preview: items.slice(0, PREVIEW_COUNT),
      hasMore: items.length > PREVIEW_COUNT,
    }
  }

  return { ...node, childType: 'empty', preview: [], hasMore: false }
}

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const user = await getOptionalUser(ctx)

    return user ? { userId: user._id, isAdmin: isAdmin(user) } : null
  },
})

// `nodeId` comes straight from the URL, so it is validated instead of trusted.
export const getNode = query({
  args: { nodeId: v.string() },
  handler: async (ctx, { nodeId }) => {
    const id = ctx.db.normalizeId('indexNodes', nodeId)
    const node = id ? await ctx.db.get(id) : null
    if (!node) return null

    const ancestors: Node[] = []
    let parentId = node.parentId

    while (parentId && ancestors.length <= MAX_DEPTH) {
      const parent: Node | null = await ctx.db.get(parentId)
      if (!parent) break

      ancestors.unshift(parent)
      parentId = parent.parentId
    }

    const childType: 'nodes' | 'items' | 'empty' = (await hasChildNodes(ctx, node._id))
      ? 'nodes'
      : (await hasItems(ctx, node._id))
        ? 'items'
        : 'empty'

    return { node, ancestors, childType }
  },
})

// Top-level nodes of a letter, or the children of `parentId`, each with a preview of its own children.
export const listNodes = query({
  args: {
    section: indexSectionValidator,
    letter: v.optional(v.string()),
    parentId: v.optional(v.id('indexNodes')),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { section, letter, parentId, paginationOpts }) => {
    let result

    if (parentId) {
      result = await ctx.db
        .query('indexNodes')
        .withIndex('by_parent_sortKey', (q) => q.eq('parentId', parentId))
        .paginate(paginationOpts)
    } else {
      if (!letter || !isIndexLetter(letter)) throw new ConvexError('Invalid letter')

      result = await ctx.db
        .query('indexNodes')
        .withIndex('by_section_parent_letter_sortKey', (q) =>
          q.eq('section', section).eq('parentId', undefined).eq('letter', letter),
        )
        .paginate(paginationOpts)
    }

    const page = await Promise.all(result.page.map((node) => withPreview(ctx, node)))

    return { ...result, page }
  },
})

export const listItems = query({
  args: {
    nodeId: v.id('indexNodes'),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { nodeId, paginationOpts }) => {
    return await ctx.db
      .query('indexNodeItems')
      .withIndex('by_node', (q) => q.eq('nodeId', nodeId))
      .order('desc')
      .paginate(paginationOpts)
  },
})

export const createNode = mutation({
  args: {
    section: indexSectionValidator,
    parentId: v.optional(v.id('indexNodes')),
    name: v.string(),
  },
  handler: async (ctx, { section, parentId, name }) => {
    const user = await getAuthenticatedUser(ctx)
    const cleanName = validateText(name, 'Name', MAX_NAME_LENGTH)
    const nameLower = cleanName.toLowerCase()

    let depth = 0

    if (parentId) {
      const parent = await ctx.db.get(parentId)
      if (!parent) throw new ConvexError('Parent not found')
      if (parent.section !== section) throw new ConvexError('Parent is in another section')
      if (parent.depth + 1 > MAX_DEPTH) throw new ConvexError('Too many levels')
      if (await hasItems(ctx, parentId)) {
        throw new ConvexError('This category already has items, it cannot have subcategories')
      }

      depth = parent.depth + 1
    }

    const existing = await ctx.db
      .query('indexNodes')
      .withIndex('by_section_parent_nameLower', (q) =>
        q.eq('section', section).eq('parentId', parentId).eq('nameLower', nameLower),
      )
      .first()

    if (existing) throw new ConvexError(`"${existing.name}" already exists here`)

    await assertUnderRateLimit(ctx, user)

    const sortKey = toSortKey(cleanName)

    return await ctx.db.insert('indexNodes', {
      section,
      parentId,
      depth,
      letter: toLetter(sortKey),
      name: cleanName,
      nameLower,
      sortKey,
      createdBy: user._id,
    })
  },
})

export const createItem = mutation({
  args: {
    nodeId: v.id('indexNodes'),
    title: v.string(),
    link: v.string(),
  },
  handler: async (ctx, { nodeId, title, link }) => {
    const user = await getAuthenticatedUser(ctx)

    const node = await ctx.db.get(nodeId)
    if (!node) throw new ConvexError('Category not found')
    if (await hasChildNodes(ctx, nodeId)) {
      throw new ConvexError('This category has subcategories, add the item to one of them')
    }

    const cleanTitle = validateText(title, 'Title', MAX_TITLE_LENGTH)
    const cleanLink = validateLink(link)

    await assertUnderRateLimit(ctx, user)

    const itemId = await ctx.db.insert('indexNodeItems', {
      nodeId,
      title: cleanTitle,
      link: cleanLink,
      createdBy: user._id,
    })

    await ctx.scheduler.runAfter(0, internal.indexCover.fetchCover, { itemId, link: cleanLink })

    return itemId
  },
})

export const setCover = internalMutation({
  args: { itemId: v.id('indexNodeItems'), coverUrl: v.string() },
  handler: async (ctx, { itemId, coverUrl }) => {
    const item = await ctx.db.get(itemId)
    if (!item) return

    await ctx.db.patch(itemId, { coverUrl })
  },
})

export const deleteItem = mutation({
  args: { itemId: v.id('indexNodeItems') },
  handler: async (ctx, { itemId }) => {
    const user = await getAuthenticatedUser(ctx)

    const item = await ctx.db.get(itemId)
    if (!item) throw new ConvexError('Item not found')
    if (item.createdBy !== user._id && !isAdmin(user)) throw new ConvexError('Unauthorized')

    await ctx.db.delete(itemId)
  },
})

// Deletes the node and everything under it. Non-admins can only delete subtrees made entirely of their own content.
export const deleteNode = mutation({
  args: { nodeId: v.id('indexNodes') },
  handler: async (ctx, { nodeId }) => {
    const user = await getAuthenticatedUser(ctx)

    const root = await ctx.db.get(nodeId)
    if (!root) throw new ConvexError('Category not found')

    const admin = isAdmin(user)
    const nodes: Node[] = [root]
    const items: NodeItem[] = []

    for (let i = 0; i < nodes.length; i++) {
      const current = nodes[i]!

      const [children, currentItems] = await Promise.all([
        ctx.db
          .query('indexNodes')
          .withIndex('by_parent_sortKey', (q) => q.eq('parentId', current._id))
          .take(DELETE_SCAN_LIMIT + 1),
        ctx.db
          .query('indexNodeItems')
          .withIndex('by_node', (q) => q.eq('nodeId', current._id))
          .take(DELETE_SCAN_LIMIT + 1),
      ])

      nodes.push(...children)
      items.push(...currentItems)

      if (nodes.length > DELETE_SCAN_LIMIT || items.length > DELETE_SCAN_LIMIT) {
        throw new ConvexError('Too much content to delete at once')
      }
    }

    if (!admin && [...nodes, ...items].some((doc) => doc.createdBy !== user._id)) {
      throw new ConvexError('Unauthorized')
    }

    await Promise.all([
      ...items.map((item) => ctx.db.delete(item._id)),
      ...nodes.map((node) => ctx.db.delete(node._id)),
    ])
  },
})
