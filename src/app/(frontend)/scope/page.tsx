import React, { Suspense } from 'react'
import PageClient from './page.client'
import { Metadata } from 'next'

import { ScopeBrowser } from '@/features/scope/components/ScopeBrowser'
import { SuggestedArticles } from '@/features/shared/components/SuggestedArticles'
import { BottomMenu } from '@/features/shared/components/BottomMenu'

import { getCachedGlobal } from '@/utilities/getGlobals'
import { Scope as ScopeGlobalType } from '@/payload-types'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  try {
    const ScopeData: ScopeGlobalType = await getCachedGlobal('scope', 1)()

    return (
      <section className="mb-24">
        <PageClient />
        <div className="min-h-screen w-full">
          <SuggestedArticles articles={ScopeData.suggestedArticles} />

          <div className="mx-auto flex w-3/4 justify-center rounded-b-[10px] bg-black md:w-1/2 xl:w-1/3">
            <h2 className="py-2 font-serif text-xl uppercase text-white">Scope HomePage</h2>
          </div>

          <Suspense>
            <ScopeBrowser />
          </Suspense>

          <BottomMenu />
        </div>
      </section>
    )
  } catch (error) {
    console.error('Error: ', error)

    return (
      <section className="mb-24">
        <PageClient />
        <div className="flex min-h-screen w-full items-center justify-center">
          <h2 className="text-xl">Unable to load scope data. Please try again later.</h2>
        </div>
      </section>
    )
  }
}

export function generateMetadata(): Metadata {
  return {
    title: `Scope | Manza Search`,
  }
}
