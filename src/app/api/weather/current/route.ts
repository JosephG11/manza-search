import { NextRequest, NextResponse } from 'next/server'
import { getCurrentWeather } from '@/features/dashboard/weatherApiClient'
import { weatherRateLimit } from '../rateLimit'

function parseCoordinate(value: string | null, max: number) {
  const number = Number(value)

  return value && Number.isFinite(number) && Math.abs(number) <= max ? number : null
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const lat = parseCoordinate(searchParams.get('lat'), 90)
  const lon = parseCoordinate(searchParams.get('lon'), 180)

  if (lat === null || lon === null) {
    return NextResponse.json({ error: 'Invalid "lat"/"lon" query params' }, { status: 400 })
  }

  const limited = weatherRateLimit(request)
  if (limited) return limited

  try {
    return NextResponse.json(await getCurrentWeather(lat, lon))
  } catch (error) {
    console.error('weather current failed:', error)
    return NextResponse.json({ error: 'Weather lookup failed' }, { status: 502 })
  }
}
