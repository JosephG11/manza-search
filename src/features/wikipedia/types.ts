export type WikipediaSummary = {
  title: string
  paragraphs: string[]
  url: string
}

export type WikipediaSection = {
  title: string
  paragraphs: string[]
}

export type WikipediaImage = {
  url: string
  thumbnail: string
  caption: string
  width: number
  height: number
}

export type WikipediaSource = {
  label: string
  link: string
}

export type WikipediaArticle = {
  title: string
  url: string
  heroImage: string | null
  intro: string[]
  sections: WikipediaSection[]
  images: WikipediaImage[]
  related: string[]
  sources: WikipediaSource[]
}

export type WikipediaResponse = {
  summary: WikipediaSummary | null
}
