export const INDEX_LETTERS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '#'] as const

export type IndexLetter = (typeof INDEX_LETTERS)[number]

const LEADING_ARTICLES = /^(the|a|an)\s+/i

export function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, ' ')
}

export function toSortKey(name: string) {
  const normalized = normalizeName(name)
  const withoutArticle = normalized.replace(LEADING_ARTICLES, '') || normalized

  return withoutArticle
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

export function toLetter(sortKey: string): IndexLetter {
  const first = sortKey.charAt(0).toUpperCase()

  return /^[A-Z]$/.test(first) ? (first as IndexLetter) : '#'
}

export function isIndexLetter(value: string): value is IndexLetter {
  return (INDEX_LETTERS as readonly string[]).includes(value)
}

export const INDEX_MAX_DEPTH = 3
