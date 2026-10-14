import 'server-only'
import type {
  WikipediaArticle,
  WikipediaImage,
  WikipediaLetterPage,
  WikipediaSection,
  WikipediaSummary,
} from './types'

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

const SKIPPED_SECTIONS = new Set([
  'references',
  'external links',
  'see also',
  'notes',
  'further reading',
  'bibliography',
  'footnotes',
  'citations',
  'sources',
])
const MAX_IMAGES = 20
const MAX_RELATED = 20
const MAX_SOURCES = 10
const IMAGE_THUMBNAIL_WIDTH = 400
const IGNORED_IMAGE_PATTERN =
  /\.(svg|ogg|ogv|webm|mid|pdf|tif|tiff)$|icon|logo|flag_of|symbol|commons-|edit-|wikidata|ambox/i

type WikipediaArticlePage = WikipediaPage & {
  original?: { source: string }
  links?: { title: string }[]
  extlinks?: { '*': string }[]
}

type WikipediaImageInfoPage = {
  title: string
  imageinfo?: {
    url: string
    thumburl?: string
    width: number
    height: number
    extmetadata?: { ImageDescription?: { value: string } }
  }[]
}

type WikipediaImagesResponse = {
  query?: { pages?: Record<string, WikipediaImageInfoPage> }
}

async function wikipediaFetch<T>(params: Record<string, string>): Promise<T> {
  const res = await fetch(
    `${WIKIPEDIA_API_URL}?${new URLSearchParams({ format: 'json', ...params })}`,
    {
      headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      next: { revalidate: 3600 },
    },
  )

  if (!res.ok) throw new Error(`Wikipedia API responded with ${res.status}`)

  return res.json()
}

function parseSections(extract: string): Pick<WikipediaArticle, 'intro' | 'sections'> {
  const intro: string[] = []
  const sections: WikipediaSection[] = []
  let current: WikipediaSection | null = null
  let skipping = false

  for (const rawLine of extract.split('\n')) {
    const line = rawLine.trim()
    if (!line) continue

    const heading = line.match(/^(={2,6})\s*(.+?)\s*\1$/)
    if (heading) {
      const title = heading[2]!
      skipping = SKIPPED_SECTIONS.has(title.toLowerCase())
      current = skipping ? null : { title, paragraphs: [] }
      if (current) sections.push(current)
      continue
    }

    if (skipping) continue
    if (current) current.paragraphs.push(line)
    else intro.push(line)
  }

  return { intro, sections: sections.filter((section) => section.paragraphs.length > 0) }
}

async function getWikipediaImages(title: string): Promise<WikipediaImage[]> {
  const json = await wikipediaFetch<WikipediaImagesResponse>({
    action: 'query',
    titles: title,
    generator: 'images',
    gimlimit: String(MAX_IMAGES * 2),
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata',
    iiextmetadatafilter: 'ImageDescription',
    iiurlwidth: String(IMAGE_THUMBNAIL_WIDTH),
  })

  return Object.values(json.query?.pages ?? {})
    .filter((page) => !IGNORED_IMAGE_PATTERN.test(page.title))
    .flatMap((page) => {
      const info = page.imageinfo?.[0]
      if (!info || info.width < 200 || info.height < 200) return []

      const description = info.extmetadata?.ImageDescription?.value.replace(/<[^>]*>/g, '').trim()
      const caption = description || page.title.replace(/^File:/, '').replace(/\.\w+$/, '')

      return [
        {
          url: info.url,
          thumbnail: info.thumburl ?? info.url,
          caption,
          width: info.width,
          height: info.height,
        },
      ]
    })
    .slice(0, MAX_IMAGES)
}

export async function getWikipediaArticle(title: string): Promise<WikipediaArticle | null> {
  const json = await wikipediaFetch<{ query?: { pages?: Record<string, WikipediaArticlePage> } }>({
    action: 'query',
    titles: title,
    prop: 'extracts|info|pageimages|links|extlinks',
    explaintext: '1',
    exsectionformat: 'wiki',
    inprop: 'url',
    piprop: 'original',
    pllimit: String(MAX_RELATED * 2),
    plnamespace: '0',
    ellimit: String(MAX_SOURCES),
    redirects: '1',
  })

  const page = Object.values(json.query?.pages ?? {})[0]
  if (!page?.extract || !page.fullurl) return null

  const { intro, sections } = parseSections(page.extract)
  if (intro.length === 0 && sections.length === 0) return null
  if (/\bmay refer to\b/i.test(intro[0] ?? '')) return null

  const images = await getWikipediaImages(page.title).catch(() => [])

  return {
    title: page.title,
    url: page.fullurl,
    heroImage: page.original?.source ?? images[0]?.url ?? null,
    intro,
    sections,
    images,
    related: (page.links ?? []).map((link) => link.title).slice(0, MAX_RELATED),
    sources: (page.extlinks ?? []).slice(0, MAX_SOURCES).map((link) => ({
      label: new URL(link['*'], 'https://en.wikipedia.org').hostname.replace(/^www\./, ''),
      link: link['*'],
    })),
  }
}

const LETTER_PAGE_SIZE = 24
const LETTER_THUMBNAIL_WIDTH = 300

type LetterPage = {
  title: string
  thumbnail?: { source: string }
  pageprops?: { disambiguation?: string }
}

type LetterResponse = {
  query?: { pages?: LetterPage[] }
  continue?: { gapcontinue?: string }
}

const LETTER_MAX_BATCHES = 5

async function fetchLetterBatch(letter: string, cursor?: string) {
  const json = await wikipediaFetch<LetterResponse>({
    action: 'query',
    formatversion: '2',
    generator: 'allpages',
    gapprefix: letter,
    gapnamespace: '0',
    gapfilterredir: 'nonredirects',
    gaplimit: String(LETTER_PAGE_SIZE),
    ...(cursor ? { gapcontinue: cursor } : {}),
    prop: 'pageimages|pageprops',
    piprop: 'thumbnail',
    pithumbsize: String(LETTER_THUMBNAIL_WIDTH),
    pilimit: String(LETTER_PAGE_SIZE),
    ppprop: 'disambiguation',
  })

  const entries = (json.query?.pages ?? [])
    .filter((page) => !page.pageprops || !('disambiguation' in page.pageprops))
    .map((page) => ({ title: page.title, thumbnail: page.thumbnail?.source ?? null }))
    .sort((a, b) => a.title.localeCompare(b.title, 'en'))

  return { entries, nextCursor: json.continue?.gapcontinue ?? null }
}

// Articles starting with `letter`, alphabetically. `cursor` is the title to resume from.
// Wikipedia applies the redirect filter after its page limit, so a batch can come back nearly
// empty; batches are merged until a page is full. Disambiguation pages are dropped so
// ambiguous terms don't show up as cards.
export async function listWikipediaByLetter(
  letter: string,
  cursor?: string,
): Promise<WikipediaLetterPage> {
  const entries: WikipediaLetterPage['entries'] = []
  let nextCursor = cursor ?? null

  for (let batch = 0; batch < LETTER_MAX_BATCHES; batch++) {
    const result = await fetchLetterBatch(letter, nextCursor ?? undefined)

    entries.push(...result.entries)
    nextCursor = result.nextCursor

    if (!nextCursor || entries.length >= LETTER_PAGE_SIZE) break
  }

  return { entries, nextCursor }
}
