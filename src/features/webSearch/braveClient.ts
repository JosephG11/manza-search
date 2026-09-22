import 'server-only'
import type { ImageResult, VideoResult, WebResult } from './types'

const BRAVE_API_KEY = process.env.BRAVE_SEARCH_API_KEY

export const BRAVE_MAX_WEB_PAGE = 10
const WEB_PAGE_SIZE = 10
const IMAGES_COUNT = 100
const VIDEOS_COUNT = 50

type BraveWebResponse = {
  query?: { more_results_available?: boolean }
  web?: {
    results?: Array<{
      title: string
      url: string
      description: string
      meta_url?: { hostname?: string }
    }>
  }
}

type BraveImagesResponse = {
  results?: Array<{
    title: string
    url: string
    source: string
    thumbnail?: { src?: string }
    properties?: { url?: string; width?: number; height?: number }
  }>
}

type BraveVideosResponse = {
  results?: Array<{
    title: string
    url: string
    description: string
    thumbnail?: { src?: string }
    video?: { duration?: string; publisher?: string; creator?: string }
  }>
}

function stripTags(text: string): string {
  return text.replace(/<[^>]*>/g, '')
}

async function braveFetch<T>(
  endpoint: 'web' | 'images' | 'videos',
  query: string,
  { count, offset }: { count: number; offset?: number },
): Promise<T> {
  if (!BRAVE_API_KEY) {
    throw new Error('BRAVE_SEARCH_API_KEY is not set')
  }

  const url = new URL(`https://api.search.brave.com/res/v1/${endpoint}/search`)
  url.searchParams.set('q', query)
  url.searchParams.set('count', String(count))
  if (offset !== undefined) url.searchParams.set('offset', String(offset))

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'X-Subscription-Token': BRAVE_API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`Brave ${endpoint} search failed: ${response.status} ${await response.text()}`)
  }

  return response.json()
}

export async function searchWeb(
  query: string,
  page = 1,
): Promise<{ results: WebResult[]; hasMore: boolean }> {
  const json = await braveFetch<BraveWebResponse>('web', query, {
    count: WEB_PAGE_SIZE,
    offset: page - 1,
  })

  return {
    results: (json.web?.results ?? []).map((r) => ({
      title: r.title,
      url: r.url,
      description: stripTags(r.description),
      hostname: r.meta_url?.hostname ?? new URL(r.url).hostname,
    })),
    hasMore: Boolean(json.query?.more_results_available) && page < BRAVE_MAX_WEB_PAGE,
  }
}

export async function searchImages(query: string): Promise<ImageResult[]> {
  const json = await braveFetch<BraveImagesResponse>('images', query, { count: IMAGES_COUNT })

  return (json.results ?? []).map((r) => ({
    title: r.title,
    image: r.properties?.url ?? '',
    thumbnail: r.thumbnail?.src ?? '',
    url: r.url,
    source: r.source,
    width: r.properties?.width ?? 0,
    height: r.properties?.height ?? 0,
  }))
}

export async function searchVideos(query: string): Promise<VideoResult[]> {
  const json = await braveFetch<BraveVideosResponse>('videos', query, { count: VIDEOS_COUNT })

  return (json.results ?? []).map((r) => ({
    title: r.title,
    url: r.url,
    description: stripTags(r.description),
    image: r.thumbnail?.src ?? '',
    duration: r.video?.duration ?? '',
    publisher: r.video?.publisher ?? r.video?.creator ?? '',
  }))
}
