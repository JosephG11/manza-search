'use client'

import { useSearchParams } from 'next/navigation'
import { IndexTableOfContent } from '@/features/indexBrowser/components/IndexTableOfContent'
import type { IndexLetter } from '../../../../convex/indexLetter'
import { ScopeWikiGrid } from './ScopeWikiGrid'

const SCOPE_LETTERS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'] as IndexLetter[]
const DEFAULT_LETTER: IndexLetter = 'A'

export function ScopeBrowser() {
  const param = useSearchParams().get('letter')?.toUpperCase()
  const letter = SCOPE_LETTERS.find((candidate) => candidate === param) ?? DEFAULT_LETTER

  return (
    <>
      <IndexTableOfContent active={letter} letters={SCOPE_LETTERS} />

      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 lg:pl-32">
        <ScopeWikiGrid key={letter} letter={letter} />
      </div>
    </>
  )
}
