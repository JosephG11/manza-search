import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
  type LucideIcon,
} from 'lucide-react'
import type { CurrentWeather } from '../types'

// WeatherAPI condition codes: https://www.weatherapi.com/docs/weather_conditions.json
const FOG_CODES = [1030, 1135, 1147]
const SNOW_CODES = [1066, 1069, 1114, 1117, 1204, 1207, 1249, 1252, 1255, 1258, 1261, 1264]

function getIcon({ conditionCode: code, isDay }: CurrentWeather): LucideIcon {
  if (code === 1000) return isDay ? Sun : Moon
  if (code === 1003) return isDay ? CloudSun : CloudMoon
  if (code === 1006 || code === 1009) return Cloud
  if (FOG_CODES.includes(code)) return CloudFog
  if (code === 1087 || code >= 1273) return CloudLightning
  if (SNOW_CODES.includes(code) || (code >= 1210 && code <= 1237)) return CloudSnow

  return CloudRain
}

export function WeatherIcon({
  weather,
  className,
}: {
  weather: CurrentWeather | null
  className?: string
}) {
  const Icon = weather ? getIcon(weather) : Sun

  return <Icon className={className} aria-label={weather?.text} />
}
