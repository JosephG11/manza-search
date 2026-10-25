import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/features/webSearch/rateLimit'

const RATE_LIMIT = 60
const RATE_LIMIT_WINDOW_MS = 60_000

// Returns a 429 response when the client is over the limit, otherwise null.
export function weatherRateLimit(request: NextRequest) {
  const { allowed, retryAfterSeconds } = checkRateLimit(
    `weather:${getClientIp(request)}`,
    RATE_LIMIT,
    RATE_LIMIT_WINDOW_MS,
  )

  if (allowed) return null

  return NextResponse.json(
    { error: 'Too many requests' },
    { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } },
  )
}
