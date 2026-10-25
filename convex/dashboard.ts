import { ConvexError, Infer, v } from 'convex/values'
import { mutation, query, MutationCtx } from './_generated/server'
import { Doc, Id } from './_generated/dataModel'
import { getAuthenticatedUser } from './_utils'
import { cityValidator } from './validators'

const TIME_ZONE_SLOTS = 3
const MAX_GOAL = 80
const MAX_GOALS = 30

async function upsertSettings(
  ctx: MutationCtx,
  user: Doc<'users'>,
  patch: Partial<Pick<Doc<'dashboardSettings'>, 'timeZoneCities' | 'calendarCity'>>,
) {
  const settings = await ctx.db
    .query('dashboardSettings')
    .withIndex('by_user', (q) => q.eq('userId', user._id))
    .unique()

  if (settings) return await ctx.db.patch(settings._id, patch)

  await ctx.db.insert('dashboardSettings', { userId: user._id, ...patch })
}

async function getOwnedGoal(ctx: MutationCtx, user: Doc<'users'>, goalId: Id<'goals'>) {
  const goal = await ctx.db.get(goalId)

  if (!goal) throw new ConvexError('Goal not found')
  if (goal.userId !== user._id) throw new ConvexError('unauthorized')

  return goal
}

// IANA names like "America/Sao_Paulo" or "America/Argentina/Buenos_Aires".
const TIME_ZONE_PATTERN = /^[A-Za-z_]+(\/[A-Za-z0-9_+-]+){1,2}$/

function validateCity(city: Infer<typeof cityValidator>) {
  if (!TIME_ZONE_PATTERN.test(city.timeZone)) throw new ConvexError('Invalid time zone')
}

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx)

    return await ctx.db
      .query('dashboardSettings')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .unique()
  },
})

// The client always sends all slots, filling unsaved ones with its presets.
export const setTimeZoneCities = mutation({
  args: { cities: v.array(cityValidator) },
  handler: async (ctx, { cities }) => {
    const user = await getAuthenticatedUser(ctx)

    if (cities.length !== TIME_ZONE_SLOTS) {
      throw new ConvexError(`Pick exactly ${TIME_ZONE_SLOTS} cities`)
    }
    cities.forEach(validateCity)

    await upsertSettings(ctx, user, { timeZoneCities: cities })
  },
})

export const setCalendarCity = mutation({
  args: { city: cityValidator },
  handler: async (ctx, { city }) => {
    const user = await getAuthenticatedUser(ctx)
    validateCity(city)

    await upsertSettings(ctx, user, { calendarCity: city })
  },
})

// Open goals first (oldest first), then completed ones in the order they were completed.
export const getGoals = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx)

    const goals = await ctx.db
      .query('goals')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect()

    const open = goals.filter((goal) => goal.completedAt === undefined)
    const done = goals
      .filter((goal) => goal.completedAt !== undefined)
      .sort((a, b) => a.completedAt! - b.completedAt!)

    return [...open, ...done]
  },
})

export const addGoal = mutation({
  args: { text: v.string() },
  handler: async (ctx, { text }) => {
    const user = await getAuthenticatedUser(ctx)
    const trimmed = text.trim()

    if (!trimmed) throw new ConvexError('Goal is required')
    if (trimmed.length > MAX_GOAL) {
      throw new ConvexError(`Goal must be at most ${MAX_GOAL} characters`)
    }

    const goals = await ctx.db
      .query('goals')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect()

    if (goals.length >= MAX_GOALS) throw new ConvexError(`You can have up to ${MAX_GOALS} goals`)

    return await ctx.db.insert('goals', { userId: user._id, text: trimmed })
  },
})

export const toggleGoal = mutation({
  args: { goalId: v.id('goals') },
  handler: async (ctx, { goalId }) => {
    const user = await getAuthenticatedUser(ctx)
    const goal = await getOwnedGoal(ctx, user, goalId)

    await ctx.db.patch(goal._id, {
      completedAt: goal.completedAt === undefined ? Date.now() : undefined,
    })
  },
})

export const removeGoal = mutation({
  args: { goalId: v.id('goals') },
  handler: async (ctx, { goalId }) => {
    const user = await getAuthenticatedUser(ctx)
    const goal = await getOwnedGoal(ctx, user, goalId)

    await ctx.db.delete(goal._id)
  },
})
