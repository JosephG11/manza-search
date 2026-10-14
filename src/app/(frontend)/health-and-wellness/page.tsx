import React, { Suspense } from 'react'
import PageClient from './page.client'
import { IndexBrowser } from '@/features/indexBrowser/components/IndexBrowser'
import { SectionCarousel } from '@/features/carousel/components/SectionCarousel'

import { BottomMenu } from '@/features/shared/components/BottomMenu'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { HealthAndWellness as HealthAndWellnessGlobalType } from '@/payload-types'
import { SuggestedArticles } from '@/features/shared/components/SuggestedArticles'
import { Metadata } from 'next'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  try {
    const healthAndWellnessData: HealthAndWellnessGlobalType = await getCachedGlobal(
      'health-and-wellness',
      2,
    )()

    const { suggestedArticles } = healthAndWellnessData

    return (
      <section>
        <PageClient />
        <div className="min-h-screen w-full pb-24">
          <SuggestedArticles articles={suggestedArticles} />

          <div className="mx-auto flex w-3/4 justify-center rounded-b-[10px] bg-black md:w-1/2 xl:w-1/3">
            <h2 className="py-2 text-center font-serif text-xl uppercase text-white">
              Health and Wellness HomePage
            </h2>
          </div>

          <SectionCarousel section="healthAndWellness" />

          <Suspense>
            <IndexBrowser section="healthAndWellness" />
          </Suspense>

          <BottomMenu />
        </div>
      </section>
    )
  } catch (error) {
    console.error('Health and Wellness Page Error: ', error)

    return (
      <section>
        <PageClient />
        <div className="flex min-h-screen w-full items-center justify-center">
          <h2 className="text-xl">
            Unable to load health and wellness data. Please try again later.
          </h2>
        </div>
      </section>
    )
  }
}

export function generateMetadata(): Metadata {
  return {
    title: `Health and Wellness | Manza Search`,
  }
}
