import type { Metadata } from 'next/types'

import React from 'react'
import PageClient from './page.client'
import { SearchLanding } from '@/features/search/components/SearchLanding'
import { WebSearchResults } from '@/features/webSearch/components/WebSearchResults'
import { BottomMenu } from '@/features/shared/components/BottomMenu'
import { NewListDialog } from '@/features/articles/components/ArticleTopMenu/Lists/NewListDialog'
import { auth } from '@clerk/nextjs/server'

type Args = {
  searchParams: Promise<{
    q: string
  }>
}
export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { q: query } = await searchParamsPromise
  const { userId } = await auth()
  if (!query) {
    return (
      <section className="mb-24">
        <PageClient />
        <div className="min-h-screen w-full">
          <SearchLanding />
        </div>

        <BottomMenu />
      </section>
    )
  }

  return (
    <section className="mb-24">
      <PageClient />
      <div className="min-h-screen w-full space-y-12">
        <div className="mx-auto flex w-3/4 justify-center rounded-b-[10px] bg-black md:w-1/2 xl:w-1/3">
          <h2 className="py-2 font-serif text-xl uppercase text-white">Search</h2>
        </div>

        <WebSearchResults initialQuery={query} />
      </div>

      {userId && <NewListDialog />}

      <BottomMenu />
    </section>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Search | Manza Search`,
  }
}
