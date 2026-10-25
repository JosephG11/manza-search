import type { FunctionReturnType } from 'convex/server'
import type { api } from '../../../convex/_generated/api'

export type LinkStackTab = FunctionReturnType<typeof api.linkStack.getTabsWithLinks>[number]

export type LinkStackLink = LinkStackTab['links'][number]
