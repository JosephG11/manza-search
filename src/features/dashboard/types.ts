import type { Infer } from 'convex/values'
import type { cityValidator } from '../../../convex/validators'

export type City = Infer<typeof cityValidator>

export type CurrentWeather = {
  tempC: number
  tempF: number
  isDay: boolean
  conditionCode: number
  text: string
}
