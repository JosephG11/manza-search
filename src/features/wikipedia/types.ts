export type WikipediaSummary = {
  title: string
  paragraphs: string[]
  url: string
}

export type WikipediaResponse = {
  summary: WikipediaSummary | null
}
