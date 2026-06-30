import type { Metadata } from 'next'
import Image from 'next/image'
import { draftMode } from 'next/headers'
import React from 'react'

import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import NotFound from './not-found'
import { RightMenuContainer } from '@/features/shared/components/RightMenu'
import { BottomMenu } from '@/features/shared/components/BottomMenu'
import { RenderHomeBlocks } from '@/blocks/RenderHomeBlocks'
import { Home as HomeGlobalType } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { HomeMenu } from '@/features/home/components/HomeMenu'
import { HomeWelcomeBanner } from '@/features/home/components/HomeWelcomeBanner'
import { HomeSideBoxes } from '@/features/home/components/HomeSideBoxes'
import { DictionaryButton } from '@/features/dictionary/components/DictionaryButton'
import { HomeAd } from '@/features/home/components/HomeAd'
import { cn } from '@/utilities/ui'
import { SuggestedArticles } from '@/features/shared/components/SuggestedArticles'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const { isEnabled: draft } = await draftMode()

  const content: HomeGlobalType = await getCachedGlobal('home', 1)()

  if (!content) {
    return <NotFound />
  }

  const { layout, suggestedArticles, enableLink, link, media } = content

  return (
    <section className={cn('mb-0 h-full pb-4', 'xl:mb-24 xl:h-screen xl:pb-16')}>
      <PageClient />

      {draft && <LivePreviewListener />}

      <SuggestedArticles articles={suggestedArticles} />

      <div className="flex max-h-full w-full flex-col gap-2 px-2">
        <HomeWelcomeBanner />
        <div className="flex flex-1 flex-wrap gap-2 xl:flex-nowrap">
          <HomeSideBoxes />

          <div className="order-3 flex max-h-dvh flex-1 basis-full flex-col xl:order-2 xl:basis-auto">
            <div className="custom-scrollbar mb-20 mt-4 size-full overflow-y-auto rounded-primary border-x-[30px] border-y-[5px] border-black p-4">
              {layout && layout.length > 0 ? (
                <RenderHomeBlocks blocks={layout} />
              ) : (
                <div className="py-4 text-center">No content blocks available</div>
              )}
            </div>
          </div>

          <div className="order-2 mt-4 flex w-auto flex-1 flex-row justify-around gap-2 xl:order-3 xl:flex-col xl:justify-normal">
            <DictionaryButton />

            <div className="flex h-16 w-16 items-center justify-center rounded-primary border border-black bg-black sm:h-32 sm:w-32 xl:h-40 xl:w-40">
              <Image src="/svg/dice.svg" alt="Dice" width={75} height={75} className="invert" />
            </div>
          </div>
        </div>
      </div>

      <RightMenuContainer />

      <BottomMenu />
    </section>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Home | Manza Search`,
  }
}
