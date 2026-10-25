import type { City } from './types'

// Fallback data shown while signed out or before the user picks their own cities and goals.

export const TIME_ZONE_PRESETS: City[] = [
  {
    id: -1,
    name: 'New York',
    region: 'New York',
    country: 'United States of America',
    lat: 40.71,
    lon: -74.01,
    timeZone: 'America/New_York',
  },
  {
    id: -2,
    name: 'Sao Paulo',
    region: 'Sao Paulo',
    country: 'Brazil',
    lat: -23.53,
    lon: -46.62,
    timeZone: 'America/Sao_Paulo',
  },
  {
    id: -3,
    name: 'Tokyo',
    region: 'Tokyo',
    country: 'Japan',
    lat: 35.69,
    lon: 139.69,
    timeZone: 'Asia/Tokyo',
  },
]

export const CALENDAR_PRESET: City = {
  id: -4,
  name: 'Norwalk',
  region: 'Connecticut',
  country: 'United States of America',
  lat: 41.12,
  lon: -73.41,
  timeZone: 'America/New_York',
}

export const GOAL_PRESETS = [
  'Fitness Goal',
  'Test My Eye Sight',
  'Help My Speech',
  'Help Me Sleep',
  'Read More Books',
  'Drink More Water',
]
