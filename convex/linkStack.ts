import { ConvexError, v } from 'convex/values'
import { mutation, query, MutationCtx } from './_generated/server'
import { Doc, Id } from './_generated/dataModel'
import { getAuthenticatedUser } from './_utils'

const MAX_TAB_NAME = 40
const MAX_TITLE = 120
const MAX_URL = 2048

async function getOwnedTab(ctx: MutationCtx, user: Doc<'users'>, tabId: Id<'linkStackTabs'>) {
  const tab = await ctx.db.get(tabId)

  if (!tab) throw new ConvexError('Tab not found')
  if (tab.userId !== user._id) throw new ConvexError('unauthorized')

  return tab
}

function normalizeUrl(raw: string) {
  const trimmed = raw.trim()
  const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  let parsed: URL
  try {
    parsed = new URL(withProtocol)
  } catch {
    throw new ConvexError('Invalid link')
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new ConvexError('Only http and https links are allowed')
  }

  const url = parsed.toString()
  if (url.length > MAX_URL) throw new ConvexError('Link is too long')

  return url
}

// Tabs come back oldest first (creation order); links come back newest first.
export const getTabsWithLinks = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx)

    const tabs = await ctx.db
      .query('linkStackTabs')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect()

    return await Promise.all(
      tabs.map(async (tab) => {
        const links = await ctx.db
          .query('linkStackLinks')
          .withIndex('by_tab', (q) => q.eq('tabId', tab._id))
          .order('desc')
          .collect()

        return { ...tab, links }
      }),
    )
  },
})

export const createTab = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const user = await getAuthenticatedUser(ctx)
    const trimmed = name.trim()

    if (!trimmed) throw new ConvexError('Tab name is required')
    if (trimmed.length > MAX_TAB_NAME) {
      throw new ConvexError(`Tab name must be at most ${MAX_TAB_NAME} characters`)
    }

    const existing = await ctx.db
      .query('linkStackTabs')
      .withIndex('by_user_name', (q) => q.eq('userId', user._id).eq('name', trimmed))
      .unique()

    if (existing) throw new ConvexError(`Tab (${trimmed}) already exists`)

    return await ctx.db.insert('linkStackTabs', { userId: user._id, name: trimmed })
  },
})

export const removeTab = mutation({
  args: { tabId: v.id('linkStackTabs') },
  handler: async (ctx, { tabId }) => {
    const user = await getAuthenticatedUser(ctx)
    const tab = await getOwnedTab(ctx, user, tabId)

    const links = await ctx.db
      .query('linkStackLinks')
      .withIndex('by_tab', (q) => q.eq('tabId', tab._id))
      .collect()

    await Promise.all(links.map((link) => ctx.db.delete(link._id)))
    await ctx.db.delete(tab._id)
  },
})

export const addLink = mutation({
  args: {
    tabId: v.id('linkStackTabs'),
    url: v.string(),
    title: v.optional(v.string()),
  },
  handler: async (ctx, { tabId, url, title }) => {
    const user = await getAuthenticatedUser(ctx)
    const tab = await getOwnedTab(ctx, user, tabId)
    const normalized = normalizeUrl(url)
    const trimmedTitle = title?.trim().slice(0, MAX_TITLE) || undefined

    const existing = await ctx.db
      .query('linkStackLinks')
      .withIndex('by_tab_url', (q) => q.eq('tabId', tab._id).eq('url', normalized))
      .unique()

    if (existing) throw new ConvexError(`Link already in ${tab.name}`)

    return await ctx.db.insert('linkStackLinks', {
      userId: user._id,
      tabId: tab._id,
      url: normalized,
      title: trimmedTitle,
    })
  },
})

export const removeLink = mutation({
  args: { linkId: v.id('linkStackLinks') },
  handler: async (ctx, { linkId }) => {
    const user = await getAuthenticatedUser(ctx)
    const link = await ctx.db.get(linkId)

    if (!link) throw new ConvexError('Link not found')
    if (link.userId !== user._id) throw new ConvexError('unauthorized')

    await ctx.db.delete(link._id)
  },
})
