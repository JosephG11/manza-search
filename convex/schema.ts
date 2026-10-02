import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { contentTypeValidator, externalContentValidator } from './validators'

export default defineSchema({
  users: defineTable({
    username: v.string(),
    imageUrl: v.string(),
    clerkId: v.string(),
    email: v.string(),
  })
    .index('by_email', ['email'])
    .index('by_clerkId', ['clerkId']),

  requests: defineTable({
    sender: v.id('users'),
    receiver: v.id('users'),
  })
    .index('by_receiver', ['receiver'])
    .index('by_receiver_sender', ['receiver', 'sender']),
  friends: defineTable({
    user1: v.id('users'),
    user2: v.id('users'),
    conversationId: v.id('conversations'),
  })
    .index('by_user1', ['user1'])
    .index('by_user2', ['user2'])
    .index('by_conversationId', ['conversationId']),
  conversations: defineTable({
    name: v.optional(v.string()),
    isGroup: v.boolean(),
    lastMessageId: v.optional(v.id('messages')),
  }),
  conversationMembers: defineTable({
    memberId: v.id('users'),
    conversationId: v.id('conversations'),
    lastSeenMessage: v.optional(v.id('messages')),
  })
    .index('by_memberId', ['memberId'])
    .index('by_conversationId', ['conversationId'])
    .index('by_memberId_conversationId', ['memberId', 'conversationId']),
  messages: defineTable({
    senderId: v.id('users'),
    conversationId: v.id('conversations'),
    type: v.string(),
    content: v.array(v.string()),
  }).index('by_conversationId', ['conversationId']),
  events: defineTable({
    userId: v.id('users'),
    title: v.string(),
    start: v.string(),
    end: v.string(),
    description: v.optional(v.string()),
    allDay: v.optional(v.boolean()),
    alertTime: v.optional(v.string()),
  }).index('by_userId', ['userId']),
  savedContent: defineTable({
    userId: v.id('users'),
    contentId: v.string(),
    contentType: contentTypeValidator,
    external: v.optional(externalContentValidator),
  })
    .index('by_user', ['userId'])
    .index('by_user_content', ['userId', 'contentId']),
  pinnedContent: defineTable({
    userId: v.id('users'),
    contentId: v.string(),
    contentType: contentTypeValidator,
    external: v.optional(externalContentValidator),
    pinnedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_content', ['userId', 'contentId'])
    .index('by_pinnedAt', ['pinnedAt']),
  contentLists: defineTable({
    userId: v.id('users'),
    name: v.string(),
  })
    .index('by_user', ['userId'])
    .index('by_user_name', ['userId', 'name']),
  listedContent: defineTable({
    userId: v.id('users'),
    listId: v.id('contentLists'),
    contentId: v.string(),
    contentType: contentTypeValidator,
    external: v.optional(externalContentValidator),
  })
    .index('by_user', ['userId'])
    .index('by_list', ['listId'])
    .index('by_list_content', ['listId', 'contentId']),
  history: defineTable({
    userId: v.id('users'),
    articleId: v.string(),
    visitedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_visitedAt', ['visitedAt']),
})
