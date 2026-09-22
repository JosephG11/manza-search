import { NextRequest, NextResponse } from 'next/server'
import {
  BRAVE_MAX_WEB_PAGE,
  searchImages,
  searchVideos,
  searchWeb,
} from '@/features/webSearch/braveClient'
import { searchManzaArticles } from '@/features/webSearch/manzaArticles'
import { checkRateLimit, getClientIp } from '@/features/webSearch/rateLimit'
import { filterReachable } from '@/features/webSearch/urlCheck'
import type {
  ImageResult,
  ResultsListResponse,
  VideoResult,
  WebPageResponse,
  WebSearchType,
} from '@/features/webSearch/types'

export const maxDuration = 30

const RATE_LIMIT = 30
const RATE_LIMIT_WINDOW_MS = 60_000
const SEARCH_TYPES: WebSearchType[] = ['web', 'images', 'videos']

export async function GET(request: NextRequest) {
  const { searchParams, hostname } = request.nextUrl
  const query = searchParams.get('q')?.trim()
  const type = (searchParams.get('type') ?? 'web') as WebSearchType
  const page = Number(searchParams.get('page') ?? 1)

  if (!query) {
    return NextResponse.json({ error: 'Missing "q" query param' }, { status: 400 })
  }

  if (!SEARCH_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Invalid "type" query param' }, { status: 400 })
  }

  if (!Number.isInteger(page) || page < 1 || page > BRAVE_MAX_WEB_PAGE) {
    return NextResponse.json({ error: 'Invalid "page" query param' }, { status: 400 })
  }

  const { allowed, retryAfterSeconds } = checkRateLimit(
    getClientIp(request),
    RATE_LIMIT,
    RATE_LIMIT_WINDOW_MS,
  )

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } },
    )
  }

  if (type === 'images' || type === 'videos') {
    try {
      const results =
        type === 'images'
          ? await filterReachable(await searchImages(query), (image) => image.thumbnail)
          : await filterReachable(await searchVideos(query), (video) => video.image)
      return NextResponse.json({ results } satisfies ResultsListResponse<ImageResult | VideoResult>)
    } catch (error) {
      console.error(`web-search ${type} failed:`, error)
      return NextResponse.json({ error: 'Search failed' }, { status: 502 })
    }
  }

  const [manza, web] = await Promise.allSettled([
    page === 1 ? searchManzaArticles(query, hostname) : Promise.resolve([]),
    searchWeb(query, page),
  ])

  if (manza.status === 'rejected') console.error('web-search manza failed:', manza.reason)
  if (web.status === 'rejected') {
    console.error('web-search web failed:', web.reason)
    return NextResponse.json({ error: 'Search failed' }, { status: 502 })
  }

  const response: WebPageResponse = {
    results: [...(manza.status === 'fulfilled' ? manza.value : []), ...web.value.results],
    page,
    hasMore: web.value.hasMore,
  }

  return NextResponse.json(response)
}
