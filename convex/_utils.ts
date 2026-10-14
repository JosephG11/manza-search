import { ConvexError } from 'convex/values'
import { MutationCtx, QueryCtx } from './_generated/server'
import { Doc, Id } from './_generated/dataModel'

type getUserByClerkIdProps = {
  ctx: QueryCtx | MutationCtx
  clerkId: string
}

type getConversationByConversationIdProps = {
  ctx: QueryCtx | MutationCtx
  conversationId: Id<'conversations'>
}

export async function getUserByClerkId({ ctx, clerkId }: getUserByClerkIdProps) {
  return await ctx.db
    .query('users')
    .withIndex('by_clerkId', (q) => q.eq('clerkId', clerkId))
    .unique()
}

export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity()

  if (!identity) {
    throw new ConvexError('Unauthorized')
  }

  const currentUser = await getUserByClerkId({
    ctx,
    clerkId: identity.subject,
  })

  if (!currentUser) {
    throw new ConvexError('User not found')
  }

  return currentUser
}

export async function getConversationByConversationId({
  ctx,
  conversationId,
}: getConversationByConversationIdProps) {
  const conversation = await ctx.db.get(conversationId)

  if (!conversation) {
    throw new ConvexError('Conversation not found')
  }

  return conversation
}

// Admins are listed by e-mail in the `ADMIN_EMAILS` Convex env var (comma-separated).
// See docs/admins.md.
export function isAdmin(user: Doc<'users'>) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  return adminEmails.includes(user.email.trim().toLowerCase())
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const user = await getAuthenticatedUser(ctx)

  if (!isAdmin(user)) {
    throw new ConvexError('Unauthorized')
  }

  return user
}
