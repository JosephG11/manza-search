'use client'

import { useCallback } from 'react'
import { useAuth, useClerk } from '@clerk/nextjs'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export function useRequireSignIn() {
  const { isSignedIn } = useAuth()
  const { openSignIn } = useClerk()

  return useCallback(
    (action: () => void) => {
      if (isSignedIn) action()
      else openSignIn()
    },
    [isSignedIn, openSignIn],
  )
}

// Navigation lives in the URL: `?letter=D` lists a letter, `?letter=D&node=<id>` opens a node.
export function useIndexNav() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const letterParam = searchParams.get('letter')
  const nodeParam = searchParams.get('node')

  const go = useCallback(
    (letter: string, nodeId?: string) => {
      const params = new URLSearchParams({ letter })
      if (nodeId) params.set('node', nodeId)

      router.push(`${pathname}?${params}`, { scroll: false })
    },
    [router, pathname],
  )

  return { letterParam, nodeParam, go }
}
