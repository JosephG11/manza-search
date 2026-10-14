import { ConvexError } from 'convex/values'

export function getErrorMessage(error: unknown) {
  return error instanceof ConvexError && typeof error.data === 'string'
    ? error.data
    : 'Unexpected error occurred'
}
