import 'server-only'
import { isIP } from 'node:net'

const CHECK_TIMEOUT_MS = 3000
const CHECK_CONCURRENCY = 25
const USER_AGENT = 'manza-search/1.0 (https://github.com/periottocosta)'

function isPrivateIPv4(ip: string): boolean {
  const [a = 0, b = 0] = ip.split('.').map(Number)

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  )
}

/**
 * Guards the server-side probe against SSRF: only http(s) to public-looking hosts.
 * Does not resolve DNS, so a public name pointing at a private IP is not caught;
 * redirects are never followed, which covers the common redirect-to-internal case.
 */
function isPublicHttpUrl(rawUrl: string): boolean {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return false
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false

  const hostname = url.hostname.toLowerCase()
  if (hostname === 'localhost' || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    return false
  }

  const ipVersion = isIP(hostname.replace(/^\[|\]$/g, ''))
  if (ipVersion === 6) return false
  if (ipVersion === 4) return !isPrivateIPv4(hostname)

  return true
}

async function isReachable(rawUrl: string): Promise<boolean> {
  if (!rawUrl || !isPublicHttpUrl(rawUrl)) return false

  try {
    const response = await fetch(rawUrl, {
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
      headers: { Accept: 'image/*', 'User-Agent': USER_AGENT },
    })
    // Only the status matters; drop the body instead of downloading the whole file.
    await response.body?.cancel()

    return response.status === 200
  } catch {
    return false
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let nextIndex = 0

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex++
      results[index] = await fn(items[index]!)
    }
  })

  await Promise.all(workers)
  return results
}

/** Keeps only the items whose URL answers with exactly HTTP 200. */
export async function filterReachable<T>(items: T[], getUrl: (item: T) => string): Promise<T[]> {
  const checks = await mapWithConcurrency(items, CHECK_CONCURRENCY, (item) =>
    isReachable(getUrl(item)),
  )

  return items.filter((_, index) => checks[index])
}
