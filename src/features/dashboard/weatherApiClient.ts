import 'server-only'
import type { City, CurrentWeather } from './types'

const WEATHER_API_KEY = process.env.WEATHER_API_KEY

const SEARCH_LIMIT = 5
const TIMEOUT_MS = 5000
const DAY_SECONDS = 60 * 60 * 24
const WEATHER_REVALIDATE_SECONDS = 60 * 10

type WeatherApiSearchResponse = Array<{
  id: number
  name: string
  region: string
  country: string
  lat: number
  lon: number
}>

type WeatherApiTimeZoneResponse = {
  location?: { tz_id?: string }
}

type WeatherApiCurrentResponse = {
  current?: {
    temp_c: number
    temp_f: number
    is_day: number
    condition: { text: string; code: number }
  }
}

async function weatherApiFetch<T>(
  endpoint: 'search' | 'timezone' | 'current',
  query: string,
  revalidate: number,
): Promise<T> {
  if (!WEATHER_API_KEY) {
    throw new Error('WEATHER_API_KEY is not set')
  }

  const url = new URL(`https://api.weatherapi.com/v1/${endpoint}.json`)
  url.searchParams.set('key', WEATHER_API_KEY)
  url.searchParams.set('q', query)

  const response = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    next: { revalidate },
  })

  if (!response.ok) {
    throw new Error(`WeatherAPI ${endpoint} failed: ${response.status} ${await response.text()}`)
  }

  return response.json()
}

// WeatherAPI sometimes double-encodes UTF-8 ("MichoacÃ¡n" instead of "Michoacán").
function fixEncoding(text: string): string {
  if (!/[ÃÂ]/.test(text)) return text

  const decoded = Buffer.from(text, 'latin1').toString('utf8')
  return decoded.includes('\uFFFD') ? text : decoded
}

async function getTimeZone(cityId: number): Promise<string | undefined> {
  const json = await weatherApiFetch<WeatherApiTimeZoneResponse>(
    'timezone',
    `id:${cityId}`,
    DAY_SECONDS,
  )

  return json.location?.tz_id
}

// The search endpoint has no time zone, so each match is resolved with a timezone lookup.
export async function searchCities(query: string): Promise<City[]> {
  const matches = await weatherApiFetch<WeatherApiSearchResponse>('search', query, DAY_SECONDS)

  const cities = await Promise.all(
    matches.slice(0, SEARCH_LIMIT).map(async (match) => {
      const timeZone = await getTimeZone(match.id).catch(() => undefined)
      if (!timeZone) return null

      return {
        id: match.id,
        name: fixEncoding(match.name),
        region: fixEncoding(match.region),
        country: fixEncoding(match.country),
        lat: match.lat,
        lon: match.lon,
        timeZone,
      } satisfies City
    }),
  )

  return cities.filter((city) => city !== null)
}

export async function getCurrentWeather(lat: number, lon: number): Promise<CurrentWeather> {
  const json = await weatherApiFetch<WeatherApiCurrentResponse>(
    'current',
    `${lat},${lon}`,
    WEATHER_REVALIDATE_SECONDS,
  )

  if (!json.current) throw new Error('WeatherAPI current returned no data')

  return {
    tempC: json.current.temp_c,
    tempF: json.current.temp_f,
    isDay: json.current.is_day === 1,
    conditionCode: json.current.condition.code,
    text: json.current.condition.text,
  }
}
