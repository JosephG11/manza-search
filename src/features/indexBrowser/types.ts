import type { FunctionReturnType } from 'convex/server'
import type { api } from '../../../convex/_generated/api'
import type { Doc, Id } from '../../../convex/_generated/dataModel'

export type IndexSection = Doc<'indexNodes'>['section']

export type IndexViewer = { userId: Id<'users'>; isAdmin: boolean } | null

export type IndexNode = Doc<'indexNodes'>

export type IndexNodeItem = Doc<'indexNodeItems'>

export type NodeEntry = FunctionReturnType<typeof api.indexBrowser.listNodes>['page'][number]

export type NodeDetails = NonNullable<FunctionReturnType<typeof api.indexBrowser.getNode>>
