'use client'

import { usePathname, useRouter } from 'next/navigation'
import { DropdownMenu } from '@/features/shared/components/DropdownMenu'
import { cn } from '@/utilities/ui'
import { INDEX_LETTERS, type IndexLetter } from '../../../../convex/indexLetter'

type IndexTableOfContentProps = {
  active: IndexLetter
  letters?: readonly IndexLetter[]
}

export function IndexTableOfContent({ active, letters = INDEX_LETTERS }: IndexTableOfContentProps) {
  const router = useRouter()
  const pathname = usePathname()

  function selectLetter(letter: IndexLetter) {
    router.replace(`${pathname}?letter=${letter}`, { scroll: false })
  }

  return (
    <>
      <aside
        aria-label="Table of Content"
        className={cn(
          'fixed bottom-16 left-0 top-44 z-40 w-28 flex-col rounded-r-xl',
          'border-4 border-black bg-menu hover:bg-black',
          'hidden lg:flex',
        )}
      >
        <div className="mb-2 bg-black px-4 py-2 font-serif text-white underline">
          Table of Content
        </div>

        <ul className="custom-scrollbar flex flex-1 flex-col items-center overflow-y-auto pb-2 font-serif text-white">
          {letters.map((letter) => (
            <li key={letter} className="flex max-h-9 min-h-5 w-full flex-1 px-3">
              <button
                type="button"
                aria-current={letter === active ? 'true' : undefined}
                onClick={() => selectLetter(letter)}
                className={cn(
                  'w-full rounded text-sm uppercase hover:text-secondary-blue',
                  letter === active && 'bg-white font-bold text-black hover:text-black',
                )}
              >
                {letter}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="sticky top-0 z-10 mt-1 lg:hidden">
        <div className="ml-auto flex justify-between px-1">
          <DropdownMenu label="Table of Content">
            <ul className="grid grid-cols-7 gap-1 font-serif text-white">
              {letters.map((letter) => (
                <li key={letter}>
                  <button
                    type="button"
                    aria-current={letter === active ? 'true' : undefined}
                    onClick={() => selectLetter(letter)}
                    className={cn(
                      'size-8 rounded uppercase hover:text-secondary-blue',
                      letter === active && 'bg-white font-bold text-black hover:text-black',
                    )}
                  >
                    {letter}
                  </button>
                </li>
              ))}
            </ul>
          </DropdownMenu>
        </div>
      </div>
    </>
  )
}
