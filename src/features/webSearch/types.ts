export type WebResult = {
  title: string
  url: string
  description: string
  hostname: string
}

export type ImageResult = {
  title: string
  image: string
  thumbnail: string
  url: string
  source: string
  width: number
  height: number
}

export type VideoResult = {
  title: string
  url: string
  description: string
  image: string
  duration: string
  publisher: string
}

export type WebSearchType = 'web' | 'images' | 'videos'

export type WebPageResponse = {
  results: WebResult[]
  page: number
  hasMore: boolean
}

export type ResultsListResponse<T> = {
  results: T[]
}
