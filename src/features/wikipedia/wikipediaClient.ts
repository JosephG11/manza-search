import 'server-only'
import type { WikipediaSummary } from './types'

const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php'
const USER_AGENT = 'manza-search/1.0 (https://github.com/periottocosta)'
const REQUEST_TIMEOUT_MS = 5000
const MAX_PARAGRAPHS = 2
const MAX_PARAGRAPH_LENGTH = 500

type WikipediaPage = {
  title: string
  extract?: string
  fullurl?: string
}

type WikipediaQueryResponse = {
  query?: { pages?: Record<string, WikipediaPage> }
}

function truncateAtSentence(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text

  const slice = text.slice(0, maxLength)
  const lastSentenceEnd = Math.max(
    slice.lastIndexOf('. '),
    slice.lastIndexOf('! '),
    slice.lastIndexOf('? '),
  )

  return lastSentenceEnd > maxLength / 2
    ? slice.slice(0, lastSentenceEnd + 1)
    : `${slice.trimEnd()}…`
}

export async function searchWikipedia(query: string): Promise<WikipediaSummary | null> {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrsearch: query,
    gsrlimit: '1',
    prop: 'extracts|info',
    exintro: '1',
    explaintext: '1',
    inprop: 'url',
    redirects: '1',
  })

  const res = await fetch(`${WIKIPEDIA_API_URL}?${params}`, {
    headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    next: { revalidate: 3600 },
  })

  if (!res.ok) throw new Error(`Wikipedia API responded with ${res.status}`)

  const json: WikipediaQueryResponse = await res.json()
  const page = Object.values(json.query?.pages ?? {})[0]

  if (!page?.extract || !page.fullurl) return null

  const paragraphs = page.extract
    .split('\n')
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .slice(0, MAX_PARAGRAPHS)
    .map((paragraph) => truncateAtSentence(paragraph, MAX_PARAGRAPH_LENGTH))

  if (paragraphs.length === 0) return null
  if (/\bmay refer to\b/i.test(paragraphs[0]!)) return null

  return { title: page.title, paragraphs, url: page.fullurl }
}
