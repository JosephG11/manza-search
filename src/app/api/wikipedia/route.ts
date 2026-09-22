import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/features/webSearch/rateLimit'
import type { WikipediaResponse } from '@/features/wikipedia/types'
import { searchWikipedia } from '@/features/wikipedia/wikipediaClient'

const RATE_LIMIT = 20
const RATE_LIMIT_WINDOW_MS = 60_000

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim()

  if (!query) {
    return NextResponse.json({ error: 'Missing "q" query param' }, { status: 400 })
  }

  const { allowed, retryAfterSeconds } = checkRateLimit(
    `wikipedia:${getClientIp(request)}`,
    RATE_LIMIT,
    RATE_LIMIT_WINDOW_MS,
  )

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } },
    )
  }

  let summary: WikipediaResponse['summary'] = null

  try {
    summary = await searchWikipedia(query)
  } catch (error) {
    console.error('wikipedia search failed:', error)
  }

  return NextResponse.json({ summary } satisfies WikipediaResponse)
}
