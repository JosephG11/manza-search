import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/features/webSearch/rateLimit'
import { listWikipediaByLetter } from '@/features/wikipedia/wikipediaClient'

const RATE_LIMIT = 60
const RATE_LIMIT_WINDOW_MS = 60_000
const MAX_CURSOR_LENGTH = 300

export async function GET(request: NextRequest) {
  const letter = request.nextUrl.searchParams.get('letter')?.toUpperCase()
  const cursor = request.nextUrl.searchParams.get('cursor') ?? undefined

  if (!letter || !/^[A-Z]$/.test(letter)) {
    return NextResponse.json({ error: 'Invalid "letter" query param' }, { status: 400 })
  }

  if (cursor && cursor.length > MAX_CURSOR_LENGTH) {
    return NextResponse.json({ error: 'Invalid "cursor" query param' }, { status: 400 })
  }

  const { allowed, retryAfterSeconds } = checkRateLimit(
    `wikipedia-letter:${getClientIp(request)}`,
    RATE_LIMIT,
    RATE_LIMIT_WINDOW_MS,
  )

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } },
    )
  }

  try {
    const page = await listWikipediaByLetter(letter, cursor)

    return NextResponse.json(page, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
    })
  } catch (error) {
    console.error('wikipedia letter listing failed:', error)

    return NextResponse.json({ error: 'Wikipedia is unavailable' }, { status: 502 })
  }
}
