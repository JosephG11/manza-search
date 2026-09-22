import React from 'react'

type ResultsStatusProps = {
  isLoading: boolean
  hasError: boolean
  isEmpty: boolean
}

export function ResultsStatus({ isLoading, hasError, isEmpty }: ResultsStatusProps) {
  if (isLoading) return <p className="block text-muted-foreground">Searching the web...</p>
  if (hasError)
    return <p className="block text-muted-foreground">Something went wrong. Try again.</p>
  if (isEmpty) return <p className="block text-muted-foreground">No results found.</p>

  return null
}
