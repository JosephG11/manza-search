import { NextRequest, NextResponse } from 'next/server'
import { searchCities } from '@/features/dashboard/weatherApiClient'
import { weatherRateLimit } from '../rateLimit'

const MIN_QUERY = 2
const MAX_QUERY = 80

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim()

  if (!query || query.length < MIN_QUERY || query.length > MAX_QUERY) {
    return NextResponse.json({ error: 'Invalid "q" query param' }, { status: 400 })
  }

  const limited = weatherRateLimit(request)
  if (limited) return limited

  try {
    return NextResponse.json({ results: await searchCities(query) })
  } catch (error) {
    console.error('weather cities failed:', error)
    return NextResponse.json({ error: 'City search failed' }, { status: 502 })
  }
}
