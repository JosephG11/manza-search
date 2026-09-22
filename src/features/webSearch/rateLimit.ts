import 'server-only'
import type { NextRequest } from 'next/server'

type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) return (forwardedFor.split(',')[0] ?? forwardedFor).trim()

  return request.headers.get('x-real-ip') ?? 'unknown'
}

/**
 * In-memory sliding-window limiter, scoped to a single server instance.
 * Good enough to blunt casual abuse of a paid third-party API; not a
 * substitute for a shared store if this ever needs to hold across
 * multiple concurrent instances.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) }
  }

  bucket.count += 1
  return { allowed: true, retryAfterSeconds: 0 }
}
