'use node'

import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
import { v } from 'convex/values'
import { internal } from './_generated/api'
import { internalAction } from './_generated/server'

const MAX_REDIRECTS = 3
const TIMEOUT_MS = 3000
const MAX_BYTES = 1_000_000
const MAX_COVER_URL_LENGTH = 2048
const COVER_META_KEYS = ['og:image:secure_url', 'og:image', 'twitter:image']

function isPrivateIPv4(ip: string) {
  const [a = 0, b = 0] = ip.split('.').map(Number)

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19))
  )
}

function isPrivateIp(ip: string) {
  if (isIP(ip) === 4) return isPrivateIPv4(ip)

  const lower = ip.toLowerCase()

  if (lower === '::' || lower === '::1') return true
  if (lower.startsWith('::ffff:')) {
    const mapped = lower.slice('::ffff:'.length)
    return isIP(mapped) === 4 ? isPrivateIPv4(mapped) : true
  }

  return /^(f[cd]|fe[89ab]|ff|64:ff9b:)/.test(lower)
}

async function assertPublicUrl(url: URL) {
  if (url.protocol !== 'https:') throw new Error('Only https is allowed')
  if (url.username || url.password) throw new Error('Credentials are not allowed')
  if (url.port && url.port !== '443') throw new Error('Port is not allowed')

  const hostname = url.hostname.replace(/^\[|\]$/g, '')

  if (/^localhost$|\.(local|internal|localhost)$/i.test(hostname)) {
    throw new Error('Host is not allowed')
  }

  const addresses = isIP(hostname)
    ? [{ address: hostname }]
    : await lookup(hostname, { all: true })

  if (addresses.length === 0 || addresses.some(({ address }) => isPrivateIp(address))) {
    throw new Error('Host is not allowed')
  }
}

async function readLimited(res: Response) {
  const reader = res.body?.getReader()
  if (!reader) return ''

  const decoder = new TextDecoder()
  let received = 0
  let text = ''

  while (received < MAX_BYTES) {
    const { done, value } = await reader.read()
    if (done) break

    received += value.byteLength
    text += decoder.decode(value, { stream: true })
  }

  await reader.cancel().catch(() => {})

  return text
}

async function fetchHtml(startUrl: string) {
  let current = new URL(startUrl)

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicUrl(current)

    const res = await fetch(current, {
      redirect: 'manual',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { 'User-Agent': 'ManzaBot/1.0', Accept: 'text/html' },
    })

    const location = res.headers.get('location')
    if (res.status >= 300 && res.status < 400 && location) {
      current = new URL(location, current)
      continue
    }

    if (!res.ok) return null
    if (!res.headers.get('content-type')?.includes('text/html')) return null

    return { html: await readLimited(res), finalUrl: current }
  }

  return null
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

function findCoverUrl(html: string, baseUrl: URL) {
  const found = new Map<string, string>()

  for (const tag of html.matchAll(/<meta\s[^>]*>/gi)) {
    const attrs = new Map<string, string>()
    for (const attr of tag[0].matchAll(/([a-z:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
      attrs.set(attr[1]!.toLowerCase(), attr[2] ?? attr[3] ?? '')
    }

    const key = (attrs.get('property') ?? attrs.get('name'))?.toLowerCase()
    const content = attrs.get('content')
    if (key && content && COVER_META_KEYS.includes(key) && !found.has(key)) {
      found.set(key, content)
    }
  }

  for (const key of COVER_META_KEYS) {
    const raw = found.get(key)
    if (!raw) continue

    try {
      const cover = new URL(decodeHtmlEntities(raw), baseUrl)
      if (cover.protocol === 'https:' && cover.toString().length <= MAX_COVER_URL_LENGTH) {
        return cover.toString()
      }
    } catch {}
  }

  return null
}

export const fetchCover = internalAction({
  args: { itemId: v.id('indexNodeItems'), link: v.string() },
  handler: async (ctx, { itemId, link }): Promise<void> => {
    try {
      const page = await fetchHtml(link)
      const coverUrl = page && findCoverUrl(page.html, page.finalUrl)

      if (coverUrl) await ctx.runMutation(internal.indexBrowser.setCover, { itemId, coverUrl })
    } catch (error) {
      console.warn('fetchCover failed', link, error instanceof Error ? error.message : error)
    }
  },
})
