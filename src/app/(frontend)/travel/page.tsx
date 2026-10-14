import React, { Suspense } from 'react'
import PageClient from './page.client'
import { IndexBrowser } from '@/features/indexBrowser/components/IndexBrowser'
import { SectionCarousel } from '@/features/carousel/components/SectionCarousel'

import { BottomMenu } from '@/features/shared/components/BottomMenu'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { Travel as TravelGlobalType } from '@/payload-types'
import { SuggestedArticles } from '@/features/shared/components/SuggestedArticles'
import { TravelTitle } from '@/features/travel/components/TravelTitle'
import { Metadata } from 'next'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  try {
    const travelData: TravelGlobalType = await getCachedGlobal('travel', 1)()

    return (
      <section>
        <PageClient />
        <div className="min-h-screen w-full pb-24">
          <SuggestedArticles articles={travelData?.suggestedArticles} />

          <TravelTitle />

          <SectionCarousel section="travel" />

          <Suspense>
            <IndexBrowser section="travel" />
          </Suspense>

          <BottomMenu />
        </div>
      </section>
    )
  } catch (error) {
    console.error('Error: ', error)

    return (
      <section>
        <PageClient />
        <div className="flex min-h-screen w-full items-center justify-center">
          <h2 className="text-xl">Unable to load travel data. Please try again later.</h2>
        </div>
      </section>
    )
  }
}

export function generateMetadata(): Metadata {
  return {
    title: `Travel | Manza Search`,
  }
}
